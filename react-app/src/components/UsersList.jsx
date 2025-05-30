import React from 'react';
import { Users, Circle, Crown, Eye } from 'lucide-react';

/**
 * @typedef {import('../types').User} User
 */

/**
 * @param {Object} props
 * @param {User[]} props.users
 * @param {string|null} props.currentUserId
 */
export const UsersList = ({ users, currentUserId }) => {
  if (!users || users.length === 0) {
    return (
      <div className="bg-white/70 backdrop-blur-xl border-b border-white/20 px-4 py-2">
        <div className="flex items-center gap-2 text-gray-600">
          <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
            <Users size={12} className="text-gray-600" />
          </div>
          <span className="text-xs font-medium">Waiting for collaborators...</span>
        </div>
      </div>
    );
  }

  const getUserInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="bg-white/70 backdrop-blur-xl border-b border-white/20 px-4 py-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2 py-1 bg-white/10 rounded-md border border-white/20 backdrop-blur-sm">
            <Eye className="text-indigo-600" size={12} />
            <span className="text-xs font-semibold text-gray-700">
              {users.length} online
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex -space-x-1 overflow-visible">
            {users.slice(0, 8).map((user, index) => (
              <div
                key={user.id}
                className={`relative group transition-all duration-200 hover:scale-105 hover:z-20 ${
                  index > 0 ? 'hover:ml-1' : ''
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full border-2 border-gray-300/80 shadow-lg flex items-center justify-center text-white text-xs font-bold relative overflow-hidden transition-all duration-200 ${
                    user.id === currentUserId 
                      ? 'ring-1 ring-indigo-500 ring-offset-1 ring-offset-gray-100/50' 
                      : ''
                  }`}
                  style={{ backgroundColor: user.color }}
                >
                  {getUserInitials(user.name)}
                  
                  <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 border border-gray-100 rounded-full animate-pulse shadow-sm" />
                  
                  {user.id === currentUserId && (
                    <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg">
                      <Crown className="text-white" size={6} />
                    </div>
                  )}
                </div>

                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900/95 backdrop-blur-sm text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-30 pointer-events-none border border-white/20 shadow-lg">
                  {user.name}
                  {user.id === currentUserId && ' (You)'}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-1 border-r-1 border-t-1 border-transparent border-t-gray-900" />
                </div>
              </div>
            ))}
            
            {users.length > 8 && (
              <div className="w-7 h-7 bg-gray-200/90 border-2 border-gray-300/80 rounded-full shadow-lg flex items-center justify-center text-gray-700 text-xs font-bold">
                +{users.length - 8}
              </div>
            )}
          </div>

          {users.length <= 3 && (
            <div className="flex flex-wrap gap-1 ml-2">
              {users.map((user) => (
                <div
                  key={user.id}
                  className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-all duration-200 hover:scale-105 backdrop-blur-sm ${
                    user.id === currentUserId 
                      ? 'bg-white/10 text-gray-700 border border-white/30' 
                      : 'bg-white/5 text-gray-700 border border-white/20 hover:bg-white/10'
                  }`}
                >
                  <Circle
                    size={6}
                    className="fill-current animate-pulse"
                    style={{ color: user.color }}
                  />
                  <span className="font-medium">
                    {user.name}
                    {user.id === currentUserId && (
                      <span className="ml-1">
                        <Crown className="inline w-2 h-2" />
                      </span>
                    )}
                  </span>
                  
                  <div
                    className="w-1.5 h-1.5 rounded-full animate-pulse"
                    style={{ backgroundColor: user.color }}
                    title="Active"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 