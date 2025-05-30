import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { UsersList } from './components/UsersList';
import { Editor } from './components/Editor';
import { useWebSocket } from './hooks/useWebSocket';
import config from './config';

function App() {
  const [content, setContent] = useState('');
  const [users, setUsers] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [formatting, setFormatting] = useState({
    alignment: 'left',
    fontSize: '14',
    fontFamily: 'Arial',
    bold: false,
    italic: false,
    underline: false,
    color: '#000000',
    lineHeight: '1.6'
  });
  const [cursors, setCursors] = useState({});

  const handleWebSocketMessage = useCallback((data) => {
    console.log('📥 Received message:', data.type);
    
    // Dispatch event for Editor component to listen to
    window.dispatchEvent(new CustomEvent('websocket-message', { detail: data }));
    
    switch (data.type) {
      case 'init':
        // Initial connection - set everything up
        setCurrentUserId(data.clientId);
        setContent(data.content || '');
        setUsers(data.clients || []);
        if (data.formatting) {
          setFormatting(data.formatting);
        }
        if (data.cursors) {
          setCursors(data.cursors);
        }
        console.log(`👤 Connected as ${data.clientId}, ${data.clients?.length || 0} users online`);
        break;

      case 'content_update':
        // Content update from another user
        if (data.from !== currentUserId) {
          setContent(data.content || '');
        }
        break;

      case 'cursor_update':
        // Cursor position update from another user
        console.log('📍 Cursor update received:', data);
        if (data.from !== currentUserId) {
          setCursors(prev => {
            const newCursors = {
              ...prev,
              [data.from]: {
                position: data.position,
                timestamp: Date.now()
              }
            };
            console.log('📍 Updated cursors state:', newCursors);
            return newCursors;
          });
          
          // Also dispatch to Editor component
          window.dispatchEvent(new CustomEvent('websocket-message', { 
            detail: { 
              type: 'cursor_position', 
              cursors: {
                ...cursors,
                [data.from]: {
                  position: data.position,
                  timestamp: Date.now()
                }
              }
            } 
          }));
        }
        break;

      case 'formatting_update':
        // Formatting update from another user
        if (data.from !== currentUserId) {
          setFormatting(data.formatting);
        }
        break;

      case 'user_joined':
        // New user joined
        if (data.user && data.user.id !== currentUserId) {
          setUsers(prev => {
            // Check if user already exists to avoid duplicates
            const exists = prev.some(user => user.id === data.user.id);
            if (!exists) {
              console.log(`👋 User joined: ${data.user.name}`);
              return [...prev, data.user];
            }
            return prev;
          });
        }
        break;

      case 'user_left':
        // User disconnected
        if (data.clientId && data.clientId !== currentUserId) {
          setUsers(prev => {
            const filtered = prev.filter(user => user.id !== data.clientId);
            console.log(`👋 User left: ${data.clientId}`);
            return filtered;
          });
          // Remove cursor position for disconnected user
          setCursors(prev => {
            const updated = { ...prev };
            delete updated[data.clientId];
            return updated;
          });
        }
        break;

      default:
        console.log('🔍 Unknown message type:', data.type);
    }
  }, [currentUserId, cursors]);

  const { connectionState, sendMessage, reconnect } = useWebSocket({
    url: config.wsUrl,
    onMessage: handleWebSocketMessage,
  });

  const handleContentChange = useCallback((newContent) => {
    setContent(newContent);
  }, []);

  if (connectionState.isConnecting && !currentUserId) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">⚡</div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Connecting to Collaborative Editor
          </h2>
          <p className="text-gray-500">Establishing real-time connection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col overflow-hidden">
      <Header connectionState={connectionState} onReconnect={reconnect} />
      <UsersList users={users} currentUserId={currentUserId} />
      <Editor
        content={content}
        isConnected={connectionState.isConnected}
        onContentChange={handleContentChange}
        sendMessage={sendMessage}
        users={users}
        currentUserId={currentUserId}
        cursors={cursors}
      />
    </div>
  );
}

export default App;
