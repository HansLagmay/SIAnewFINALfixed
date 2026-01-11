import { useState, useEffect } from 'react';
import { propertiesAPI } from '../../services/api';
import type { Property } from '../../types';

const AgentProperties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      const response = await propertiesAPI.getAll();
      setProperties(response.data.filter((p: any) => p.status === 'available'));
    } catch (error) {
      console.error('Failed to load properties:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading properties...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Available Properties</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
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

      {properties.length === 0 && (
        <div className="text-center py-12 text-gray-600">
          No available properties at the moment.
        </div>
      )}
    </div>
  );
};

export default AgentProperties;
