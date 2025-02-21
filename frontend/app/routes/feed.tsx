import { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';
import axios from 'axios';
import { io } from 'socket.io-client';
import { format, isFuture, isPast } from 'date-fns';
import type { Event, APIError, EventResponse, EventRegistrationResponse } from '../types';
import { AxiosError } from 'axios';

const DEFAULT_IMAGES = [
  'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead',
  'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe',
  'https://images.unsplash.com/photo-1618005198784-7976b67be157'
].map(url => `${url}?auto=format&fit=crop&w=800&q=80`);

const getRandomImage = () => DEFAULT_IMAGES[Math.floor(Math.random() * DEFAULT_IMAGES.length)];
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

type FilterType = 'upcoming' | 'past' | 'all';

export default function FeedPage() {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [filter, setFilter] = useState<FilterType>('upcoming');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: new Date().toISOString().split('T')[0],
    end: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attendeeCounts, setAttendeeCounts] = useState<Record<string, number>>({});
  const [socket, setSocket] = useState<any>(null);
  const [registeredEvents, setRegisteredEvents] = useState<Set<string>>(new Set());

  const fetchEvents = async () => {
    try {
      const { data } = await axios.get<EventResponse>(`${BACKEND_URL}/events`, {
        params: {
          date: new Date().toISOString()
        },
        withCredentials: true
      });
      setEvents(data.events);
      filterEvents(data.events, filter);
      const userRegistrations = new Set(
        user?._id
          ? data.events
              .filter(event => event.attendees.includes(user._id))
              .map(event => event._id)
          : []
      );
      setRegisteredEvents(userRegistrations);
      setError(''); // Clear any existing errors
    } catch (error) {
      const axiosError = error as AxiosError<APIError>;
      setError(axiosError.response?.data?.error || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = (eventList: Event[], filterType: FilterType) => {
    const filtered = eventList.filter(event => {
      const eventDate = new Date(event.date);
      switch (filterType) {
        case 'upcoming':
          return isFuture(eventDate);
        case 'past':
          return isPast(eventDate);
        default:
          return true;
      }
    });
    setFilteredEvents(filtered);
  };

  useEffect(() => {
    filterEvents(events, filter);
  }, [filter, events]);

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (events.length === 0) return;

    let isMounted = true;
    const socket = io(SOCKET_URL, {
      path: '/socket.io/',
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
      withCredentials: true
    });

    socket.on('connect', () => {
      events.forEach(event => {
        socket.emit('joinEvent', event._id);
      });
    });

    socket.on('attendeeUpdate', ({ eventId, count }) => {
      if (isMounted) {
        setAttendeeCounts(prev => ({
          ...prev,
          [eventId]: count
        }));
      }
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    return () => {
      isMounted = false;
      if (socket.connected) {
        events.forEach(event => {
          socket.emit('leaveEvent', event._id);
        });
        socket.disconnect();
      }
    };
  }, [events]);

  const registerForEvent = async (eventId: string) => {
    if (!user) {
      navigate('/register', {
        state: {
          redirectTo: `/events/${eventId}`,
          message: 'Please register or login to sign up for events'
        }
      });
      return;
    }

    try {
      const { data } = await axios.post<EventRegistrationResponse>(
        `${BACKEND_URL}/events/${eventId}/register`,
        {},
        { withCredentials: true }
      );

      setAttendeeCounts(prev => ({
        ...prev,
        [eventId]: data.attendeeCount
      }));
      setRegisteredEvents(prev => new Set([...prev, eventId]));
      setError('');
    } catch (error) {
      const axiosError = error as AxiosError<APIError>;
      if (axiosError.response?.status === 401) {
        navigate('/login', {
          state: {
            redirectTo: `/events/${eventId}`,
            message: 'Your session has expired. Please login again.'
          }
        });
      } else {
        setError(axiosError.response?.data?.error || 'Failed to register for event');
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl sm:text-4xl font-bold text-white">Events</h1>
            {user && (
              <Link
                to="/events/create"
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">Create Event</span>
              </Link>
            )}
          </div>
          
          <div className="flex flex-wrap gap-4 mt-4 sm:mt-0">
            <div className="flex rounded-lg overflow-hidden bg-white/10">
              {(['upcoming', 'past', 'all'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`px-4 py-2 text-sm font-medium ${filter === type
                    ? 'bg-purple-500 text-white'
                    : 'text-gray-300 hover:bg-white/5'
                    }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative">
                <label className="absolute -top-2 left-2 px-1 text-xs text-purple-400 bg-[rgb(18,11,26)]">
                  From
                </label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="bg-white/10 text-white px-3 py-2 rounded-lg border border-purple-500/30 focus:border-purple-500 focus:outline-none w-full sm:w-40"
                />
              </div>
              <div className="relative">
                <label className="absolute -top-2 left-2 px-1 text-xs text-purple-400 bg-[rgb(18,11,26)]">
                  To
                </label>
                <input
                  type="date"
                  value={dateRange.end}
                  min={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="bg-white/10 text-white px-3 py-2 rounded-lg border border-purple-500/30 focus:border-purple-500 focus:outline-none w-full sm:w-40"
                />
              </div>
              {dateRange.start || dateRange.end ? (
                <button
                  onClick={() => setDateRange({ start: '', end: '' })}
                  className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Clear dates
                </button>
              ) : null}
            </div>
          </div>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            <p className="text-xl">No events found</p>
            <p className="mt-2">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map(event => (
              <Link
                key={event._id}
                to={`/events/${event._id}`}
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
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-white mb-2">{event.name}</h2>
                      {event.subtitle && (
                        <p className="text-gray-400 text-sm mb-4">{event.subtitle}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-1 bg-purple-500/20 px-2 py-1 rounded">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      <span className="text-purple-400 text-sm">
                        {attendeeCounts[event._id] || event.attendees.length}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-between items-center">
                    <div className="flex items-center space-x-1 bg-purple-500/20 px-2 py-1 rounded">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      <span className="text-purple-400 text-sm">
                        {attendeeCounts[event._id] || event.attendees.length}
                      </span>
                    </div>

                    <button
                      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                        e.preventDefault();
                        if (!registeredEvents.has(event._id)) {
                          registerForEvent(event._id);
                        }
                      }}
                      disabled={registeredEvents.has(event._id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        !user
                          ? 'bg-purple-500/50 hover:bg-purple-500/60 text-white/90'
                          : registeredEvents.has(event._id)
                            ? 'bg-green-500/20 text-green-400 cursor-not-allowed'
                            : 'bg-purple-500 hover:bg-purple-600 text-white'
                      }`}
                    >
                      {!user 
                        ? 'Sign in to Register' 
                        : registeredEvents.has(event._id)
                          ? (
                            <span className="flex items-center gap-1">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Registered
                            </span>
                          )
                          : 'Register'
                      }
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}