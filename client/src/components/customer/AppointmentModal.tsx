import { useState } from 'react';
import type { Property } from '../../types';

interface AppointmentModalProps {
  property: Property;
  onClose: () => void;
}

const AppointmentModal = ({ property, onClose }: AppointmentModalProps) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    preferredDate: '',
    preferredTime: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full p-8">
        <h2 className="text-2xl font-bold mb-6">📅 Schedule Property Viewing</h2>

        <div className="bg-blue-50 p-4 rounded mb-6">
          <p className="font-semibold">{property.title}</p>
          <p className="text-sm text-gray-600">{property.location}</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Full Name *"
            className="w-full px-4 py-2 border rounded"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            required
          />
          <input
            type="email"
            placeholder="Email *"
            className="w-full px-4 py-2 border rounded"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <input
            type="tel"
            placeholder="Phone (09XX or +639XX) *"
            className="w-full px-4 py-2 border rounded"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />

          <input
            type="date"
            placeholder="Preferred Date *"
            className="w-full px-4 py-2 border rounded"
            value={formData.preferredDate}
            onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
            required
          />

          <select
            className="w-full px-4 py-2 border rounded"
            value={formData.preferredTime}
            onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
            required
          >
            <option value="">Select Time Slot *</option>
            <option value="09:00">9:00 AM - 10:00 AM</option>
            <option value="11:00">11:00 AM - 12:00 PM</option>
            <option value="14:00">2:00 PM - 3:00 PM</option>
            <option value="16:00">4:00 PM - 5:00 PM</option>
          </select>

          <textarea
            placeholder="Special requests or questions (optional)"
            className="w-full px-4 py-2 border rounded"
            rows={3}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />

        <div className="bg-yellow-50 border border-yellow-200 p-3 text-sm">
          ℹ️ Appointment requests are subject to agent availability. You will receive confirmation within 2 hours.
        </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg"
            >
              📅 Request Appointment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppointmentModal;
