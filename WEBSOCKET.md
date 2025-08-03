# 🔗 WebSocket Real-time Updates

## Overview

The PubDev Platform includes comprehensive WebSocket support for real-time updates across the entire application. This enables live collaboration, instant agent status updates, user activity tracking, and immediate notifications.

## Architecture

```
┌─────────────────┐    WebSocket    ┌─────────────────┐
│   React Client  │◄──────────────►│ WebSocket Server│
│   (Frontend)    │    Port 3001    │   (Node.js)     │
└─────────────────┘                 └─────────────────┘
                                            │
                                    ┌─────────────────┐
                                    │   Sub-Agents    │
                                    │   (Python)      │
                                    └─────────────────┘
```

## ✅ **What's Already Implemented:**

### **1. WebSocket Server (`src/lib/websocket/server.ts`)**
- ✅ **JWT Authentication** - Secure connection with user/org context
- ✅ **Connection Management** - Client tracking and organization grouping
- ✅ **Message Broadcasting** - Organization-wide and targeted messaging
- ✅ **Health Monitoring** - Heartbeat and connection status
- ✅ **Auto-reconnection** - Graceful handling of disconnections

### **2. React Hooks (`src/lib/websocket/hooks.ts`)**
- ✅ **`useWebSocket`** - Core WebSocket connection management
- ✅ **`useUserSnapshots`** - Live user activity tracking
- ✅ **`useAgentStatus`** - Real-time AI agent status updates
- ✅ **`useTeamUpdates`** - Team collaboration notifications
- ✅ **`useNotifications`** - Instant notification system

### **3. API Integration (`src/app/api/websocket/route.ts`)**
- ✅ **REST to WebSocket Bridge** - Trigger broadcasts via API
- ✅ **Connection Statistics** - Monitor active connections
- ✅ **Health Reporting** - WebSocket status in health checks

### **4. Demo Component (`src/components/realtime/TeamDashboard.tsx`)**
- ✅ **Live Dashboard** - Real-time team activity display
- ✅ **Connection Status** - Visual connection indicators
- ✅ **Test Functions** - Simulate real-time events

## 🔧 Configuration

### Environment Variables

```env
# WebSocket Configuration
WS_PORT=3001                    # WebSocket server port
NEXTAUTH_SECRET=your_secret     # JWT signing secret

# Docker Development
WS_PORT=3001                    # Exposed in docker-compose.yml
```

### Docker Ports

```yaml
ports:
  - "3000:3000"  # Next.js frontend
  - "3001:3001"  # WebSocket server  
  - "3002:3002"  # Sub-agents API
```

## 🚀 **Usage Examples**

### **1. Basic Connection**

```tsx
import { useWebSocket } from '@/lib/websocket/hooks';

function MyComponent() {
  const { isConnected, sendMessage } = useWebSocket({
    onMessage: (message) => {
      console.log('Received:', message);
    }
  });

  return (
    <div>
      Status: {isConnected ? 'Connected' : 'Disconnected'}
    </div>
  );
}
```

### **2. User Activity Tracking**

```tsx
import { useUserSnapshots } from '@/lib/websocket/hooks';

function ActivityTracker() {
  const { userSnapshots, updateActivity } = useUserSnapshots();

  const handleUserAction = (action: string) => {
    updateActivity({
      action,
      timestamp: new Date().toISOString(),
      territory: 'US_West'
    });
  };

  return (
    <div>
      {userSnapshots.map(snapshot => (
        <div key={snapshot.userId}>
          {snapshot.userId}: {snapshot.action}
        </div>
      ))}
    </div>
  );
}
```

### **3. Agent Status Updates**

```tsx
import { useAgentStatus } from '@/lib/websocket/hooks';

function AgentMonitor() {
  const { agentStatuses, updateAgentStatus } = useAgentStatus();

  const startAgent = (agentId: string) => {
    updateAgentStatus(agentId, 'processing', {
      progress: 0,
      task: 'Initializing...'
    });
  };

  return (
    <div>
      {agentStatuses.map(agent => (
        <div key={agent.agentId}>
          {agent.agentId}: {agent.status}
          {agent.progress && (
            <div>Progress: {agent.progress.progress}%</div>
          )}
        </div>
      ))}
    </div>
  );
}
```

### **4. Server-side Broadcasting**

```tsx
// API Route or Server Component
import { getWebSocketServer } from '@/lib/websocket/server';

export async function notifyTeam(organizationId: string) {
  const wsServer = getWebSocketServer();
  
  wsServer.broadcastToOrganization(organizationId, {
    type: 'team_update',
    data: {
      message: 'New publisher assigned',
      updateType: 'assignment'
    },
    timestamp: new Date().toISOString()
  });
}
```

## 📨 **Message Types**

### **1. User Snapshots**
```typescript
{
  type: 'user_snapshot',
  data: {
    userId: string,
    activity: {
      action: string,
      publisherId?: string,
      territory?: string,
      status: 'online' | 'offline' | 'away'
    }
  },
  timestamp: string
}
```

### **2. Agent Status**
```typescript
{
  type: 'agent_status',
  data: {
    agentId: string,
    status: 'idle' | 'processing' | 'completed' | 'error',
    progress?: {
      progress: number,
      currentTask: string,
      estimatedTime?: number
    }
  },
  timestamp: string
}
```

### **3. Team Updates**
```typescript
{
  type: 'team_update',
  data: {
    updateType: 'assignment' | 'territory_change' | 'publisher_update',
    message: string,
    userId?: string,
    details: any
  },
  timestamp: string
}
```

### **4. Publisher Updates**
```typescript
{
  type: 'publisher_update',
  data: {
    publisherId: string,
    update: {
      field: string,
      oldValue: any,
      newValue: any,
      updatedBy: string
    }
  },
  timestamp: string
}
```

### **5. Notifications**
```typescript
{
  type: 'notification',
  data: {
    message: string,
    level: 'info' | 'warning' | 'error' | 'success',
    actionUrl?: string,
    persistent?: boolean
  },
  timestamp: string
}
```

## 🔄 **Integration Points**

### **1. AI Agents ↔ WebSocket**
- Agent progress broadcasts during processing
- Status updates for all running agents
- Completion notifications with results

### **2. Supabase ↔ WebSocket** 
- Database change notifications
- Real-time data synchronization
- User permission updates

### **3. MCP Integration ↔ WebSocket**
- Gmail/Calendar event notifications  
- LinkedIn connection updates
- Drive file sharing alerts

### **4. Team Collaboration ↔ WebSocket**
- Territory assignment changes
- Publisher ownership transfers
- Custom field modifications

## 🚀 **Development Commands**

```bash
# Start with WebSocket (recommended)
npm run dev                     # Starts both Next.js + WebSocket

# Start services separately  
npm run dev:next               # Just Next.js frontend
npm run dev:ws                 # Just WebSocket server

# Docker with WebSocket
./docker.sh dev                # Full stack with WebSocket
```

## 📊 **Monitoring & Debug**

### **Health Check**
```bash
curl http://localhost:3000/api/health
# Returns WebSocket connection stats
```

### **WebSocket Statistics**
```bash
curl http://localhost:3000/api/websocket
# Returns active connections by organization
```

### **Browser Debug**
```javascript
// Open browser console and connect manually
const ws = new WebSocket('ws://localhost:3001/ws?token=YOUR_JWT');
ws.onmessage = (event) => console.log('Received:', JSON.parse(event.data));
```

## 🎯 **Real-time Use Cases**

### **1. Multi-User Publisher Editing**
- Show who's currently viewing/editing a publisher
- Live field updates as users type
- Conflict resolution for simultaneous edits

### **2. Agent Coordination**
- Visual progress bars for running agents
- Queue status and processing order
- Error notifications and retry status

### **3. Team Activity Feed**
- Live activity stream of team actions
- Territory-based filtered updates
- @mention notifications

### **4. Dashboard Real-time Metrics**
- Live KPI updates
- Publisher status changes
- Campaign performance updates

## ✅ **Production Ready Features**

- ✅ **Authentication** - JWT-based secure connections
- ✅ **Scalability** - Connection pooling and organization grouping
- ✅ **Reliability** - Auto-reconnection and heartbeat monitoring
- ✅ **Performance** - Efficient message broadcasting
- ✅ **Security** - Authenticated connections with territory filtering
- ✅ **Monitoring** - Health checks and connection statistics
- ✅ **Docker Ready** - Full containerization support

The WebSocket infrastructure is **enterprise-ready** and provides the foundation for sophisticated real-time collaboration features! 🚀
