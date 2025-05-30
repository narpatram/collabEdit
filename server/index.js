const WebSocket = require('ws');
const http = require('http');

// Create HTTP server
const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('WebSocket server is running');
});

// Create WebSocket server
const wss = new WebSocket.Server({ 
  server,
  clientTracking: true,
  verifyClient: (info) => {
    console.log('🔍 WebSocket upgrade attempt:', {
      origin: info.origin,
      secure: info.secure,
      host: info.req.headers.host,
      userAgent: info.req.headers['user-agent']?.substring(0, 50),
      url: info.req.url,
      ip: info.req.connection.remoteAddress
    });
    return true; // Accept all connections
  }
});

// Add more detailed connection logging
wss.on('listening', () => {
  console.log('🎧 WebSocket server is now listening for connections');
});

wss.on('error', (error) => {
  console.error('❌ WebSocket server error:', error);
});

// Store connected clients with user info
const clients = new Map();
let documentContent = '';
let connectionCounter = 0;

// Store document formatting and cursor positions
let documentFormatting = {
  alignment: 'left',
  fontSize: '14',
  fontFamily: 'Arial',
  bold: false,
  italic: false,
  underline: false,
  color: '#000000',
  lineHeight: '1.6'
};
const cursorPositions = new Map();

console.log('Starting WebSocket server...');

// Heartbeat interval - check every 30 seconds
const HEARTBEAT_INTERVAL = 30000;

wss.on('connection', (ws, req) => {
  connectionCounter++;
  const clientId = `user_${connectionCounter}_${Math.random().toString(36).substr(2, 6)}`;
  const userName = `User ${connectionCounter}`;
  const userColor = '#' + Math.floor(Math.random()*16777215).toString(16);
  const clientIP = req.connection.remoteAddress;
  
  console.log(`👤 Client connected: ${clientId} from ${clientIP} (Total connections: ${connectionCounter})`);
  
  // Check if this IP already has a connection (possible duplicate)
  const existingConnections = Array.from(clients.values()).filter(
    client => client.ip === clientIP && client.ws.readyState === WebSocket.OPEN
  );
  
  if (existingConnections.length > 0) {
    console.log(`⚠️ Warning: ${clientIP} already has ${existingConnections.length} active connection(s)`);
  }
  
  // Store the client with user info
  clients.set(clientId, {
    ws,
    isAlive: true,
    lastPing: Date.now(),
    id: clientId,
    name: userName,
    color: userColor,
    ip: clientIP,
    connectedAt: new Date().toISOString(),
    cursorPosition: 0,
    selectionStart: 0,
    selectionEnd: 0
  });

  // Initialize cursor position for this client
  cursorPositions.set(clientId, {
    position: 0,
    selectionStart: 0,
    selectionEnd: 0,
    lastUpdate: Date.now()
  });

  // Set up heartbeat
  ws.isAlive = true;
  ws.on('pong', () => {
    ws.isAlive = true;
    const client = clients.get(clientId);
    if (client) {
      client.lastPing = Date.now();
    }
  });

  // Send initial state with current document and all connected users
  const currentUsers = Array.from(clients.values())
    .filter(client => client.ws.readyState === WebSocket.OPEN)
    .map(client => ({
      id: client.id,
      name: client.name,
      color: client.color
    }));

  const initialMessage = {
    type: 'init',
    content: documentContent,
    clientId: clientId,
    clients: currentUsers,
    formatting: documentFormatting,
    cursors: Object.fromEntries(
      Array.from(cursorPositions.entries()).filter(([id]) => id !== clientId)
    )
  };
  
  try {
    ws.send(JSON.stringify(initialMessage));
    console.log(`✅ Sent initial state to ${clientId} with ${currentUsers.length} users`);
  } catch (error) {
    console.error(`❌ Error sending initial message to ${clientId}:`, error);
    clients.delete(clientId);
    return;
  }

  // Broadcast new user joined to all OTHER clients (not the new one)
  const activeClients = Array.from(clients.values()).filter(
    client => client.id !== clientId && client.ws.readyState === WebSocket.OPEN
  );
  
  console.log(`📡 Broadcasting user_joined to ${activeClients.length} other clients`);
  broadcastToAll({
    type: 'user_joined',
    user: {
      id: clientId,
      name: userName,
      color: userColor
    }
  }, clientId);

  // Handle incoming messages
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log(`📨 Message from ${clientId}: ${data.type}`);
      
      // Handle content changes
      if (data.type === 'content_change') {
        documentContent = data.content;
        broadcastToAll({
          type: 'content_update',
          content: data.content,
          from: clientId
        }, clientId);
      } 
      // Handle cursor position updates
      else if (data.type === 'cursor_update') {
        cursorPositions.set(clientId, {
          position: data.position || 0,
          selectionStart: data.selectionStart || 0,
          selectionEnd: data.selectionEnd || 0,
          lastUpdate: Date.now()
        });
        
        // Update client data
        const client = clients.get(clientId);
        if (client) {
          client.cursorPosition = data.position || 0;
          client.selectionStart = data.selectionStart || 0;
          client.selectionEnd = data.selectionEnd || 0;
        }
        
        broadcastToAll({
          type: 'cursor_position',
          clientId: clientId,
          position: data.position || 0,
          selectionStart: data.selectionStart || 0,
          selectionEnd: data.selectionEnd || 0,
          userColor: userColor
        }, clientId);
      }
      // Handle formatting changes
      else if (data.type === 'formatting_change') {
        documentFormatting = { ...documentFormatting, ...data.formatting };
        broadcastToAll({
          type: 'formatting_update',
          formatting: documentFormatting,
          from: clientId
        }, clientId);
      }
      else {
        // Forward other messages
        broadcastToAll(data, clientId);
      }
    } catch (error) {
      console.error(`Error processing message from ${clientId}:`, error);
    }
  });

  // Handle client disconnect
  ws.on('close', (code, reason) => {
    console.log(`👋 Client disconnected: ${clientId} (${code})`);
    clients.delete(clientId);
    cursorPositions.delete(clientId);
    
    // Broadcast user left
    broadcastToAll({
      type: 'user_left',
      clientId: clientId
    });
    
    console.log(`👥 Active clients: ${clients.size}`);
  });

  // Handle errors
  ws.on('error', (error) => {
    console.error(`❌ Client error: ${clientId}`, error.message);
    // Clean up client on error
    clients.delete(clientId);
    cursorPositions.delete(clientId);
  });
});

// Heartbeat to keep connections alive and clean up dead connections
const interval = setInterval(() => {
  const deadConnections = [];
  
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) {
      console.log('💀 Terminating inactive connection');
      deadConnections.push(ws);
      return ws.terminate();
    }
    
    ws.isAlive = false;
    ws.ping();
  });

  // Clean up client entries for terminated connections
  deadConnections.forEach(ws => {
    clients.forEach((client, id) => {
      if (client.ws === ws) {
        console.log(`🧹 Cleaning up dead client: ${id}`);
        clients.delete(id);
        broadcastToAll({
          type: 'user_left',
          clientId: id
        });
      }
    });
  });

  console.log(`💓 Heartbeat check: ${clients.size} active clients`);
}, HEARTBEAT_INTERVAL);

// Clean up on server close
wss.on('close', () => {
  clearInterval(interval);
});

// Broadcast function
function broadcastToAll(message, excludeClientId = null) {
  let sentCount = 0;
  clients.forEach((client, id) => {
    if (id !== excludeClientId && client.ws.readyState === WebSocket.OPEN) {
      try {
        client.ws.send(JSON.stringify(message));
        sentCount++;
      } catch (error) {
        console.error(`❌ Error broadcasting to ${id}:`, error);
        // Remove client if send fails
        clients.delete(id);
      }
    }
  });
  
  if (message.type !== 'content_update') {
    console.log(`📡 Broadcasted ${message.type} to ${sentCount} clients`);
  }
}

const PORT = process.env.PORT || 8080;
const HOST = 'localhost';

// Handle server errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use!`);
    console.error('Please kill the process using this port or use a different port.');
    console.error('Run: netstat -ano | findstr :8080 to find the process');
    process.exit(1);
  } else {
    console.error('Server error:', error);
  }
});

// Start server
server.listen(PORT, HOST, () => {
  console.log('✅ WebSocket Server Started');
  console.log(`🚀 Server: http://${HOST}:${PORT}`);
  console.log(`📡 WebSocket: ws://${HOST}:${PORT}`);
  console.log(`👥 Connected clients: ${clients.size}`);
}); 