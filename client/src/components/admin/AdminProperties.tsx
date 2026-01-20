import { useState, useEffect } from 'react';
import { propertiesAPI, usersAPI } from '../../services/api';
import ConfirmDialog from '../shared/ConfirmDialog';
import PromptDialog from '../shared/PromptDialog';
import Toast, { ToastType } from '../shared/Toast';
import type { Property, User } from '../../types';
import type { PropertyUpdateData } from '../../types/api';
import { useDialog } from '../../hooks/useDialog';

const AdminProperties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [agents, setAgents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const {
    dialogState,
    toastState,
    openConfirm,
    openPrompt,
    showToast,
    handleConfirm,
    handleCancel,
    handlePromptSubmit,
    handlePromptCancel,
    closeToast
  } = useDialog();

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

  const handleStatusChange = async (property: Property, newStatus: Property['status']) => {
    const admin = JSON.parse(localStorage.getItem('user') || '{}');
    
    try {
      let updateData: PropertyUpdateData = {
        status: newStatus,
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
      
      // If changing to "sold", require agent selection and sale details
      if (newStatus === 'sold') {
        const agentId = await openPrompt({
          title: 'Select Agent',
          message: `Enter agent ID who sold this property:`,
          placeholder: `Available agents: ${agents.map(a => `${a.name} (${a.id})`).join(', ')}`
        });
        
        if (!agentId) {
          showToast({ type: 'error', message: 'Agent ID is required for sold properties' });
          return;
        }
        
        const selectedAgent = agents.find(a => a.id === agentId);
        if (!selectedAgent) {
          showToast({ type: 'error', message: 'Invalid agent ID' });
          return;
        }
        
        const salePriceStr = await openPrompt({
          title: 'Enter Sale Price',
          message: `Enter final sale price (default: ₱${property.price.toLocaleString()}):`,
          defaultValue: property.price.toString(),
          inputType: 'number'
        });
        
        const salePrice = salePriceStr ? parseFloat(salePriceStr) : property.price;
        
        // Get commission rate
        const commissionRateStr = await openPrompt({
          title: 'Enter Commission Rate',
          message: 'Enter commission rate percentage (e.g., 3 for 3%):',
          defaultValue: '3',
          inputType: 'number'
        });
        
        const commissionRate = commissionRateStr ? parseFloat(commissionRateStr) : 3;
        const commissionAmount = (salePrice * commissionRate) / 100;
        
        updateData = {
          ...updateData,
          soldBy: selectedAgent.name,
          soldByAgentId: selectedAgent.id,
          soldAt: new Date().toISOString(),
          salePrice: salePrice,
          commission: {
            rate: commissionRate,
            amount: commissionAmount,
            status: 'pending',
            paidAt: undefined,
            paidBy: undefined
          },
          statusHistory: [
            ...(property.statusHistory || []),
            {
              status: newStatus,
              changedBy: admin.id,
              changedByName: admin.name,
              changedAt: new Date().toISOString(),
              reason: `Sold by ${selectedAgent.name} for ₱${salePrice.toLocaleString()} (Commission: ${commissionRate}% = ₱${commissionAmount.toLocaleString()})`
            }
          ]
        };
      }
      
      await propertiesAPI.update(property.id, updateData);
      await loadProperties();
      showToast({ type: 'success', message: 'Property status updated successfully!' });
    } catch (error) {
      console.error('Failed to update property status:', error);
      showToast({ type: 'error', message: 'Failed to update property status' });
    }
  };

  const handleMarkCommissionPaid = async (property: Property) => {
    if (!property.commission || property.commission.status === 'paid') {
      showToast({ type: 'error', message: 'Commission already paid or not available' });
      return;
    }

    const confirmed = await openConfirm({
      title: 'Mark Commission as Paid',
      message: `Mark commission of ₱${property.commission.amount.toLocaleString()} for ${property.title} as paid?`,
      confirmText: 'Mark as Paid',
      cancelText: 'Cancel',
      variant: 'default'
    });
    
    if (!confirmed) return;

    const admin = JSON.parse(localStorage.getItem('user') || '{}');

    try {
      const updateData: PropertyUpdateData = {
        commission: {
          ...property.commission,
          status: 'paid',
          paidAt: new Date().toISOString(),
          paidBy: admin.name
        }
      };

      await propertiesAPI.update(property.id, updateData);
      await loadProperties();
      showToast({ type: 'success', message: 'Commission marked as paid successfully!' });
    } catch (error) {
      console.error('Failed to mark commission as paid:', error);
      showToast({ type: 'error', message: 'Failed to update commission status' });
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await openConfirm({
      title: 'Delete Property',
      message: 'Are you sure you want to delete this property?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger'
    });
    
    if (!confirmed) return;

    try {
      await propertiesAPI.delete(selectedProperty.id);
      await loadProperties();
      showToast({ type: 'success', message: 'Property deleted successfully' });
    } catch (error) {
      console.error('Failed to delete property:', error);
      showToast({ type: 'error', message: 'Failed to delete property' });
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
                    onChange={(e) => handleStatusChange(property, e.target.value as Property['status'])}
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
                    <div className="mt-1">
                      <p className="text-xs text-gray-500">
                        Sold by: {property.soldBy}
                      </p>
                      {property.commission && (
                        <p className="text-xs text-gray-500">
                          Commission: ₱{property.commission.amount.toLocaleString()} ({property.commission.rate}%)
                          {' - '}
                          <span className={property.commission.status === 'paid' ? 'text-green-600' : 'text-yellow-600'}>
                            {property.commission.status === 'paid' ? 'Paid' : 'Pending'}
                          </span>
                        </p>
                      )}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {property.commission && property.commission.status === 'pending' && (
                    <button
                      onClick={() => handleMarkCommissionPaid(property)}
                      className="text-green-600 hover:text-green-900 mr-4"
                      title="Mark commission as paid"
                    >
                      Pay Commission
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(property.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Dialogs */}
      {dialogState.type === 'confirm' && dialogState.config && 'confirmText' in dialogState.config && (
        <ConfirmDialog
          isOpen={dialogState.isOpen}
          title={dialogState.config.title}
          message={dialogState.config.message}
          confirmText={dialogState.config.confirmText}
          cancelText={dialogState.config.cancelText}
          variant={dialogState.config.variant}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
      
      {dialogState.type === 'prompt' && dialogState.config && 'placeholder' in dialogState.config && (
        <PromptDialog
          isOpen={dialogState.isOpen}
          title={dialogState.config.title}
          message={dialogState.config.message}
          placeholder={dialogState.config.placeholder}
          defaultValue={dialogState.config.defaultValue}
          inputType={dialogState.config.inputType}
          onSubmit={handlePromptSubmit}
          onCancel={handlePromptCancel}
        />
      )}
      
      {toastState.isVisible && (
        <Toast
          message={toastState.message}
          type={toastState.type}
          duration={toastState.duration}
          onClose={closeToast}
        />
      )}
    </div>
  );
};

export default AdminProperties;
