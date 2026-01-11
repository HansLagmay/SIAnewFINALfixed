import { useState } from 'react';
import { calendarAPI, inquiriesAPI } from '../../services/api';
import type { Inquiry, User } from '../../types';

interface ScheduleViewingModalProps {
  user: User;
  inquiry?: Inquiry;
  onClose: () => void;
  onSuccess: () => void;
}

const ScheduleViewingModal = ({ user, inquiry, onClose, onSuccess }: ScheduleViewingModalProps) => {
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    duration: '60', // minutes
    notes: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const validateSchedule = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    
    if (!formData.time) {
      newErrors.time = 'Time is required';
    }
    
    if (formData.date && formData.time) {
      const scheduleDateTime = new Date(`${formData.date}T${formData.time}`);
      const now = new Date();
      
      // Cannot schedule in past
      if (scheduleDateTime < now) {
        newErrors.date = 'Cannot schedule in the past';
      }
      
      // Business hours check (8 AM - 6 PM)
      const hour = scheduleDateTime.getHours();
      if (hour < 8 || hour >= 18) {
        newErrors.time = 'Viewings must be between 8 AM and 6 PM';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateSchedule()) return;
    
    setSubmitting(true);
    try {
      const startDateTime = new Date(`${formData.date}T${formData.time}`);
      const endDateTime = new Date(startDateTime.getTime() + parseInt(formData.duration) * 60000);
      
      // Create calendar event
      const eventData = {
        title: `Property Viewing - ${inquiry?.propertyTitle || 'TBD'}`,
        description: `Customer: ${inquiry?.name || 'TBD'}\n${formData.notes}`,
        start: startDateTime.toISOString(),
        end: endDateTime.toISOString(),
        agentId: user.id,
        inquiryId: inquiry?.id || null,
        type: 'viewing' as const
      };
      
      await calendarAPI.create(eventData);
      
      // Update inquiry status if linked
      if (inquiry) {
        await inquiriesAPI.update(inquiry.id, {
          status: 'viewing-scheduled',
          notes: [
            ...(inquiry.notes || []),
            {
              id: Date.now().toString(),
              agentId: user.id,
              agentName: user.name,
              note: `Viewing scheduled for ${formData.date} at ${formData.time}`,
              createdAt: new Date().toISOString()
            }
          ]
        });
      }
      
      alert('Viewing scheduled successfully!');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Failed to schedule viewing:', error);
      
      if (error.response?.status === 409) {
        alert('Conflict detected: You have another event scheduled within 30 minutes of this time.');
      } else {
        alert('Failed to schedule viewing');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Schedule Property Viewing</h2>
        
        {inquiry && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Customer: <span className="font-semibold">{inquiry.name}</span></p>
            <p className="text-sm text-gray-600">Property: <span className="font-semibold">{inquiry.propertyTitle}</span></p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            {errors.date && <p className="text-red-600 text-sm mt-1">{errors.date}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
            <input
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              min="08:00"
              max="18:00"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            {errors.time && <p className="text-red-600 text-sm mt-1">{errors.time}</p>}
            <p className="text-xs text-gray-500 mt-1">Business hours: 8:00 AM - 6:00 PM</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
            <select
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="90">1.5 hours</option>
              <option value="120">2 hours</option>
              <option value="180">3 hours</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              placeholder="Meeting location, special instructions, etc."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? 'Scheduling...' : 'Schedule Viewing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleViewingModal;
