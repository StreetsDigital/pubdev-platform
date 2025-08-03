// Real-time Team Dashboard Component
// Shows live user activity, agent status, and team updates

'use client';

import React from 'react';
import { useUserSnapshots, useAgentStatus, useTeamUpdates, useNotifications } from '@/lib/websocket/hooks';

export function RealtimeTeamDashboard() {
  const { userSnapshots, updateActivity, isConnected: userConnected } = useUserSnapshots();
  const { agentStatuses, updateAgentStatus, isConnected: agentConnected } = useAgentStatus();
  const { teamUpdates, isConnected: teamConnected } = useTeamUpdates();
  const { notifications, clearNotifications, isConnected: notificationConnected } = useNotifications();

  const isConnected = userConnected && agentConnected && teamConnected && notificationConnected;

  // Simulate user activity (you'd connect this to actual user actions)
  const simulateActivity = () => {
    updateActivity({
      action: 'viewing_publisher',
      publisherId: 'pub_123',
      territory: 'US_West',
      timestamp: new Date().toISOString()
    });
  };

  // Simulate agent status update
  const simulateAgentUpdate = () => {
    updateAgentStatus('research_agent', 'processing', {
      progress: Math.floor(Math.random() * 100),
      currentTask: 'Analyzing publisher data'
    });
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Real-time Team Dashboard</h2>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className={`text-sm font-medium ${isConnected ? 'text-green-700' : 'text-red-700'}`}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Test Buttons */}
      <div className="mb-6 flex space-x-2">
        <button
          onClick={simulateActivity}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          disabled={!isConnected}
        >
          Simulate Activity
        </button>
        <button
          onClick={simulateAgentUpdate}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          disabled={!isConnected}
        >
          Simulate Agent Update
        </button>
        <button
          onClick={clearNotifications}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Clear Notifications
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Live User Activity */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Live User Activity</h3>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {userSnapshots.slice(-5).map((snapshot, index) => (
              <div key={index} className="text-sm text-blue-700 p-2 bg-white rounded">
                <div className="font-medium">User: {snapshot.userId}</div>
                <div>{snapshot.action || 'Active'}</div>
                {snapshot.territory && (
                  <div className="text-xs text-blue-500">Territory: {snapshot.territory}</div>
                )}
              </div>
            ))}
            {userSnapshots.length === 0 && (
              <div className="text-sm text-blue-600 italic">No recent activity</div>
            )}
          </div>
        </div>

        {/* Agent Status */}
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-green-900 mb-3">AI Agent Status</h3>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {agentStatuses.slice(-5).map((agent, index) => (
              <div key={index} className="text-sm text-green-700 p-2 bg-white rounded">
                <div className="font-medium">{agent.agentId}</div>
                <div className="capitalize">{agent.status}</div>
                {agent.progress && (
                  <div className="w-full bg-green-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${agent.progress.progress || 0}%` }}
                    ></div>
                  </div>
                )}
              </div>
            ))}
            {agentStatuses.length === 0 && (
              <div className="text-sm text-green-600 italic">No agent activity</div>
            )}
          </div>
        </div>

        {/* Team Updates */}
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-purple-900 mb-3">Team Updates</h3>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {teamUpdates.slice(-5).map((update, index) => (
              <div key={index} className="text-sm text-purple-700 p-2 bg-white rounded">
                <div className="font-medium">{update.updateType}</div>
                <div className="text-xs text-purple-500">
                  {new Date(update.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
            {teamUpdates.length === 0 && (
              <div className="text-sm text-purple-600 italic">No team updates</div>
            )}
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-yellow-900 mb-3">Notifications</h3>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {notifications.slice(-5).map((notification, index) => (
              <div key={index} className="text-sm text-yellow-700 p-2 bg-white rounded">
                <div>{notification.message}</div>
                {notification.status && (
                  <div className="text-xs text-yellow-600 capitalize">{notification.status}</div>
                )}
              </div>
            ))}
            {notifications.length === 0 && (
              <div className="text-sm text-yellow-600 italic">No notifications</div>
            )}
          </div>
        </div>
      </div>

      {/* Connection Status Details */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Connection Details</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-600">
          <div>
            <span className="font-medium">User Snapshots:</span>
            <span className={`ml-1 ${userConnected ? 'text-green-600' : 'text-red-600'}`}>
              {userConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <div>
            <span className="font-medium">Agent Status:</span>
            <span className={`ml-1 ${agentConnected ? 'text-green-600' : 'text-red-600'}`}>
              {agentConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <div>
            <span className="font-medium">Team Updates:</span>
            <span className={`ml-1 ${teamConnected ? 'text-green-600' : 'text-red-600'}`}>
              {teamConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <div>
            <span className="font-medium">Notifications:</span>
            <span className={`ml-1 ${notificationConnected ? 'text-green-600' : 'text-red-600'}`}>
              {notificationConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RealtimeTeamDashboard;
