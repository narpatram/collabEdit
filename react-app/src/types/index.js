// Since we're using JSX instead of TSX, we'll define types as JSDoc comments
// and export helper functions for type checking

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {string} color
 */

/**
 * @typedef {Object} WebSocketMessage
 * @property {'init'|'content_update'|'user_joined'|'user_left'|'content_change'|'cursor_position'} type
 * @property {string} [content]
 * @property {string} [clientId]
 * @property {User[]} [clients]
 * @property {User} [user]
 * @property {string} [from]
 * @property {number} [position]
 */

/**
 * @typedef {Object} ConnectionState
 * @property {boolean} isConnected
 * @property {boolean} isConnecting
 * @property {string|null} error
 */

export { }; 