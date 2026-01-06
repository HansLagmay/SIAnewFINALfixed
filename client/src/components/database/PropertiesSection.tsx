import { useState, useEffect } from 'react';
import { databaseAPI } from '../../services/api';
import FileMetadataComponent from './FileMetadata';
import ExportButtons from './ExportButtons';
import DataTable from './DataTable';
import type { FileMetadata, Property } from '../../types';

export default function PropertiesSection() {
  const [metadata, setMetadata] = useState<FileMetadata | null>(null);
  const [newMetadata, setNewMetadata] = useState<FileMetadata | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [newProperties, setNewProperties] = useState<Property[]>([]);
  const [showTable, setShowTable] = useState(false);
  const [showNewProperties, setShowNewProperties] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [metaRes, newMetaRes, propsRes, newPropsRes] = await Promise.all([
        databaseAPI.getFileMetadata('properties.json'),
        databaseAPI.getFileMetadata('new-properties.json'),
        databaseAPI.getFile('properties.json'),
        databaseAPI.getRecent('properties')
      ]);
      
      setMetadata(metaRes.data);
      setNewMetadata(newMetaRes.data);
      setProperties(propsRes.data);
      setNewProperties(newPropsRes.data);
    } catch (error) {
      console.error('Failed to fetch properties data:', error);
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
    if (!confirm('Are you sure you want to clear the new properties list?')) return;
    
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      await databaseAPI.clearNew('properties', user.name || 'Admin');
      alert('New properties list cleared successfully');
      fetchData();
    } catch (error) {
      console.error('Failed to clear new properties:', error);
      alert('Failed to clear new properties list');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading properties data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* All Properties Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">🏠 All Properties (properties.json)</h3>
          <ExportButtons filename="properties.json" onExport={(format) => handleExport('properties.json', format)} />
        </div>
        
        <FileMetadataComponent filename="properties.json" metadata={metadata} />
        
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
            <DataTable data={properties} maxRows={10} />
          </div>
        )}
      </div>

      {/* New Properties Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">⭐ Recently Added Properties (new-properties.json)</h3>
          {newProperties.length > 0 && (
            <button
              onClick={handleClearNew}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
            >
              🗑️ Clear New Properties List
            </button>
          )}
        </div>
        
        <FileMetadataComponent filename="new-properties.json" metadata={newMetadata} />

        {newProperties.length === 0 ? (
          <div className="mt-4 text-center py-8 text-gray-500">
            No new properties to display
          </div>
        ) : (
          <>
            <div className="mt-4">
              <button
                onClick={() => setShowNewProperties(!showNewProperties)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                {showNewProperties ? '📋 Hide List' : '📋 View List'}
              </button>
            </div>

            {showNewProperties && (
              <div className="mt-4 space-y-4">
                {newProperties.map((property) => (
                  <div key={property.id} className="border border-gray-200 rounded p-4">
                    <div className="font-semibold text-lg text-gray-900">
                      {property.id} | {property.title}
                    </div>
                    <div className="text-sm text-gray-600 mt-2 space-y-1">
                      <div>Added: {new Date(property.createdAt).toLocaleString()}</div>
                      <div>Price: ₱{property.price.toLocaleString()}</div>
                      <div>Location: {property.location}</div>
                      <div>Type: {property.type}</div>
                      <div>Status: {property.status}</div>
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
