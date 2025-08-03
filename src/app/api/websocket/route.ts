// WebSocket API Routes for Next.js
// Provides REST endpoints to trigger WebSocket broadcasts

import { NextRequest, NextResponse } from 'next/server';
import { getWebSocketServer } from '@/lib/websocket/server';

export async function POST(request: NextRequest) {
  try {
    const { type, data, organizationId, userId } = await request.json();
    const wsServer = getWebSocketServer();

    switch (type) {
      case 'user_snapshot':
        if (organizationId) {
          wsServer.broadcastToOrganization(organizationId, {
            type: 'user_snapshot',
            data,
            userId,
            organizationId,
            timestamp: new Date().toISOString()
          });
        }
        break;

      case 'agent_status':
        if (organizationId) {
          wsServer.notifyAgentProgress(organizationId, data.agentId, data.progress);
        }
        break;

      case 'publisher_update':
        if (organizationId) {
          wsServer.notifyPublisherUpdate(organizationId, data.publisherId, data.update);
        }
        break;

      case 'team_update':
        if (organizationId) {
          wsServer.notifyTeamUpdate(organizationId, data.updateType, data);
        }
        break;

      case 'notification':
        if (userId) {
          wsServer.sendToClient(userId, {
            type: 'notification',
            data,
            timestamp: new Date().toISOString()
          });
        } else if (organizationId) {
          wsServer.broadcastToOrganization(organizationId, {
            type: 'notification',
            data,
            organizationId,
            timestamp: new Date().toISOString()
          });
        }
        break;

      default:
        return NextResponse.json({ error: 'Invalid message type' }, { status: 400 });
    }

    return NextResponse.json({ success: true, sent: true });
  } catch (error) {
    console.error('❌ WebSocket broadcast error:', error);
    return NextResponse.json(
      { error: 'Failed to broadcast message' }, 
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const wsServer = getWebSocketServer();
    const stats = wsServer.getConnectionStats();
    
    return NextResponse.json({
      websocket: {
        enabled: true,
        ...stats
      }
    });
  } catch (error) {
    return NextResponse.json({
      websocket: {
        enabled: false,
        error: 'WebSocket server not initialized'
      }
    });
  }
}
