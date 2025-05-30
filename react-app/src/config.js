// Configuration for different environments
const config = {
  // WebSocket URL - uses environment variable or falls back to localhost for development
  wsUrl: import.meta.env.VITE_WS_URL || 'ws://localhost:8080',
  
  // Other configuration options can be added here
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};

export default config; 