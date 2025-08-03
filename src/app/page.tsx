import React from 'react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            🚀 PubDev Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            AI-Powered Publisher Development Automation
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-semibold text-lg mb-2">🤖 8 AI Agents</h3>
              <p className="text-gray-600">Specialized agents for publisher development</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-semibold text-lg mb-2">🔄 Dual Workflow</h3>
              <p className="text-gray-600">Publisher dev + Enterprise implementation</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-semibent text-lg mb-2">👥 Multi-User</h3>
              <p className="text-gray-600">Team collaboration with territories</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-semibold text-lg mb-2">🔗 MCP Integration</h3>
              <p className="text-gray-600">Gmail, Calendar, Drive, LinkedIn</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
