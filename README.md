# 📝 Collaborative Text Editor

A real-time collaborative text editor built with **React 19 + Vite** frontend and **Node.js WebSocket** backend. Features live cursor tracking, rich text formatting, and seamless real-time collaboration.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/React-19.1.0-blue.svg)
![Node](https://img.shields.io/badge/Node.js-16+-green.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## ✨ Features

### 🤝 Real-time Collaboration
- 🚀 **Real-time collaboration** - Multiple users can edit simultaneously
- 👀 **Live cursor tracking** - See where other users are typing in real-time with colored cursors
- 👥 **User presence** - Enhanced user list showing who's online with animated indicators
- ⚡ **Fast performance** - Built with Vite 6.3.5 and Tailwind CSS v4.1.8
- 🔄 **Auto-reconnection** - Handles connection drops gracefully
- 💾 **In-memory state** - Document state and formatting persist across connections

### 🎨 Rich Text Formatting
- **Text styling**: Bold, italic, and underline formatting
- **Text selection formatting**: Apply formatting to selected text only or entire document
- **Text alignment**: Left, center, right, and justify alignment options
- **Typography controls**: 
  - Font family selection (Arial, Georgia, Times New Roman, Helvetica, Courier New)
  - Font size adjustment (10px to 32px)
  - Line height control (1.2, 1.4, 1.6, 2.0)
- **Color customization**:
  - Custom color picker for text
  - Quick color presets (Black, Red, Blue, Green, Orange, Purple)
- **Real-time formatting sync**: All formatting changes are shared across users
- **ContentEditable editor**: Rich text editing with proper HTML formatting support

### ⌨️ Keyboard Shortcuts & History
- **Undo/Redo functionality**: Complete history tracking with 50-step memory
- **Cross-platform shortcuts**: 
  - **Undo**: `Ctrl+Z` (Windows/Linux) or `Cmd+Z` (Mac)
  - **Redo**: `Ctrl+Y` (Windows/Linux) or `Cmd+Y` (Mac)
  - **Alternative Redo**: `Ctrl+Shift+Z` (Windows/Linux) or `Cmd+Shift+Z` (Mac)
- **Text formatting shortcuts**:
  - **Bold**: `Ctrl+B` (Windows/Linux) or `Cmd+B` (Mac)
  - **Italic**: `Ctrl+I` (Windows/Linux) or `Cmd+I` (Mac)
  - **Underline**: `Ctrl+U` (Windows/Linux) or `Cmd+U` (Mac)
- **Smart history management**: Automatically saves content states with cursor positions
- **Visual indicators**: Toolbar buttons show undo/redo availability and formatting state

### 👥 Enhanced User Experience
- 🎨 **Modern UI** - Beautiful glassmorphism design with gradient backgrounds
- 📱 **Mobile-friendly** - Responsive design optimized for all screen sizes
- 🎯 **Visual feedback** - Clear connection status and user activity indicators
- ⌨️ **Keyboard shortcuts** - Standard formatting shortcuts support
- 🌟 **Smooth animations** - Polished cursor tracking and UI transitions

## 🏗️ Project Structure

```
collaborative-editor/
├── react-app/                    # React + Vite frontend
│   ├── src/
│   │   ├── components/           # React components
│   │   │   ├── Editor.jsx        # Main collaborative editor (664 lines)
│   │   │   ├── UsersList.jsx     # User presence display (124 lines)
│   │   │   ├── Header.jsx        # Connection status header (151 lines)
│   │   │   └── Select.jsx        # Custom dropdown component (50 lines)
│   │   ├── hooks/                # Custom React hooks
│   │   │   └── useWebSocket.js   # WebSocket connection logic
│   │   ├── types/                # TypeScript definitions
│   │   │   └── index.js          # Type definitions and JSDoc
│   │   ├── assets/               # Static assets
│   │   ├── App.jsx               # Main application (170 lines)
│   │   ├── main.jsx              # Application entry point
│   │   └── index.css             # Global styles with Tailwind
│   ├── package.json              # Frontend dependencies
│   ├── vite.config.js            # Vite configuration
│   ├── eslint.config.js          # ESLint configuration
│   └── index.html                # HTML template
├── server/                       # Node.js WebSocket server
│   ├── index.js                  # WebSocket server (327 lines)
│   ├── package.json              # Server dependencies
│   └── package-lock.json         # Dependency lock file
└── README.md                     # This file
```

## 🚀 Getting Started

### Prerequisites
- **Node.js 16+** installed on your system
- **npm** package manager
- Modern web browser with WebSocket support

### 1. Start the WebSocket Server

```bash
cd server
npm install
npm start
```

Server will run on `http://localhost:8080`

For development with auto-restart:
```bash
npm run dev  # Uses nodemon
```

### 2. Start the React App

```bash
cd react-app  
npm install
npm run dev
```

React app will run on `http://localhost:5173` (or next available port)

### 3. Open Multiple Tabs

Open the React app in multiple browser tabs to test collaborative editing with cursor tracking and formatting!

## 🛠️ Tech Stack

### **Frontend Technologies**
- **React 19.1.0** - Latest React with modern features
- **Vite 6.3.5** - Ultra-fast build tool and dev server
- **Tailwind CSS 4.1.8** - Utility-first CSS framework
- **Lucide React 0.511.0** - Beautiful icon library
- **ESLint 9.25.0** - Code linting and quality
- **PostCSS 8.5.4** - CSS processing
- **Autoprefixer 10.4.21** - CSS vendor prefixing

### **Backend Technologies**
- **Node.js** - JavaScript runtime
- **ws 8.16.0** - WebSocket library
- **HTTP Server** - Built-in Node.js server
- **Nodemon 3.1.0** - Development auto-restart

### **Development Tools**
- **Vite Plugins** - React and Tailwind integration
- **Modern JavaScript** - ES2020+ with proper transpilation
- **TypeScript Support** - Type safety with JSDoc comments
- **Hot Module Replacement** - Instant development updates

## 🎯 Key Features Explained

### Real-Time Cursor Tracking
- Live cursor position visualization for all connected users
- Color-coded cursors matching user colors and names
- Smooth cursor animations and precise positioning
- User name labels displayed above cursors
- Cursor timeout handling for disconnected users

### Rich Text Formatting
- Comprehensive formatting toolbar with visual feedback
- Real-time formatting synchronization across all users
- Persistent formatting state that survives reconnections
- Intuitive controls for typography and styling
- Support for text selection-based formatting

### Enhanced Collaboration
- **300ms debounce** for content updates to optimize performance
- **100ms cursor position** updates for smooth tracking
- **500ms history timeout** for intelligent undo/redo grouping
- Automatic conflict resolution for simultaneous edits
- Graceful handling of user connections and disconnections
- **Heartbeat system** (30-second intervals) for connection health

### User ID Generation
- **Format**: `user_{connectionCounter}_{randomString}`
- **Example**: `user_1_a3k9m2`, `user_2_x7p4q8`
- **Uniqueness**: Connection counter + 6-character base-36 random string
- **Collision Resistance**: 2.1 billion possible combinations per session

## 🧩 Component Architecture

### **React App Components**
- **`App.jsx`** - Main application with state management and WebSocket integration
- **`Header.jsx`** - Connection status display with user count and branding
- **`UsersList.jsx`** - Live user presence with colored indicators and activity status
- **`Editor.jsx`** - Rich text editor with formatting toolbar and collaborative features
- **`Select.jsx`** - Custom dropdown component for font/size/spacing selection

### **Server Architecture**
- **WebSocket Server** - Handles real-time connections and message broadcasting
- **Client Management** - Tracks user sessions with ID generation and heartbeat monitoring
- **State Management** - Maintains document content, formatting, and cursor positions
- **Message Protocol** - Custom protocol for different collaboration events

## 📦 Installation & Development

### **Quick Setup**
```bash
# Clone repository
git clone <your-repository-url>
cd collaborative-editor

# Terminal 1: Start server
cd server && npm install && npm start

# Terminal 2: Start React app (in new terminal)
cd react-app && npm install && npm run dev
```

### **Development Mode**
```bash
# Server with auto-restart
cd server && npm run dev

# React with HMR
cd react-app && npm run dev
```

### **Production Build**
```bash
cd react-app
npm run build
npm run preview  # Preview production build
```

## 🎮 Usage Guide

### **Basic Editing**
1. **Type anywhere** in the editor to start collaborating
2. **Select text** and use the formatting toolbar to apply styles
3. **Use keyboard shortcuts** for quick formatting (Ctrl+B, Ctrl+I, etc.)
4. **Try undo/redo** with Ctrl+Z and Ctrl+Y
5. **Experiment with fonts, sizes, and colors** using the dropdown menus

### **Collaborative Features**
1. **Open multiple tabs** to simulate different users
2. **Watch live cursors** showing where others are typing
3. **See real-time updates** as you type simultaneously
4. **Monitor user presence** in the header user list
5. **Test formatting sync** by applying styles in different tabs

### **Available Formatting Options**
- **Text Styling**: Bold, Italic, Underline (works on selected text)
- **Alignment**: Left, Center, Right, Justify (applies to paragraphs)
- **Typography**: 5 font families, 9 size options (10px-32px), 4 line heights
- **Colors**: Custom color picker + 6 preset colors
- **History**: 50-step undo/redo with visual indicators

## 🌟 Recent Updates & Improvements

### **Version 1.0.0 Features**
- ✅ **Modern Glassmorphism UI** - Complete design overhaul with gradient backgrounds
- ✅ **Enhanced Cursor System** - Pixel-perfect tracking with user names and colors
- ✅ **Advanced Formatting Toolbar** - Sectioned toolbar with hover effects and state feedback
- ✅ **ContentEditable Implementation** - Rich HTML editing replacing basic textarea
- ✅ **Comprehensive History System** - 50-step undo/redo with keyboard shortcuts
- ✅ **Cross-Platform Support** - Smart OS detection for keyboard shortcuts
- ✅ **Real-Time Synchronization** - Live cursor tracking and formatting sync
- ✅ **Modern Dependencies** - React 19, Vite 6, Tailwind 4, latest ecosystem

### **Technical Improvements**
- ✅ **Optimized Performance** - Debounced updates and efficient re-renders
- ✅ **Robust WebSocket Protocol** - Custom message types with error handling
- ✅ **Enhanced State Management** - Persistent formatting and cursor states
- ✅ **Professional Code Quality** - ESLint configuration and consistent styling
- ✅ **Mobile Responsiveness** - Adaptive UI for all screen sizes
- ✅ **Connection Resilience** - Auto-reconnection and heartbeat monitoring

## 👥 Testing Collaboration

### **Method 1: Multiple Browser Tabs (Recommended)**
1. Follow setup instructions to start both server and client
2. Open `http://localhost:5173` in multiple tabs
3. Each tab gets a unique user ID and color automatically
4. Test real-time editing, cursor tracking, and formatting sync

### **Method 2: Different Browsers**
1. Open the app in Chrome, Firefox, Safari, or Edge
2. Navigate to `http://localhost:5173` in each browser
3. Test cross-browser compatibility and performance
4. Verify consistent behavior across different environments

### **Method 3: Incognito/Private Windows**
1. Use regular and incognito windows for isolated sessions
2. Perfect for testing user session separation
3. Simulates different users on the same machine
4. Great for debugging user-specific features

### **What You'll Experience**
- **Unique colored cursors** with user names for each session
- **Instant text synchronization** across all windows
- **Live formatting updates** when applying text styles
- **Real-time user presence** indicators in the header
- **Smooth animations** for cursor movements and UI interactions

## 🔍 Technical Assumptions

### **Browser Requirements**
- **Modern Browser**: Chrome 16+, Firefox 11+, Safari 6+, Edge 12+
- **WebSocket Support**: Required for real-time functionality
- **JavaScript Enabled**: Essential for all interactive features
- **Local Storage**: Used for temporary state management

### **Network Requirements**
- **WebSocket Connections**: Network must allow WebSocket upgrades
- **CORS Support**: Proper cross-origin resource sharing
- **Port Access**: Ports 8080 (server) and 5173 (client) must be available
- **Stable Connection**: Best experience with reliable network connectivity

### **System Assumptions**
- **Development Environment**: Designed for local development and testing
- **Memory-Based Storage**: No persistent database required
- **Single Document Model**: One shared document per server instance
- **Reasonable Concurrent Users**: Optimized for 2-20 simultaneous users

## ⚠️ Current Limitations

### **Data Persistence**
- **No Database**: Document content is lost when server restarts
- **Memory-Only Storage**: All data exists only in server RAM
- **No Auto-Save**: No automatic saving to persistent storage
- **Session-Based**: User sessions don't persist across server restarts

### **Scalability Constraints**
- **Single Server**: Not designed for horizontal scaling or load balancing
- **Memory Limits**: Performance depends on available server memory
- **Concurrent Users**: Recommended maximum of 10-20 simultaneous users
- **Document Size**: Optimal performance with documents under 10,000 characters

### **Feature Scope**
- **Single Document**: Only supports one shared document at a time
- **Anonymous Users**: No authentication or persistent user accounts
- **Limited History**: 50-step undo/redo maximum (configurable)
- **Text-Only Content**: No support for images, tables, or rich media
- **No Document Management**: Cannot create, save, or load different documents

### **Security Limitations**
- **Open Access**: Anyone with the URL can access and edit
- **No Rate Limiting**: No protection against spam or rapid-fire edits
- **Basic Validation**: Limited server-side input sanitization
- **Development-Only**: Not configured for production deployment
- **No Audit Trail**: No logging of user actions or change history

### **Performance Considerations**
- **Large Documents**: May experience slowdown with very large content
- **High-Frequency Updates**: Performance degrades with rapid simultaneous typing
- **Cursor Update Rate**: Limited to 100ms intervals for position updates
- **Content Debouncing**: 300ms delay on content sync may feel sluggish

## 🔧 WebSocket Protocol Specification

### **Message Types**
```javascript
// Client to Server
{
  type: 'content_change',
  content: string,
  from: string
}

{
  type: 'cursor_update', 
  position: number,
  from: string
}

{
  type: 'formatting_change',
  formatting: object,
  from: string
}

// Server to Client
{
  type: 'init',
  clientId: string,
  content: string,
  clients: array,
  formatting: object,
  cursors: object
}

{
  type: 'content_update',
  content: string,
  from: string
}

{
  type: 'cursor_position',
  clientId: string,
  position: number
}

{
  type: 'user_joined',
  user: { id, name, color }
}

{
  type: 'user_left',
  clientId: string
}
```

### **Connection Flow**
1. **Client connects** → Server generates unique user ID
2. **Server sends init** → Client receives document state and user list
3. **User types** → Client sends content_change with 300ms debounce
4. **Server broadcasts** → All other clients receive content_update
5. **Cursor moves** → Client sends cursor_update with 100ms throttle
6. **Formatting applied** → Client sends formatting_change, server broadcasts
7. **User disconnects** → Server broadcasts user_left to remaining clients

## 🚀 Future Enhancement Ideas

### **Potential Features**
- **Database Integration** - PostgreSQL/MongoDB for data persistence
- **User Authentication** - Login system with user profiles
- **Multiple Documents** - Create, save, and manage multiple documents
- **Document Sharing** - Share documents with specific users or publicly
- **Rich Media Support** - Images, tables, code blocks, and embeds
- **Comment System** - Add comments and suggestions to specific text ranges
- **Version History** - Full document history with branching and merging
- **Real-Time Voice/Video** - Integrated communication for collaboration

### **Technical Improvements**
- **Redis Integration** - Scalable state management and pub/sub
- **Docker Deployment** - Containerized application for easy deployment
- **Kubernetes Scaling** - Horizontal scaling for high availability
- **CDN Integration** - Global content delivery for better performance
- **WebRTC P2P** - Direct peer-to-peer connections for reduced latency
- **Operational Transform** - Advanced conflict resolution algorithms
- **End-to-End Encryption** - Secure document content and communications

---

**Built with ❤️ using modern web technologies for seamless collaboration**

*For questions, issues, or contributions, please reach out or submit a pull request.* 