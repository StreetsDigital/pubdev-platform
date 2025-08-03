// WebSocket Module Exports
// Central export point for all WebSocket functionality

export { PubDevWebSocketServer, getWebSocketServer, initializeWebSocketServer } from './server';
export type { WebSocketMessage, AuthenticatedWebSocket } from './server';

export { 
  useWebSocket, 
  useUserSnapshots, 
  useAgentStatus, 
  useTeamUpdates, 
  useNotifications 
} from './hooks';
export type { WebSocketState, UseWebSocketOptions } from './hooks';

// WebSocket configuration
export const WEBSOCKET_CONFIG = {
  defaultPort: 3001,
  heartbeatInterval: 30000,
  reconnectInterval: 3000,
  maxReconnectAttempts: 5,
  paths: {
    connection: '/ws',
    api: '/api/websocket'
  }
} as const;

// Message types
export const MESSAGE_TYPES = {
  USER_SNAPSHOT: 'user_snapshot',
  AGENT_STATUS: 'agent_status', 
  TEAM_UPDATE: 'team_update',
  PUBLISHER_UPDATE: 'publisher_update',
  NOTIFICATION: 'notification'
} as const;

// Connection status
export const CONNECTION_STATUS = {
  CONNECTING: 'connecting',
  CONNECTED: 'connected', 
  DISCONNECTED: 'disconnected',
  ERROR: 'error'
} as const;
