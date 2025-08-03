// WebSocket Client Hook for React Components
// Provides real-time updates and state management

import { useEffect, useRef, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';

export interface WebSocketMessage {
  type: 'user_snapshot' | 'agent_status' | 'team_update' | 'publisher_update' | 'notification';
  data: any;
  userId?: string;
  organizationId?: string;
  timestamp: string;
}

export interface WebSocketState {
  isConnected: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  lastMessage: WebSocketMessage | null;
  error: string | null;
}

export interface UseWebSocketOptions {
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
  autoReconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { data: session } = useSession();
  const [state, setState] = useState<WebSocketState>({
    isConnected: false,
    connectionStatus: 'disconnected',
    lastMessage: null,
    error: null
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const mountedRef = useRef(true);

  const {
    onMessage,
    onConnect,
    onDisconnect,
    onError,
    autoReconnect = true,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5
  } = options;

  const connect = useCallback(() => {
    if (!session?.accessToken || !mountedRef.current) return;

    setState(prev => ({ ...prev, connectionStatus: 'connecting', error: null }));

    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsHost = process.env.NODE_ENV === 'development' 
      ? 'localhost:3001' 
      : window.location.host;
    
    const wsUrl = `${wsProtocol}//${wsHost}/ws?token=${session.accessToken}`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!mountedRef.current) return;
        
        console.log('🔗 WebSocket connected');
        setState(prev => ({ 
          ...prev, 
          isConnected: true, 
          connectionStatus: 'connected',
          error: null 
        }));
        
        reconnectAttemptsRef.current = 0;
        onConnect?.();
      };

      ws.onmessage = (event) => {
        if (!mountedRef.current) return;

        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          setState(prev => ({ ...prev, lastMessage: message }));
          onMessage?.(message);
        } catch (error) {
          console.error('❌ Failed to parse WebSocket message:', error);
        }
      };

      ws.onclose = (event) => {
        if (!mountedRef.current) return;

        console.log('🔌 WebSocket disconnected:', event.code, event.reason);
        setState(prev => ({ 
          ...prev, 
          isConnected: false, 
          connectionStatus: 'disconnected' 
        }));

        onDisconnect?.();

        // Auto-reconnect logic
        if (autoReconnect && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          console.log(`🔄 Attempting reconnect ${reconnectAttemptsRef.current}/${maxReconnectAttempts}`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            if (mountedRef.current) {
              connect();
            }
          }, reconnectInterval);
        }
      };

      ws.onerror = (error) => {
        if (!mountedRef.current) return;

        console.error('❌ WebSocket error:', error);
        setState(prev => ({ 
          ...prev, 
          connectionStatus: 'error',
          error: 'Connection failed' 
        }));
        
        onError?.(error);
      };

    } catch (error) {
      console.error('❌ Failed to create WebSocket:', error);
      setState(prev => ({ 
        ...prev, 
        connectionStatus: 'error',
        error: 'Failed to create connection' 
      }));
    }
  }, [session?.accessToken, onMessage, onConnect, onDisconnect, onError, autoReconnect, reconnectInterval, maxReconnectAttempts]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setState(prev => ({ 
      ...prev, 
      isConnected: false, 
      connectionStatus: 'disconnected' 
    }));
  }, []);

  const sendMessage = useCallback((message: Partial<WebSocketMessage>) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const fullMessage: WebSocketMessage = {
        ...message,
        timestamp: new Date().toISOString()
      } as WebSocketMessage;
      
      wsRef.current.send(JSON.stringify(fullMessage));
      return true;
    }
    return false;
  }, []);

  // Send user activity snapshot
  const sendUserSnapshot = useCallback((activity: any) => {
    return sendMessage({
      type: 'user_snapshot',
      data: activity
    });
  }, [sendMessage]);

  // Send agent status update
  const sendAgentStatus = useCallback((agentId: string, status: string, progress?: any) => {
    return sendMessage({
      type: 'agent_status',
      data: { agentId, status, progress }
    });
  }, [sendMessage]);

  // Connect when session is available
  useEffect(() => {
    if (session?.accessToken) {
      connect();
    }

    return () => {
      mountedRef.current = false;
      disconnect();
    };
  }, [session?.accessToken, connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      disconnect();
    };
  }, [disconnect]);

  return {
    ...state,
    connect,
    disconnect,
    sendMessage,
    sendUserSnapshot,
    sendAgentStatus,
    reconnectAttempts: reconnectAttemptsRef.current
  };
}

// Specialized hooks for different types of real-time updates

export function useUserSnapshots() {
  const [userSnapshots, setUserSnapshots] = useState<Map<string, any>>(new Map());

  const { isConnected, sendUserSnapshot } = useWebSocket({
    onMessage: (message) => {
      if (message.type === 'user_snapshot') {
        setUserSnapshots(prev => {
          const newMap = new Map(prev);
          newMap.set(message.data.userId, {
            ...message.data,
            timestamp: message.timestamp
          });
          return newMap;
        });
      }
    }
  });

  const updateActivity = useCallback((activity: any) => {
    sendUserSnapshot(activity);
  }, [sendUserSnapshot]);

  return {
    userSnapshots: Array.from(userSnapshots.values()),
    updateActivity,
    isConnected
  };
}

export function useAgentStatus() {
  const [agentStatuses, setAgentStatuses] = useState<Map<string, any>>(new Map());

  const { isConnected, sendAgentStatus } = useWebSocket({
    onMessage: (message) => {
      if (message.type === 'agent_status') {
        setAgentStatuses(prev => {
          const newMap = new Map(prev);
          newMap.set(message.data.agentId, {
            ...message.data,
            timestamp: message.timestamp
          });
          return newMap;
        });
      }
    }
  });

  const updateAgentStatus = useCallback((agentId: string, status: string, progress?: any) => {
    sendAgentStatus(agentId, status, progress);
  }, [sendAgentStatus]);

  return {
    agentStatuses: Array.from(agentStatuses.values()),
    updateAgentStatus,
    isConnected
  };
}

export function useTeamUpdates() {
  const [teamUpdates, setTeamUpdates] = useState<any[]>([]);

  const { isConnected } = useWebSocket({
    onMessage: (message) => {
      if (message.type === 'team_update') {
        setTeamUpdates(prev => [...prev.slice(-50), message.data]); // Keep last 50 updates
      }
    }
  });

  return {
    teamUpdates,
    isConnected
  };
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);

  const { isConnected } = useWebSocket({
    onMessage: (message) => {
      if (message.type === 'notification') {
        setNotifications(prev => [...prev.slice(-20), message.data]); // Keep last 20 notifications
      }
    }
  });

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    clearNotifications,
    isConnected
  };
}
