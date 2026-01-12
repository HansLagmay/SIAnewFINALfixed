import { useState, useEffect } from 'react';
import { databaseAPI } from '../../services/api';
import { handleFileExport } from '../../utils/exportHelper';
import FileMetadataComponent from './FileMetadata';
import ExportButtons from './ExportButtons';
import DataTable from './DataTable';
import Toast, { ToastType } from '../shared/Toast';
import type { FileMetadata, CalendarEvent } from '../../types';

export default function CalendarSection() {
  const [metadata, setMetadata] = useState<FileMetadata | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [showTable, setShowTable] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Toast state
  const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({
    message: '',
    type: 'info',
    isVisible: false
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [metaRes, eventsRes] = await Promise.all([
        databaseAPI.getFileMetadata('calendar-events.json'),
        databaseAPI.getFile('calendar-events.json')
      ]);
      
      setMetadata(metaRes.data);
      setEvents(eventsRes.data as CalendarEvent[]);
    } catch (error) {
      console.error('Failed to fetch calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      await handleFileExport('calendar-events.json', format);
    } catch (error) {
      setToast({ message: 'Failed to export file', type: 'error', isVisible: true });
    }
  };

  const getEventTypeBreakdown = () => {
    const breakdown: Record<string, number> = {};
    events.forEach(event => {
      breakdown[event.type] = (breakdown[event.type] || 0) + 1;
    });
    return breakdown;
  };

  if (loading) {
    return <div className="text-center py-8">Loading calendar data...</div>;
  }

  const eventTypeBreakdown = getEventTypeBreakdown();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">📅 All Calendar Events (calendar-events.json)</h3>
          <ExportButtons onExport={handleExport} />
        </div>
        
        <FileMetadataComponent metadata={metadata} />
        
        {Object.keys(eventTypeBreakdown).length > 0 && (
          <div className="mt-4 bg-gray-50 rounded p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Event Types:</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              {Object.entries(eventTypeBreakdown).map(([type, count]) => (
                <div key={type} className="flex justify-between">
                  <span className="text-gray-600 capitalize">{type}:</span>
                  <span className="font-semibold text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
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
            {events.length === 0 ? (
              <div className="text-center py-8 text-gray-500 bg-white rounded-lg border">
                No calendar events available
              </div>
            ) : (
              <DataTable data={events as unknown as Record<string, unknown>[]} maxRows={10} />
            )}
          </div>
        )}
      </div>

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />
    </div>
  );
}
