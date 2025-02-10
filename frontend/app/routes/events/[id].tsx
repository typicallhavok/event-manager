import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../../contexts/UserContext';

interface Event {
  _id: string;
  organization: string;
  name: string;
  subtitle: string;
  description: string;
  date: string;
  venue: {
    name: string;
    address: string;
    city: string;
  };
  time: {
    from: string;
    to: string;
  };
  status: 'draft' | 'published' | 'cancelled';
  attendees: string[];
}

const EventDetailPage: React.FC = () => {
  const { id } = useParams();
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [isRegistered, setIsRegistered] = useState(false);

  const handleRegistration = async () => {
    if (!user) {
      navigate('/login', { 
        state: { redirectTo: `/events/${id}` }
      });
      return;
    }

    // Check if already registered
    if (isRegistered) {
      setError('You are already registered for this event');
      return;
    }

    try {
      setLoading(true);
      // Check registration status first
      const checkResponse = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/events/${id}/registration-status`,
        { withCredentials: true }
      );

      if (checkResponse.data.isRegistered) {
        setIsRegistered(true);
        setError('You are already registered for this event');
        return;
      }

      // Proceed with registration if not already registered
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/events/${id}/register`,
        {},
        { withCredentials: true }
      );
      
      setIsRegistered(true);
      setEvent(prev => prev ? {
        ...prev,
        attendees: [...prev.attendees, user._id]
      } : null);
      setError(''); // Clear any existing errors
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || 'Failed to register');
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  // Update the useEffect to check registration status on load
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const [eventResponse, registrationResponse] = await Promise.all([
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/events/${id}`, { 
            withCredentials: true 
          }),
          user ? axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/events/${id}/registration-status`,
            { withCredentials: true }
          ) : Promise.resolve({ data: { isRegistered: false } })
        ]);

        setEvent(eventResponse.data);
        setIsRegistered(registrationResponse.data.isRegistered);
        setError(''); // Clear any existing errors
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.error || 'Failed to load event');
        } else {
          setError('An unexpected error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-black text-white p-4">
        <div className="container mx-auto">
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg">
            {error || 'Event not found'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="container mx-auto px-4 py-8 md:py-16 flex flex-col lg:flex-row items-start justify-between gap-12">
        <div className="w-full lg:w-2/3 space-y-8">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 rounded-full px-4 py-2 text-base md:text-lg">
              <span className="mr-3 text-xl">🌟</span>
              <span className="text-gray-300">{event.organization}</span>
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold">
            {event.name}
          </h1>
          
          <h2 className="text-xl md:text-3xl text-gray-300">
            {event.subtitle}
          </h2>
          
          <p className="text-lg md:text-xl text-gray-400 whitespace-pre-wrap">
            {event.description}
          </p>
          
          <div className="space-y-4 md:space-y-6">
            <div className="flex items-center space-x-3 text-gray-300 bg-white/5 rounded-lg p-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{new Date(event.date).toLocaleDateString('en-US', { 
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</span>
            </div>
            
            <div className="flex items-center space-x-3 text-gray-300 bg-white/5 rounded-lg p-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div className="flex flex-col">
                <span className="font-medium">{event.venue.name}</span>
                <span className="text-gray-400">{event.venue.address}</span>
                <span className="text-gray-400">{event.venue.city}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 text-gray-300 bg-white/5 rounded-lg p-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{event.time.from} - {event.time.to}</span>
            </div>
          </div>
        </div>
        
        <div className="w-full lg:w-1/3 sticky top-8 space-y-6">
          <div className="w-full aspect-square bg-gradient-to-br from-purple-500 via-pink-500 to-blue-600 rounded-3xl p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0MCIgZmlsbD0id2hpdGUiLz48L3N2Zz4=')] opacity-10"></div>
            <div className="relative z-10 w-full h-full bg-gradient-to-br from-purple-300 via-pink-200 to-blue-400 rounded-2xl transform rotate-6 origin-center"></div>
          </div>
          <div className="w-full bg-white/5 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-400">
                  {event.attendees.length} {event.attendees.length === 1 ? 'attendee' : 'attendees'}
                </span>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm ${
                isRegistered ? 'bg-green-500/20 text-green-400' : 'bg-purple-500/20 text-purple-400'
              }`}>
                {isRegistered ? 'Registered' : 'Not registered'}
              </div>
            </div>
            
            <button
              onClick={handleRegistration}
              disabled={isRegistered || loading}
              className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-colors ${
                isRegistered
                  ? 'bg-green-500/20 text-green-400 cursor-not-allowed'
                  : loading
                  ? 'bg-purple-500/50 cursor-not-allowed'
                  : 'bg-purple-500 hover:bg-purple-600'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Registering...
                </span>
              ) : isRegistered ? (
                "You're registered!"
              ) : (
                'Register for event'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;