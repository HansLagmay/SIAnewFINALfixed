import { useState, useEffect } from 'react';
import PropertyList from '../components/customer/PropertyList';
import PropertyDetailModal from '../components/customer/PropertyDetailModal';
import InquiryModal from '../components/customer/InquiryModal';
import CustomerNavbar from '../components/customer/CustomerNavbar';
import type { Property } from '../types';
import { propertiesAPI } from '../services/api';

const CustomerPortal = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');

  useEffect(() => {
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

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !filterType || property.type === filterType;
    return matchesSearch && matchesType && property.status === 'available';
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <CustomerNavbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Find Your Dream Property
          </h1>
          <p className="text-xl text-gray-600">
            Browse our collection of premium properties
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Search by title or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Types</option>
            <option value="House">House</option>
            <option value="Condominium">Condominium</option>
            <option value="Villa">Villa</option>
            <option value="Apartment">Apartment</option>
          </select>
        </div>

        {/* Property List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading properties...</p>
          </div>
        ) : (
          <PropertyList
            properties={filteredProperties}
            onViewDetails={setSelectedProperty}
            onInquire={(property) => {
              setSelectedProperty(property);
              setShowInquiryModal(true);
            }}
          />
        )}
      </div>

      {/* Modals */}
      {selectedProperty && !showInquiryModal && (
        <PropertyDetailModal
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
          onInquire={() => setShowInquiryModal(true)}
        />
      )}

      {showInquiryModal && selectedProperty && (
        <InquiryModal
          property={selectedProperty}
          onClose={() => {
            setShowInquiryModal(false);
            setSelectedProperty(null);
          }}
        />
      )}
    </div>
  );
};

export default CustomerPortal;
