import { useState, useEffect } from 'react';
import { calendarAPI } from '../../services/api';
import { inquiriesAPI } from '../../services/api';
import type { CalendarEvent, Inquiry, User } from '../../types';
import ScheduleViewingModal from './ScheduleViewingModal';
import { getUser } from '../../utils/session';

interface AgentCalendarProps {
  user: User | null;
}

const AgentCalendar = ({ user }: AgentCalendarProps) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [effectiveUser, setEffectiveUser] = useState<User | null>(null);
    const [inquiryMap, setInquiryMap] = useState<Record<string, Inquiry>>({});
    const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  useEffect(() => {
    const u = user || getUser();
    setEffectiveUser(u);
  }, [user]);

  useEffect(() => {
    if (effectiveUser) {
      loadEvents(effectiveUser);
      loadAgentInquiries(effectiveUser);
    } else {
      setLoading(false);
    }
  }, [effectiveUser]);

  const loadEvents = async (u: User) => {
    try {
      const response = await calendarAPI.getAll();
      const myEvents = response.data.filter((e: any) => e.agentId === u.id);
      setEvents(myEvents);
    } catch (error) {
      console.error('Failed to load calendar events:', error);
      setError('Failed to load calendar events. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const loadAgentInquiries = async (u: User) => {
    try {
      const res = await inquiriesAPI.getAll();
      const mine = res.data.filter((i: Inquiry) =>
        (i.assignedTo === u.id || i.claimedBy === u.id)
      );
      const map: Record<string, Inquiry> = {};
      mine.forEach((i: Inquiry) => { map[i.id] = i; });
      setInquiryMap(map);
    } catch (err) {
      console.error('Failed to load inquiries for calendar details:', err);
    }
  };

  if (loading) {
    return <div className="p-8">Loading calendar...</div>;
  }

  return (
    <div className="p-8">
      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded">
          {error}
        </div>
      )}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">My Calendar</h1>
        <button
          onClick={() => { setEditingEvent(null); setShowScheduleModal(true); }}
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
                    <div className="text-sm text-gray-600 mb-3 space-y-1">
                      {(() => {
                        const linkedInquiry = event.inquiryId ? inquiryMap[event.inquiryId] : undefined;
                        const customerLine = event.description?.split('\n').find(l => l.startsWith('Customer: '));
                        const ticketLine = event.description?.split('\n').find(l => l.startsWith('Ticket: '));
                        return (
                          <>
                            <p>Customer: <span className="font-semibold">{linkedInquiry?.name || (customerLine ? customerLine.replace('Customer: ', '') : '—')}</span></p>
                            <p>Ticket: <span className="font-mono">{linkedInquiry?.ticketNumber || (ticketLine ? ticketLine.replace('Ticket: ', '') : '—')}</span></p>
                            {linkedInquiry?.propertyTitle && (
                              <p>Property: <span className="font-semibold">{linkedInquiry.propertyTitle}</span></p>
                            )}
                          </>
                        );
                      })()}
                    </div>
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
                  <div className="ml-4">
                    <button
                      onClick={() => { setEditingEvent(event); setShowScheduleModal(true); }}
                      className="px-3 py-2 text-sm bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
                    >
                      Edit
                    </button>
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

      {showScheduleModal && effectiveUser && (
        <ScheduleViewingModal
          user={effectiveUser}
          event={editingEvent || undefined}
          onClose={() => setShowScheduleModal(false)}
          onSuccess={() => {
            if (effectiveUser) {
              loadEvents(effectiveUser);
            }
          }}
        />
      )}
    </div>
  );
};

export default AgentCalendar;
