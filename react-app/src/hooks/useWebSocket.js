import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * @typedef {import('../types').WebSocketMessage} WebSocketMessage
 * @typedef {import('../types').ConnectionState} ConnectionState
 */

/**
 * @param {Object} props
 * @param {string} props.url
 * @param {function(WebSocketMessage): void} props.onMessage
 */
export const useWebSocket = ({ url, onMessage }) => {
  const [connectionState, setConnectionState] = useState({
    isConnected: false,
    isConnecting: false,
    error: null,
  });

  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const onMessageRef = useRef(onMessage);
  const shouldConnectRef = useRef(true);

  // Update the message handler ref when it changes
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  const disconnect = useCallback(() => {
    console.log('🔌 Disconnecting WebSocket...');
    shouldConnectRef.current = false;
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      // Remove event listeners to prevent callbacks
      wsRef.current.onopen = null;
      wsRef.current.onmessage = null;
      wsRef.current.onclose = null;
      wsRef.current.onerror = null;
      
      if (wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close(1000, 'Client disconnecting');
      }
      wsRef.current = null;
    }
    
    setConnectionState({
      isConnected: false,
      isConnecting: false,
      error: null,
    });
  }, []);

  const connect = useCallback(() => {
    // Don't connect if we're already connected or if we shouldn't connect
    if (!shouldConnectRef.current || wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    // Don't connect if already connecting
    if (wsRef.current?.readyState === WebSocket.CONNECTING) {
      return;
    }

    console.log('🔗 Connecting to WebSocket...');
    setConnectionState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      wsRef.current = new WebSocket(url);

      wsRef.current.onopen = () => {
        if (!shouldConnectRef.current) return;
        
        console.log('✅ Connected to WebSocket server');
        setConnectionState({
          isConnected: true,
          isConnecting: false,
          error: null,
        });
      };

      wsRef.current.onmessage = (event) => {
        if (!shouldConnectRef.current) return;
        
        try {
          const data = JSON.parse(event.data);
          onMessageRef.current(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      wsRef.current.onclose = (event) => {
        console.log(`❌ WebSocket connection closed: ${event.code}`);
        setConnectionState(prev => ({
          ...prev,
          isConnected: false,
          isConnecting: false,
        }));

        // Only auto-reconnect if we should still be connected and it wasn't a normal closure
        if (shouldConnectRef.current && event.code !== 1000) {
          console.log('🔄 Auto-reconnecting in 5 seconds...');
          reconnectTimeoutRef.current = setTimeout(() => {
            if (shouldConnectRef.current) {
              connect();
            }
          }, 5000); // Increased to 5 seconds to be less aggressive
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        setConnectionState(prev => ({
          ...prev,
          isConnected: false,
          isConnecting: false,
          error: 'Connection failed',
        }));
      };
    } catch (error) {
      console.error('❌ Error creating WebSocket:', error);
      setConnectionState(prev => ({
        ...prev,
        isConnecting: false,
        error: 'Failed to create connection',
      }));
    }
  }, [url]);

  const sendMessage = useCallback((message) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('⚠️ Cannot send message: WebSocket not connected');
    }
  }, []);

  // Manual reconnect function
  const reconnect = useCallback(() => {
    console.log('🔄 Manual reconnect requested...');
    disconnect();
    setTimeout(() => {
      shouldConnectRef.current = true;
      connect();
    }, 1000);
  }, [disconnect, connect]);

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    shouldConnectRef.current = true;
    connect();

    return () => {
      shouldConnectRef.current = false;
      disconnect();
    };
  }, [url]); // Only depend on URL

  return {
    connectionState,
    sendMessage,
    reconnect,
    disconnect,
  };
}; 