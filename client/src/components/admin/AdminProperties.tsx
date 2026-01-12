import { useState, useEffect } from 'react';
import { propertiesAPI, usersAPI } from '../../services/api';
import ConfirmDialog from '../shared/ConfirmDialog';
import PromptDialog from '../shared/PromptDialog';
import Toast, { ToastType } from '../shared/Toast';
import type { Property, User } from '../../types';

const AdminProperties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [agents, setAgents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Dialog and Toast states
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showAgentPrompt, setShowAgentPrompt] = useState(false);
  const [showPricePrompt, setShowPricePrompt] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({
    message: '',
    type: 'info',
    isVisible: false
  });
  
  // State for property being edited
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [propertiesRes, usersRes] = await Promise.all([
        propertiesAPI.getAll(),
        usersAPI.getAll()
      ]);
      setProperties(propertiesRes.data);
      setAgents(usersRes.data.filter((u: User) => u.role === 'agent'));
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProperties = async () => {
    try {
      const response = await propertiesAPI.getAll();
      setProperties(response.data);
    } catch (error) {
      console.error('Failed to load properties:', error);
    }
  };

  const handleStatusChange = async (property: Property, status: string) => {
    setSelectedProperty(property);
    setNewStatus(status);
    
    // If changing to "sold", show agent selection prompt
    if (status === 'sold') {
      setShowAgentPrompt(true);
    } else {
      // For other statuses, update immediately
      await performStatusUpdate(property, status);
    }
  };

  const handleAgentSelected = (agentId: string) => {
    setShowAgentPrompt(false);
    const selectedAgent = agents.find(a => a.id === agentId);
    
    if (!selectedAgent) {
      setToast({ message: 'Invalid agent ID', type: 'error', isVisible: true });
      return;
    }
    
    setSelectedAgentId(agentId);
    // Now show price prompt
    setShowPricePrompt(true);
  };

  const handlePriceEntered = async (price: string) => {
    setShowPricePrompt(false);
    
    if (!selectedProperty || !selectedAgentId) return;
    
    const finalPrice = price ? parseFloat(price) : selectedProperty.price;
    await performStatusUpdate(selectedProperty, newStatus, selectedAgentId, finalPrice);
  };

  const performStatusUpdate = async (
    property: Property, 
    status: string, 
    agentId?: string, 
    finalSalePrice?: number
  ) => {
    const admin = JSON.parse(localStorage.getItem('user') || '{}');
    
    try {
      let updateData: Partial<Property> = {
        status: status as Property['status'],
        statusHistory: [
          ...(property.statusHistory || []),
          {
            status: status,
            changedBy: admin.id,
            changedByName: admin.name,
            changedAt: new Date().toISOString()
          }
        ]
      };
      
      // If changing to "sold", include agent and sale details
      if (status === 'sold' && agentId && finalSalePrice !== undefined) {
        const selectedAgent = agents.find(a => a.id === agentId);
        if (selectedAgent) {
          updateData = {
            ...updateData,
            soldBy: selectedAgent.name,
            soldByAgentId: selectedAgent.id,
            soldAt: new Date().toISOString(),
            salePrice: finalSalePrice,
            statusHistory: [
              ...(property.statusHistory || []),
              {
                status: status,
                changedBy: admin.id,
                changedByName: admin.name,
                changedAt: new Date().toISOString(),
                reason: `Sold by ${selectedAgent.name} for ₱${finalSalePrice.toLocaleString()}`
              }
            ]
          };
        }
      }
      
      await propertiesAPI.update(property.id, updateData);
      await loadProperties();
      setToast({ message: 'Property status updated successfully!', type: 'success', isVisible: true });
    } catch (error) {
      console.error('Failed to update property status:', error);
      setToast({ message: 'Failed to update property status', type: 'error', isVisible: true });
    }
  };

  const handleDelete = async (id: string) => {
    setSelectedProperty(properties.find(p => p.id === id) || null);
    setShowConfirmDialog(true);
  };

  const confirmDelete = async () => {
    setShowConfirmDialog(false);
    if (!selectedProperty) return;

    try {
      await propertiesAPI.delete(selectedProperty.id);
      await loadProperties();
      setToast({ message: 'Property deleted successfully', type: 'success', isVisible: true });
    } catch (error) {
      console.error('Failed to delete property:', error);
      setToast({ message: 'Failed to delete property', type: 'error', isVisible: true });
    }
  };

  if (loading) {
    return <div className="p-8">Loading properties...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Properties</h1>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Property
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {properties.map((property) => (
              <tr key={property.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <img
                      src={property.imageUrl}
                      alt={property.title}
                      className="w-12 h-12 rounded object-cover"
                    />
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{property.title}</div>
                      <div className="text-sm text-gray-500">{property.bedrooms} bed • {property.bathrooms} bath</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    {property.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ₱{property.price.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {property.location}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={property.status}
                    onChange={(e) => handleStatusChange(property, e.target.value)}
                    className={`px-2 py-1 text-xs font-semibold rounded-full border-0 ${
                      property.status === 'available' ? 'bg-green-100 text-green-800' :
                      property.status === 'reserved' ? 'bg-yellow-100 text-yellow-800' :
                      property.status === 'under-contract' ? 'bg-blue-100 text-blue-800' :
                      property.status === 'sold' ? 'bg-purple-100 text-purple-800' :
                      property.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                      property.status === 'withdrawn' ? 'bg-orange-100 text-orange-800' :
                      property.status === 'off-market' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <option value="draft">Draft</option>
                    <option value="available">Available</option>
                    <option value="reserved">Reserved</option>
                    <option value="under-contract">Under Contract</option>
                    <option value="sold">Sold</option>
                    <option value="withdrawn">Withdrawn</option>
                    <option value="off-market">Off Market</option>
                  </select>
                  {property.soldBy && (
                    <p className="text-xs text-gray-500 mt-1">
                      Sold by: {property.soldBy}
                    </p>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleDelete(property.id)}
                    className="text-red-600 hover:text-red-900 ml-4"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Confirm Dialog for Delete */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="Delete Property"
        message="Are you sure you want to delete this property? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setShowConfirmDialog(false)}
        confirmText="Delete"
        cancelText="Cancel"
        confirmStyle="danger"
      />

      {/* Prompt Dialog for Agent Selection */}
      <PromptDialog
        isOpen={showAgentPrompt}
        title="Select Agent"
        message={`Enter agent ID who sold this property. Available agents: ${agents.map(a => `${a.name} (${a.id})`).join(', ')}`}
        placeholder="Enter agent ID"
        onConfirm={handleAgentSelected}
        onCancel={() => setShowAgentPrompt(false)}
        confirmText="Next"
        cancelText="Cancel"
        validator={(value) => {
          if (!value) return 'Agent ID is required';
          if (!agents.find(a => a.id === value)) return 'Invalid agent ID';
          return null;
        }}
      />

      {/* Prompt Dialog for Sale Price */}
      <PromptDialog
        isOpen={showPricePrompt}
        title="Enter Sale Price"
        message={`Enter final sale price for this property (default: ₱${selectedProperty?.price.toLocaleString()})`}
        placeholder="Enter sale price"
        defaultValue={selectedProperty?.price.toString() || ''}
        onConfirm={handlePriceEntered}
        onCancel={() => setShowPricePrompt(false)}
        confirmText="Confirm"
        cancelText="Cancel"
        validator={(value) => {
          const price = parseFloat(value);
          if (value && (isNaN(price) || price <= 0)) return 'Please enter a valid price';
          return null;
        }}
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
};

export default AdminProperties;
