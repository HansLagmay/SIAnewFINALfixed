import { useState, useEffect } from 'react';
import { inquiriesAPI } from '../../services/api';
import type { Inquiry } from '../../types';

const AdminInquiries = () => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadInquiries();
  }, []);

  const loadInquiries = async () => {
    try {
      const response = await inquiriesAPI.getAll();
      setInquiries(response.data);
    } catch (error) {
      console.error('Failed to load inquiries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: 'pending' | 'contacted' | 'closed') => {
    try {
      await inquiriesAPI.update(id, { status: newStatus });
      await loadInquiries();
    } catch (error) {
      console.error('Failed to update inquiry:', error);
      alert('Failed to update inquiry status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this inquiry?')) return;

    try {
      await inquiriesAPI.delete(id, 'Admin');
      await loadInquiries();
    } catch (error) {
      console.error('Failed to delete inquiry:', error);
      alert('Failed to delete inquiry');
    }
  };

  const filteredInquiries = filter === 'all' 
    ? inquiries 
    : inquiries.filter(i => i.status === filter);

  if (loading) {
    return <div className="p-8">Loading inquiries...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Inquiries</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition ${
              filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg transition ${
              filter === 'pending' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('contacted')}
            className={`px-4 py-2 rounded-lg transition ${
              filter === 'contacted' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Contacted
          </button>
          <button
            onClick={() => setFilter('closed')}
            className={`px-4 py-2 rounded-lg transition ${
              filter === 'closed' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Closed
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        {filteredInquiries.length === 0 ? (
          <div className="p-8 text-center text-gray-600">
            No inquiries found.
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredInquiries.map((inquiry) => (
              <div key={inquiry.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-800">{inquiry.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        inquiry.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        inquiry.status === 'contacted' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {inquiry.status}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600 mb-3">
                      <p>📧 {inquiry.email}</p>
                      <p>📱 {inquiry.phone}</p>
                      <p>🏠 <strong>Property:</strong> {inquiry.propertyTitle}</p>
                      {inquiry.message && <p>💬 <strong>Message:</strong> {inquiry.message}</p>}
                      <p className="text-xs text-gray-500">
                        📅 {new Date(inquiry.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <select
                        value={inquiry.status}
                        onChange={(e) => handleStatusUpdate(inquiry.id, e.target.value as any)}
                        className="px-3 py-1 border border-gray-300 rounded text-sm"
                      >
                        <option value="pending">Pending</option>
                        <option value="contacted">Contacted</option>
                        <option value="closed">Closed</option>
                      </select>
                      <button
                        onClick={() => handleDelete(inquiry.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminInquiries;
