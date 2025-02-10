import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';
import axios from 'axios';
import { format } from 'date-fns';
import type { Event } from '../../types';

const DEFAULT_IMAGES = [
  'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead',
  'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe',
  'https://images.unsplash.com/photo-1618005198784-7976b67be157'
].map(url => `${url}?auto=format&fit=crop&w=800&q=80`);

const getRandomImage = () => DEFAULT_IMAGES[Math.floor(Math.random() * DEFAULT_IMAGES.length)];

interface MyEvents {
  created: Event[];
  registered: Event[];
}

const MyEventsPage: React.FC = () => {
  const { user } = useContext(UserContext);
  const [events, setEvents] = useState<MyEvents>({ created: [], registered: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const fetchMyEvents = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/events/my-events`,
        { withCredentials: true }
      );
      setEvents(data);
      setError('');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || 'Failed to load events');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (eventId: string, updates: Partial<Event>) => {
    try {
      const { data } = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/events/${eventId}`,
        updates,
        { withCredentials: true }
      );
      
      // Update local state
      setEvents(prev => ({
        ...prev,
        created: prev.created.map(event => 
          event._id === eventId ? { ...event, ...data } : event
        )
      }));
      
      setEditingEvent(null);
      setError('');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || 'Failed to update event');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[rgb(18,11,26)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[rgb(18,11,26)] p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Created Events Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Events I Created</h2>
            <Link
              to="/events/create"
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Create New Event
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.created.map(event => (
              <Link
                key={event._id}
                to={`/events/create?edit=${event._id}`}
                className="bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden hover:bg-white/10 transition-all"
              >
                <img
                  src={
                    event.images?.find(img => img.isFeatured)?.url ||
                    event.images?.[0]?.url ||
                    getRandomImage()
                  }
                  alt={event.name}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = getRandomImage();
                  }}
                />
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold text-white">{event.name}</h3>
                      <p className="text-gray-400 mt-2">{event.description}</p>
                    </div>
                    <button
                      onClick={() => setEditingEvent(event)}
                      className="text-purple-400 hover:text-purple-300"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                  </div>
                  <div className="mt-4 text-sm text-gray-400">
                    {format(new Date(event.date), 'PPP')}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Registered Events Section */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-6">Events I'm Attending</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.registered.map(event => (
              <Link
                key={event._id}
                to={`/events/${event._id}`}
                className="bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden hover:bg-white/10 transition-all"
              >
                <img
                  src={event.images?.[0]?.url || '/default-event.jpg'}
                  alt={event.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-white">{event.name}</h3>
                  <p className="text-gray-400 mt-2">{event.description}</p>
                  <div className="mt-4 text-sm text-gray-400">
                    {format(new Date(event.date), 'PPP')}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default MyEventsPage;