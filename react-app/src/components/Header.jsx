import React from 'react';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Zap, 
  Users,
  FileText,
  Sparkles
} from 'lucide-react';

/**
 * @typedef {import('../types').ConnectionState} ConnectionState
 */

/**
 * @param {Object} props
 * @param {ConnectionState} props.connectionState
 * @param {function(): void} props.onReconnect
 */
export const Header = ({ connectionState, onReconnect }) => {
  const getConnectionIcon = () => {
    if (connectionState.isConnecting) {
      return <RefreshCw className="animate-spin" size={20} />;
    }
    return connectionState.isConnected ? (
      <Wifi size={20} />
    ) : (
      <WifiOff size={20} />
    );
  };

  const getConnectionStatus = () => {
    if (connectionState.isConnecting) {
      return { text: 'Connecting...', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' };
    }
    return connectionState.isConnected
      ? { text: 'Connected', color: 'text-green-600 bg-green-50 border-green-200' }
      : { text: 'Disconnected', color: 'text-red-600 bg-red-50 border-red-200' };
  };

  const status = getConnectionStatus();

  return (
    <header className="relative bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 shadow-2xl border-b border-white/10 overflow-hidden">
      {/* Animated mesh gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-gray-500/10 to-white/5"></div>
      
      {/* Dynamic floating orbs in grayscale */}
      <div className="absolute inset-0">
        <div className="absolute top-2 left-[10%] w-20 h-20 bg-gradient-to-r from-white/8 to-gray-300/8 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-3 right-[15%] w-24 h-24 bg-gradient-to-r from-gray-400/10 to-white/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute -bottom-4 left-[30%] w-22 h-22 bg-gradient-to-r from-slate-300/8 to-gray-500/8 rounded-full blur-xl animate-pulse delay-500"></div>
      </div>
      
      {/* Animated grid pattern */}
      <div className="absolute inset-0 opacity-[0.02]" 
           style={{
             backgroundImage: `
               linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
               linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
             `,
             backgroundSize: '30px 30px',
             animation: 'grid-move 20s linear infinite'
           }}>
      </div>
      
      {/* Flowing light streaks */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-full h-[1px] bg-gradient-to-l from-transparent via-gray-400/15 to-transparent animate-pulse delay-1000"></div>
      </div>
      
      {/* Subtle noise texture */}
      <div className="absolute inset-0 opacity-[0.015] mix-blend-overlay"
           style={{
             backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
           }}>
      </div>
      
      <div className="relative px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="relative group">
                <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <FileText className="text-white drop-shadow-lg" size={18} />
                </div>
                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                  <Sparkles className="text-white" size={8} />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight drop-shadow-lg">
                  CollabEdit
                </h1>
                <p className="text-white/80 text-xs font-medium drop-shadow-sm">
                  Real-time collaborative editor
                </p>
              </div>
            </div>
          </div>

          {/* Connection Status and Actions */}
          <div className="flex items-center gap-3">
            {/* Live indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-lg border border-white/20 shadow-lg">
              <Zap className="text-yellow-300 animate-pulse drop-shadow-sm" size={14} />
              <span className="text-white text-xs font-semibold drop-shadow-sm">Live</span>
            </div>

            {/* Connection Status */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border backdrop-blur-sm transition-all duration-300 shadow-lg ${status.color}`}>
              {getConnectionIcon()}
              <span className="font-semibold text-xs">{status.text}</span>
            </div>

            {/* Reconnect Button */}
            {!connectionState.isConnected && !connectionState.isConnecting && (
              <button
                onClick={onReconnect}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-lg border border-white/30 backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:shadow-xl shadow-lg"
              >
                <RefreshCw size={14} />
                Reconnect
              </button>
            )}

            {/* Users indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-lg border border-white/20 shadow-lg">
              <Users className="text-white drop-shadow-sm" size={14} />
              <span className="text-white text-xs font-semibold drop-shadow-sm">
                {connectionState.isConnected ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {connectionState.error && (
          <div className="mt-2 p-2 bg-red-500/20 backdrop-blur-sm border border-red-400/30 rounded-lg shadow-lg">
            <p className="text-red-100 text-xs font-semibold drop-shadow-sm">
              Connection Error: {connectionState.error}
            </p>
          </div>
        )}
      </div>
    </header>
  );
}; 