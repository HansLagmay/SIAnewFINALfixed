import { useState, useEffect } from 'react';
import { calendarAPI } from '../../services/api';
import type { CalendarEvent, User } from '../../types';
import ScheduleViewingModal from './ScheduleViewingModal';

interface AgentCalendarProps {
  user: User | null;
}

const AgentCalendar = ({ user }: AgentCalendarProps) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  useEffect(() => {
    if (user) {
      loadEvents();
    }
  }, [user]);

  const loadEvents = async () => {
    try {
      const response = await calendarAPI.getAll();
      // Filter events for this agent
      const myEvents = response.data.filter((e: any) => e.agentId === user?.id);
      setEvents(myEvents);
    } catch (error) {
      console.error('Failed to load calendar events:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading calendar...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">My Calendar</h1>
        <button
          onClick={() => setShowScheduleModal(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
        >
          + Schedule Viewing
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        {events.length === 0 ? (
          <div className="p-8 text-center text-gray-600">
            No scheduled events yet.
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {events.map((event) => (
              <div key={event.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{event.title}</h3>
                    {event.description && (
                      <p className="text-sm text-gray-600 mb-3">{event.description}</p>
                    )}
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>📅 <strong>Start:</strong> {new Date(event.start).toLocaleString()}</p>
                      <p>📅 <strong>End:</strong> {new Date(event.end).toLocaleString()}</p>
                      <p>🏷️ <strong>Type:</strong> 
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${
                          event.type === 'viewing' ? 'bg-blue-100 text-blue-800' :
                          event.type === 'meeting' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {event.type}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 p-6 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          💡 <strong>Tip:</strong> Use the "Schedule Viewing" button to create property viewing appointments.
        </p>
      </div>

      {showScheduleModal && user && (
        <ScheduleViewingModal
          user={user}
          onClose={() => setShowScheduleModal(false)}
          onSuccess={() => {
            loadEvents();
          }}
        />
      )}
    </div>
  );
};

export default AgentCalendar;
