import { useState, useEffect } from 'react';
import { databaseAPI } from '../../services/api';
import FileMetadataComponent from './FileMetadata';
import ExportButtons from './ExportButtons';
import DataTable from './DataTable';
import type { FileMetadata, User } from '../../types';

export default function UsersSection() {
  const [metadata, setMetadata] = useState<FileMetadata | null>(null);
  const [newMetadata, setNewMetadata] = useState<FileMetadata | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [newAgents, setNewAgents] = useState<any[]>([]);
  const [showTable, setShowTable] = useState(false);
  const [showNewAgents, setShowNewAgents] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [metaRes, newMetaRes, usersRes, newAgentsRes] = await Promise.all([
        databaseAPI.getFileMetadata('users.json'),
        databaseAPI.getFileMetadata('new-agents.json'),
        databaseAPI.getFile('users.json'),
        databaseAPI.getRecent('agents')
      ]);
      
      setMetadata(metaRes.data);
      setNewMetadata(newMetaRes.data);
      setUsers(usersRes.data);
      setNewAgents(newAgentsRes.data);
    } catch (error) {
      console.error('Failed to fetch users data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (filename: string, format: 'csv' | 'json') => {
    try {
      const response = format === 'csv' 
        ? await databaseAPI.exportCSV(filename)
        : await databaseAPI.exportJSON(filename);
      
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename.replace('.json', `.${format}`);
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to export:', error);
      alert('Failed to export file');
    }
  };

  const handleClearNew = async () => {
    if (!confirm('Are you sure you want to clear the new agents list?')) return;
    
    try {
      let userName = 'Admin';
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          userName = user.name || 'Admin';
        }
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
      
      await databaseAPI.clearNew('agents', userName);
      alert('New agents list cleared successfully');
      fetchData();
    } catch (error) {
      console.error('Failed to clear new agents:', error);
      alert('Failed to clear new agents list');
    }
  };

  const getRoleBreakdown = () => {
    const admins = users.filter(u => u.role === 'admin').length;
    const agents = users.filter(u => u.role === 'agent').length;
    return { admins, agents };
  };

  if (loading) {
    return <div className="text-center py-8">Loading users data...</div>;
  }

  const { admins, agents } = getRoleBreakdown();

  return (
    <div className="space-y-6">
      {/* All Users Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">👥 All Users (users.json)</h3>
          <ExportButtons onExport={(format) => handleExport('users.json', format)} />
        </div>
        
        <FileMetadataComponent metadata={metadata} />
        
        <div className="mt-4 bg-gray-50 rounded p-4">
          <h4 className="font-semibold text-gray-900 mb-2">Breakdown:</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Admin:</span>
              <span className="font-semibold text-gray-900">{admins}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Agents:</span>
              <span className="font-semibold text-gray-900">{agents}</span>
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <button
            onClick={() => setShowTable(!showTable)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            {showTable ? '📋 Hide Table' : '📋 View Table'}
          </button>
        </div>

        {showTable && (
          <div className="mt-4">
            <DataTable data={users} maxRows={10} />
          </div>
        )}
      </div>

      {/* New Agents Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">⭐ Recently Added Agents (new-agents.json)</h3>
          {newAgents.length > 0 && (
            <button
              onClick={handleClearNew}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
            >
              🗑️ Clear New Agents List
            </button>
          )}
        </div>
        
        <FileMetadataComponent metadata={newMetadata} />

        {newAgents.length === 0 ? (
          <div className="mt-4 text-center py-8 text-gray-500">
            No new agents to display
          </div>
        ) : (
          <>
            <div className="mt-4">
              <button
                onClick={() => setShowNewAgents(!showNewAgents)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                {showNewAgents ? '📋 Hide List' : '📋 View List'}
              </button>
            </div>

            {showNewAgents && (
              <div className="mt-4 space-y-4">
                {newAgents.map((agent, idx) => (
                  <div key={idx} className="border border-gray-200 rounded p-4">
                    <div className="font-semibold text-lg text-gray-900">
                      {agent.id ? `${agent.id} | ${agent.name}` : agent.name}
                    </div>
                    <div className="text-sm text-gray-600 mt-2 space-y-1">
                      <div>Created: {new Date(agent.createdAt || Date.now()).toLocaleString()}</div>
                      <div>Email: {agent.email}</div>
                      <div>Role: {agent.role}</div>
                      {agent.phone && <div>Phone: {agent.phone}</div>}
                      {agent.employmentData && (
                        <>
                          <div>Position: {agent.employmentData.position}</div>
                          <div>Department: {agent.employmentData.department}</div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
