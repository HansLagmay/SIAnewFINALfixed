import { useState, useEffect } from 'react';
import { propertiesAPI } from '../../services/api';
import type { Property, User } from '../../types';
import { PropertyFormData } from '../../types/forms';
  import { getUser } from '../../utils/session';

const AgentProperties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [draftForm, setDraftForm] = useState<PropertyFormData>({
    title: '',
    type: 'House',
    price: 0,
    location: '',
    bedrooms: 0,
    bathrooms: 0,
    area: 0,
    description: '',
    features: [],
    status: 'draft',
    imageUrl: ''
  });

  useEffect(() => {
    const u = getUser();
    if (u) setUser(u);
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      const response = await propertiesAPI.getAll();
      setProperties(response.data);
    } catch (error) {
      console.error('Failed to load properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDraft = async () => {
    try {
      if (!draftForm.title) {
        alert('Title is required');
        return;
      }
      const payload: Partial<Property> = {
        title: draftForm.title,
        type: draftForm.type,
        price: draftForm.price,
        location: draftForm.location,
        bedrooms: draftForm.bedrooms,
        bathrooms: draftForm.bathrooms,
        area: draftForm.area,
        description: draftForm.description,
        features: draftForm.features,
        status: 'draft',
        imageUrl: draftForm.imageUrl,
        statusHistory: [],
        viewCount: 0,
        viewHistory: []
      };
      await propertiesAPI.createDraft(payload);
      await loadProperties();
      setShowCreate(false);
      setDraftForm({
        title: '',
        type: 'House',
        price: 0,
        location: '',
        bedrooms: 0,
        bathrooms: 0,
        area: 0,
        description: '',
        features: [],
        status: 'draft',
        imageUrl: ''
      });
      alert('Draft property created');
    } catch (error) {
      console.error('Failed to create draft property:', error);
      alert('Failed to create draft property');
    }
  };

  if (loading) {
    return <div className="p-8">Loading properties...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Properties</h1>
        <button
          onClick={() => setShowCreate(s => !s)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
        >
          {showCreate ? 'Close' : 'Create Draft Property'}
        </button>
      </div>

      {showCreate && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="text-sm font-semibold text-gray-700">Title *</label>
            <input
              type="text"
              value={draftForm.title}
              onChange={(e) => setDraftForm({ ...draftForm, title: e.target.value })}
              placeholder="Title *"
              className="px-4 py-2 border rounded-lg"
            />
            <label className="text-sm font-semibold text-gray-700">Type</label>
            <select
              value={draftForm.type}
              onChange={(e) => setDraftForm({ ...draftForm, type: e.target.value })}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="House">House</option>
              <option value="Condominium">Condominium</option>
              <option value="Villa">Villa</option>
              <option value="Apartment">Apartment</option>
            </select>
            <label className="text-sm font-semibold text-gray-700">Price (PHP)</label>
            <input
              type="number"
              value={draftForm.price}
              onChange={(e) => setDraftForm({ ...draftForm, price: Number(e.target.value) })}
              placeholder="Price (PHP)"
              className="px-4 py-2 border rounded-lg"
            />
            <label className="text-sm font-semibold text-gray-700">Location</label>
            <input
              type="text"
              value={draftForm.location}
              onChange={(e) => setDraftForm({ ...draftForm, location: e.target.value })}
              placeholder="Location"
              className="px-4 py-2 border rounded-lg"
            />
            <label className="text-sm font-semibold text-gray-700">Bedrooms</label>
            <input
              type="number"
              value={draftForm.bedrooms}
              onChange={(e) => setDraftForm({ ...draftForm, bedrooms: Number(e.target.value) })}
              placeholder="Bedrooms"
              className="px-4 py-2 border rounded-lg"
            />
            <label className="text-sm font-semibold text-gray-700">Bathrooms</label>
            <input
              type="number"
              value={draftForm.bathrooms}
              onChange={(e) => setDraftForm({ ...draftForm, bathrooms: Number(e.target.value) })}
              placeholder="Bathrooms"
              className="px-4 py-2 border rounded-lg"
            />
            <label className="text-sm font-semibold text-gray-700">Area (sqm)</label>
            <input
              type="number"
              value={draftForm.area}
              onChange={(e) => setDraftForm({ ...draftForm, area: Number(e.target.value) })}
              placeholder="Area (sqm)"
              className="px-4 py-2 border rounded-lg"
            />
            <label className="text-sm font-semibold text-gray-700">Image URL</label>
            <input
              type="text"
              value={draftForm.imageUrl}
              onChange={(e) => setDraftForm({ ...draftForm, imageUrl: e.target.value })}
              placeholder="Image URL"
              className="px-4 py-2 border rounded-lg"
            />
            <label className="text-sm font-semibold text-gray-700 md:col-span-2">Description</label>
            <textarea
              value={draftForm.description}
              onChange={(e) => setDraftForm({ ...draftForm, description: e.target.value })}
              placeholder="Description"
              className="md:col-span-2 px-4 py-2 border rounded-lg"
              rows={4}
            />
          </div>
          <div className="mt-4 flex gap-3">
            <button
              onClick={handleCreateDraft}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
            >
              Create Draft
            </button>
            <button
              onClick={() => setShowCreate(false)}
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <h2 className="text-xl font-bold text-gray-800 mb-4">Available Properties</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {properties.filter((p: Property) => p.status === 'available').map((property) => (
          <div key={property.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <img
              src={property.imageUrl}
              alt={property.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-gray-800">{property.title}</h3>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">
                  {property.type}
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-2">{property.location}</p>
              <p className="text-2xl font-bold text-blue-600 mb-3">
                ₱{property.price.toLocaleString()}
              </p>
              <div className="flex items-center gap-4 text-gray-600 text-sm">
                <span>{property.bedrooms} Beds</span>
                <span>{property.bathrooms} Baths</span>
                <span>{property.area} sqm</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-bold text-gray-800 mb-4">My Drafts</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties
          .filter((p: Property) => p.status === 'draft' && (!user || p.createdBy === user.name))
          .map((property) => (
          <div key={property.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <img
              src={property.imageUrl}
              alt={property.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-gray-800">{property.title}</h3>
                <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-semibold">
                  Draft
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-2">{property.location}</p>
              <div className="flex items-center gap-4 text-gray-600 text-sm">
                <span>{property.bedrooms} Beds</span>
                <span>{property.bathrooms} Baths</span>
                <span>{property.area} sqm</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {properties.filter((p: Property) => p.status === 'available').length === 0 && (
        <div className="text-center py-12 text-gray-600">
          No available properties at the moment.
        </div>
      )}
    </div>
  );
};

export default AgentProperties;
