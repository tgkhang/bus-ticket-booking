import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserHeader from '../components/UserHeader';
import Footer from '../components/Footer';
import {
  MapPin,
  Calendar,
  Search,
  Clock,
  TrendingUp,
  Star,
  Bus,
  Ticket,
  ArrowRight,
  Users,
  Sparkles,
} from 'lucide-react';

interface RecentSearch {
  id: string;
  from: string;
  to: string;
  date: string;
}

interface PopularRoute {
  id: string;
  from: string;
  to: string;
  price: number;
  duration: string;
  trips: number;
}

export default function UserHomePage() {
  const navigate = useNavigate();
  const [searchData, setSearchData] = useState({
    from: '',
    to: '',
    date: '',
    passengers: 1,
  });

  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);

  const cities = [
    'Ho Chi Minh City',
    'Hanoi',
    'Da Nang',
    'Da Lat',
    'Nha Trang',
    'Can Tho',
    'Hue',
    'Vung Tau',
  ];

  const filteredFromCities = cities.filter((city) =>
    city.toLowerCase().includes(searchData.from.toLowerCase())
  );

  const filteredToCities = cities.filter((city) =>
    city.toLowerCase().includes(searchData.to.toLowerCase())
  );

  const recentSearches: RecentSearch[] = [
    { id: '1', from: 'Ho Chi Minh City', to: 'Da Lat', date: '2024-12-10' },
    { id: '2', from: 'Hanoi', to: 'Hai Phong', date: '2024-12-08' },
    { id: '3', from: 'Da Nang', to: 'Hue', date: '2024-12-05' },
  ];

  const popularRoutes: PopularRoute[] = [
    {
      id: '1',
      from: 'Ho Chi Minh City',
      to: 'Da Lat',
      price: 350000,
      duration: '6h 30m',
      trips: 12,
    },
    {
      id: '2',
      from: 'Hanoi',
      to: 'Ha Long Bay',
      price: 280000,
      duration: '4h 15m',
      trips: 8,
    },
    {
      id: '3',
      from: 'Da Nang',
      to: 'Hoi An',
      price: 150000,
      duration: '1h 30m',
      trips: 15,
    },
    {
      id: '4',
      from: 'HCMC',
      to: 'Vung Tau',
      price: 180000,
      duration: '2h 45m',
      trips: 10,
    },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchData.from && searchData.to && searchData.date) {
      navigate(
        `/search-results?from=${encodeURIComponent(searchData.from)}&to=${encodeURIComponent(
          searchData.to
        )}&date=${searchData.date}&passengers=${searchData.passengers}`
      );
    }
  };

  const handleQuickSearch = (search: RecentSearch | PopularRoute) => {
    navigate(
      `/search-results?from=${encodeURIComponent(search.from)}&to=${encodeURIComponent(
        search.to
      )}&date=${new Date().toISOString().split('T')[0]}&passengers=1`
    );
  };

  const userName = 'John Doe'; // TODO: Get from auth context

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <UserHeader userName={userName} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-gray-900 mb-2">Welcome back, {userName.split(' ')[0]}! 👋</h1>
          <p className="text-xl text-gray-600">Find your next journey</p>
        </div>

        {/* Search Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <Search className="w-6 h-6 text-[#2563EB]" />
            <h2 className="text-gray-900">Search Bus Tickets</h2>
          </div>

          <form onSubmit={handleSearch}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* From */}
              <div className="relative">
                <label className="block text-gray-700 mb-2">From</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchData.from}
                    onChange={(e) => {
                      setSearchData({ ...searchData, from: e.target.value });
                      setShowFromSuggestions(true);
                    }}
                    onFocus={() => setShowFromSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowFromSuggestions(false), 200)}
                    placeholder="Departure city"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent text-gray-900 placeholder-gray-400"
                    required
                  />
                  {showFromSuggestions && searchData.from && filteredFromCities.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {filteredFromCities.map((city) => (
                        <button
                          key={city}
                          type="button"
                          onClick={() => {
                            setSearchData({ ...searchData, from: city });
                            setShowFromSuggestions(false);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-900"
                        >
                          {city}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* To */}
              <div className="relative">
                <label className="block text-gray-700 mb-2">To</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchData.to}
                    onChange={(e) => {
                      setSearchData({ ...searchData, to: e.target.value });
                      setShowToSuggestions(true);
                    }}
                    onFocus={() => setShowToSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowToSuggestions(false), 200)}
                    placeholder="Destination city"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent text-gray-900 placeholder-gray-400"
                    required
                  />
                  {showToSuggestions && searchData.to && filteredToCities.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {filteredToCities.map((city) => (
                        <button
                          key={city}
                          type="button"
                          onClick={() => {
                            setSearchData({ ...searchData, to: city });
                            setShowToSuggestions(false);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-900"
                        >
                          {city}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="block text-gray-700 mb-2">Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="date"
                    value={searchData.date}
                    onChange={(e) => setSearchData({ ...searchData, date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent text-gray-900"
                    required
                  />
                </div>
              </div>

              {/* Passengers */}
              <div>
                <label className="block text-gray-700 mb-2">Passengers</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    value={searchData.passengers}
                    onChange={(e) =>
                      setSearchData({ ...searchData, passengers: parseInt(e.target.value) })
                    }
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent text-gray-900 appearance-none"
                  >
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? 'Passenger' : 'Passengers'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#2563EB] text-white py-3 rounded-md hover:bg-[#1d4ed8] transition-colors flex items-center justify-center gap-2"
            >
              <Search className="w-5 h-5" />
              Search Buses
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Recent Searches and Popular Routes */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Searches */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-[#2563EB]" />
                <h3 className="text-gray-900">Recent Searches</h3>
              </div>

              {recentSearches.length > 0 ? (
                <div className="space-y-3">
                  {recentSearches.map((search) => (
                    <button
                      key={search.id}
                      onClick={() => handleQuickSearch(search)}
                      className="w-full bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-[#2563EB] rounded-lg p-4 transition-all text-left group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-1">
                          <span className="text-gray-900">{search.from}</span>
                          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#2563EB]" />
                          <span className="text-gray-900">{search.to}</span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(search.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No recent searches</p>
                </div>
              )}
            </div>

            {/* Popular Routes */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-[#10B981]" />
                <h3 className="text-gray-900">Popular Routes</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {popularRoutes.map((route) => (
                  <button
                    key={route.id}
                    onClick={() => handleQuickSearch(route)}
                    className="bg-gray-50 hover:bg-green-50 border border-gray-200 hover:border-[#10B981] rounded-lg p-4 transition-all text-left group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-gray-900">{route.from}</span>
                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#10B981]" />
                        <span className="text-gray-900">{route.to}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-gray-500">
                        <Clock className="w-4 h-4" />
                        {route.duration}
                      </div>
                      <span className="text-[#2563EB]">₫{(route.price / 1000).toFixed(0)}K</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - User Stats */}
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-[#2563EB] to-[#1d4ed8] rounded-lg shadow-md p-6 text-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                  <Ticket className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-blue-100 text-sm">Active Bookings</p>
                  <p className="text-3xl">5</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/my-bookings')}
                className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white py-2 rounded-md transition-colors flex items-center justify-center gap-2"
              >
                View All Bookings
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-gradient-to-br from-[#10B981] to-[#059669] rounded-lg shadow-md p-6 text-white">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                  <Bus className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-green-100 text-sm">Trips Completed</p>
                  <p className="text-3xl">12</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-md p-6 text-white">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                  <Star className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-purple-100 text-sm">Loyalty Points</p>
                  <p className="text-3xl">450</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 text-purple-100 text-sm">
                <Sparkles className="w-4 h-4" />
                <span>50 points to next reward</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
