import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

interface EventData {
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
  registrationText?: string;
}

const CreateEventPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const [eventData, setEventData] = useState<EventData>({
    organization: 'Swiss Events',
    name: 'Winter Tech Summit 2025',
    subtitle: 'The Future of Technology in Switzerland',
    description: 'Join us for an immersive experience exploring the latest innovations and technological advancements. Network with industry leaders and visionaries.',
    date: '2025-02-16',
    venue: {
      name: 'Swiss Convention Center',
      address: '1 Convention Place',
      city: 'Zurich'
    },
    time: {
      from: '09:00',
      to: '17:00'
    },
    status: 'published',
    registrationText: 'Register Now'
  });

  useEffect(() => {
    if (editId) {
      fetchEventData(editId);
    }
  }, [editId]);

  const fetchEventData = async (id: string) => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/events/${id}`,
        { withCredentials: true }
      );
      setEventData(data);
      setError('');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || 'Failed to load event');
        navigate('/events/create');
      }
    }
  };

  const handleChange = (
    key: keyof EventData | 'venueName' | 'venueAddress' | 'venueCity' | 'timeFrom' | 'timeTo',
    value: string
  ) => {
    setEventData(prev => {
      switch (key) {
        case 'venueName':
          return { ...prev, venue: { ...prev.venue, name: value } };
        case 'venueAddress':
          return { ...prev, venue: { ...prev.venue, address: value } };
        case 'venueCity':
          return { ...prev, venue: { ...prev.venue, city: value } };
        case 'timeFrom':
          return { ...prev, time: { ...prev.time, from: value } };
        case 'timeTo':
          return { ...prev, time: { ...prev.time, to: value } };
        default:
          return { ...prev, [key]: value };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/events/create`,
        {
          ...eventData,
          _id: editId
        },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 201) {
        navigate(`/events/${response.data.event._id}`);
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || 'Failed to create event');
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="min-h-[calc(100vh-20vh)] bg-black text-white flex flex-col pt-6">
      {error && (
        <div className="fixed top-20 right-4 bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      <span className="absolute top-20 right-50 bg-red-500/10 text-red-400 px-3 py-1 rounded-lg text-sm">
        * Click on the text to edit them
      </span>

      <div className="container mx-auto px-4 py-4 md:py-8 flex flex-col lg:flex-row items-start justify-between gap-12">
        <div className="w-full lg:w-2/3 space-y-8">
          <div className="flex items-center space-x-3">
            <div className="bg-white rounded-full px-4 py-2 text-base md:text-lg flex items-center group text-black font-bold">
              <span className="mr-3 text-xl">
                <svg width="30" height="30" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                  <polygon points="50,5 61,20 80,15 70,35 90,45 70,55 80,75 61,70 50,90 39,70 20,75 30,55 10,45 30,35 20,15 39,20"
                    fill="black" stroke="black" stroke-width="2" />
                </svg>

              </span>
              <input
                type="text"
                required
                placeholder="Organization name"
                value={eventData.organization}
                onChange={(e) => handleChange('organization', e.target.value)}
                className="bg-transparent outline-none focus:outline-none hover:outline-none group-hover:ring-2 group-hover:ring-purple-500/50 rounded px-3 py-1.5 transition-all placeholder-gray-500 w-full"
              />
            </div>
          </div>

          <input
            type="text"
            required
            placeholder="Event name"
            value={eventData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="text-4xl md:text-6xl lg:text-7xl font-bold bg-transparent outline-none focus:outline-none hover:ring-2 hover:ring-purple-500/50 rounded px-3 py-2 transition-all w-full placeholder-gray-700"
          />

          <input
            type="text"
            required
            placeholder="Event subtitle or tagline"
            value={eventData.subtitle}
            onChange={(e) => handleChange('subtitle', e.target.value)}
            className="text-xl md:text-3xl text-gray-300 bg-transparent outline-none focus:outline-none hover:ring-2 hover:ring-purple-500/50 rounded px-3 py-2 transition-all w-full placeholder-gray-600"
          />

          <textarea
            required
            placeholder="Describe your event..."
            value={eventData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            className="text-lg md:text-xl text-gray-400 bg-transparent outline-none focus:outline-none hover:ring-2 hover:ring-purple-500/50 rounded px-3 py-2 transition-all w-full resize-none placeholder-gray-600"
            rows={3}
          />

          <div className="space-y-4 md:space-y-6">
            <div className="flex items-center space-x-3 text-gray-300 bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <input
                type="date"
                required
                value={eventData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                className="bg-transparent outline-none focus:outline-none text-lg md:text-xl px-3 py-2 w-full"
              />
            </div>

            <div className="flex items-center space-x-3 text-gray-300 bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div className="flex-1 flex flex-col gap-4">
                <input
                  type="text"
                  required
                  placeholder="Venue name"
                  value={eventData.venue.name}
                  onChange={(e) => handleChange('venueName', e.target.value)}
                  className="bg-transparent outline-none focus:outline-none text-lg md:text-xl px-3 py-2 flex-1"
                />
                <input
                  type="text"
                  required
                  placeholder="Street address"
                  value={eventData.venue.address}
                  onChange={(e) => handleChange('venueAddress', e.target.value)}
                  className="bg-transparent outline-none focus:outline-none text-lg md:text-xl px-3 py-2 flex-1"
                />
                <input
                  type="text"
                  required
                  placeholder="City"
                  value={eventData.venue.city}
                  onChange={(e) => handleChange('venueCity', e.target.value)}
                  className="bg-transparent outline-none focus:outline-none text-lg md:text-xl px-3 py-2 flex-1"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3 text-gray-300 bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <label className="text-sm text-gray-400">From</label>
                  <input
                    type="time"
                    required
                    value={eventData.time.from}
                    onChange={(e) => handleChange('timeFrom', e.target.value)}
                    className="bg-transparent outline-none focus:outline-none text-lg md:text-xl px-3 py-2 flex-1"
                  />
                </div>
                <div className="h-px bg-white/10"></div>
                <div className="flex items-center gap-4 mt-2">
                  <label className="text-sm text-gray-400">To</label>
                  <input
                    type="time"
                    required
                    value={eventData.time.to}
                    onChange={(e) => handleChange('timeTo', e.target.value)}
                    className="bg-transparent outline-none focus:outline-none text-lg md:text-xl px-3 py-2 flex-1"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <button
              type="submit"
              disabled={loading}
              className="bg-purple-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {editId ? 'Updating...' : 'Creating...'}
                </span>
              ) : (
                editId ? 'Update Event' : 'Create Event'
              )}
            </button>
            <button
              type="button"
              className="border border-purple-500/20 text-purple-400 px-8 py-4 rounded-lg text-lg hover:bg-purple-500/10 transition-colors"
            >
              Preview
            </button>
          </div>
        </div>

        <div className="w-full lg:w-1/3 sticky top-8">
          <div className="w-full aspect-square bg-gradient-to-br from-purple-500 via-pink-500 to-blue-600 rounded-3xl p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0MCIgZmlsbD0id2hpdGUiLz48L3N2Zz4=')] opacity-10"></div>
            <div className="relative z-10 w-full h-full bg-gradient-to-br from-purple-300 via-pink-200 to-blue-400 rounded-2xl transform rotate-6 origin-center"></div>
            
          </div>
        </div>
        
      </div>


    </form>
  );
};

export default CreateEventPage;