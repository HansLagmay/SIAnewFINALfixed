import { useState, useEffect } from 'react';
import { databaseAPI } from '../../services/api';
import { handleFileExport } from '../../utils/exportHelper';
import { handleClearNewItems } from '../../utils/clearNewHelper';
import FileMetadataComponent from './FileMetadata';
import ExportButtons from './ExportButtons';
import DataTable from './DataTable';
import ConfirmDialog from '../shared/ConfirmDialog';
import Toast, { ToastType } from '../shared/Toast';
import type { FileMetadata, Inquiry } from '../../types';

export default function InquiriesSection() {
  const [metadata, setMetadata] = useState<FileMetadata | null>(null);
  const [newMetadata, setNewMetadata] = useState<FileMetadata | null>(null);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [newInquiries, setNewInquiries] = useState<Inquiry[]>([]);
  const [showTable, setShowTable] = useState(false);
  const [showNewInquiries, setShowNewInquiries] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Dialog and Toast states
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
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
      const [metaRes, newMetaRes, inqRes, newInqRes] = await Promise.all([
        databaseAPI.getFileMetadata('inquiries.json'),
        databaseAPI.getFileMetadata('new-inquiries.json'),
        databaseAPI.getFile('inquiries.json'),
        databaseAPI.getRecent('inquiries')
      ]);
      
      setMetadata(metaRes.data);
      setNewMetadata(newMetaRes.data);
      setInquiries(inqRes.data as Inquiry[]);
      setNewInquiries(newInqRes.data as Inquiry[]);
    } catch (error) {
      console.error('Failed to fetch inquiries data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (filename: string, format: 'csv' | 'json') => {
    try {
      await handleFileExport(filename, format);
    } catch (error) {
      setToast({ message: 'Failed to export file', type: 'error', isVisible: true });
    }
  };

  const handleClearNew = async () => {
    setShowConfirmDialog(false);
    try {
      await handleClearNewItems('inquiries', fetchData);
      setToast({ message: 'New inquiries list cleared successfully', type: 'success', isVisible: true });
    } catch (error) {
      setToast({ message: 'Failed to clear new inquiries list', type: 'error', isVisible: true });
    }
  };

  const getStatusBreakdown = () => {
    const breakdown: Record<string, number> = {};
    inquiries.forEach(inq => {
      breakdown[inq.status] = (breakdown[inq.status] || 0) + 1;
    });
    return breakdown;
  };

  if (loading) {
    return <div className="text-center py-8">Loading inquiries data...</div>;
  }

  const statusBreakdown = getStatusBreakdown();

  return (
    <div className="space-y-6">
      {/* All Inquiries Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">📝 All Inquiries (inquiries.json)</h3>
          <ExportButtons onExport={(format) => handleExport('inquiries.json', format)} />
        </div>
        
        <FileMetadataComponent metadata={metadata} />
        
        {Object.keys(statusBreakdown).length > 0 && (
          <div className="mt-4 bg-gray-50 rounded p-4">
            <h4 className="font-semibold text-gray-900 mb-2">Status Breakdown:</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              {Object.entries(statusBreakdown).map(([status, count]) => (
                <div key={status} className="flex justify-between">
                  <span className="text-gray-600 capitalize">{status}:</span>
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
            <DataTable data={inquiries as unknown as Record<string, unknown>[]} maxRows={10} />
          </div>
        )}
      </div>

      {/* New Inquiries Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">⭐ New/Unassigned Inquiries (new-inquiries.json)</h3>
          {newInquiries.length > 0 && (
            <button
              onClick={() => setShowConfirmDialog(true)}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
            >
              🗑️ Clear New Inquiries List
            </button>
          )}
        </div>
        
        <FileMetadataComponent metadata={newMetadata} />

        {newInquiries.length === 0 ? (
          <div className="mt-4 text-center py-8 text-gray-500">
            No new inquiries to display
          </div>
        ) : (
          <>
            <div className="mt-4">
              <button
                onClick={() => setShowNewInquiries(!showNewInquiries)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                {showNewInquiries ? '📋 Hide List' : '📋 View List'}
              </button>
            </div>

            {showNewInquiries && (
              <div className="mt-4 space-y-4">
                {newInquiries.map((inquiry) => (
                  <div key={inquiry.id} className="border border-gray-200 rounded p-4">
                    <div className="font-semibold text-lg text-gray-900">
                      {inquiry.id} | {inquiry.name}
                    </div>
                    <div className="text-sm text-gray-600 mt-2 space-y-1">
                      <div>Property: {inquiry.propertyTitle || inquiry.propertyId}</div>
                      <div>Received: {new Date(inquiry.createdAt).toLocaleString()}</div>
                      <div>Status: {inquiry.status}</div>
                      <div>Email: {inquiry.email}</div>
                      <div>Phone: {inquiry.phone}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="Clear New Inquiries"
        message="Are you sure you want to clear the new inquiries list? This action cannot be undone."
        onConfirm={handleClearNew}
        onCancel={() => setShowConfirmDialog(false)}
        confirmText="Clear"
        cancelText="Cancel"
        confirmStyle="danger"
      />

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
