import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import DatePickerWeekly from '../components/DatePickerWeekly';
import {
  ChevronRight,
  Wifi,
  Wind,
  Droplet,
  Usb,
  ArrowRight,
  SlidersHorizontal,
  Bus,
  Clock,
  Sparkles,
  ChevronLeft,
  MapPin,
  Users,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export default function SearchResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState(
    location.state || {
      from: 'Ho Chi Minh City',
      to: 'Da Lat',
      date: new Date().toISOString().split('T')[0],
      passengers: 2,
    }
  );

  const [filters, setFilters] = useState({
    aiRecommended: false,
    eTicketOnly: false,
    directOnly: false,
    departureTime: [] as string[],
    operators: [] as string[],
  });

  const [sortBy, setSortBy] = useState('cheapest');
  const [showFilters, setShowFilters] = useState(false);
  const [showSearchEditor, setShowSearchEditor] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAllOperators, setShowAllOperators] = useState(false);
  const itemsPerPage = 6;

  // Search editor state
  const [fromSearch, setFromSearch] = useState(searchParams.from);
  const [toSearch, setToSearch] = useState(searchParams.to);
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);

  const trips = [
    {
      id: 1,
      operator: 'National Express',
      logo: '🚌',
      model: 'Luxury Sleeper',
      departure: '11:59pm',
      arrival: '2:20am',
      nextDay: true,
      departureStation: 'Victoria Coach Station',
      arrivalStation: 'Bristol Bus & Coach Station',
      departureCity: searchParams.from,
      arrivalCity: searchParams.to,
      duration: '2h 21m',
      price: 350000,
      availableSeats: 15,
      amenities: ['wifi', 'ac', 'usb'],
      eTicket: true,
      direct: true,
      departureTimeCategory: 'late',
      aiRecommended: true,
      rating: 4.8,
    },
    {
      id: 2,
      operator: 'Futa Bus Lines',
      logo: '🚍',
      model: 'Premium',
      departure: '11:59pm',
      arrival: '3:05am',
      nextDay: true,
      departureStation: 'Victoria Coach Station',
      arrivalStation: 'Bristol Bus & Coach Station',
      departureCity: searchParams.from,
      arrivalCity: searchParams.to,
      duration: '3h 6m',
      price: 290000,
      availableSeats: 12,
      amenities: ['wifi', 'ac', 'usb', 'toilet'],
      eTicket: true,
      direct: false,
      departureTimeCategory: 'late',
      aiRecommended: false,
      rating: 4.5,
    },
    {
      id: 3,
      operator: 'Mai Linh Express',
      logo: '🚐',
      model: 'Standard',
      departure: '11:30pm',
      arrival: '2:40am',
      nextDay: true,
      departureStation: 'London Gatwick Airport',
      arrivalStation: 'Bristol Bus & Coach Station',
      departureCity: searchParams.from,
      arrivalCity: searchParams.to,
      duration: '3h 10m',
      price: 490000,
      availableSeats: 21,
      amenities: ['wifi', 'ac', 'usb'],
      eTicket: false,
      direct: true,
      departureTimeCategory: 'late',
      aiRecommended: false,
      rating: 4.2,
    },
    {
      id: 4,
      operator: 'Phuong Trang',
      logo: '🚌',
      model: 'VIP Cabin',
      departure: '10:00pm',
      arrival: '1:15am',
      nextDay: true,
      departureStation: 'Victoria Coach Station',
      arrivalStation: 'Bristol Bus & Coach Station',
      departureCity: searchParams.from,
      arrivalCity: searchParams.to,
      duration: '3h 15m',
      price: 420000,
      availableSeats: 6,
      amenities: ['wifi', 'ac', 'usb', 'toilet'],
      eTicket: true,
      direct: true,
      departureTimeCategory: 'late',
      aiRecommended: true,
      rating: 4.9,
    },
    {
      id: 5,
      operator: 'National Express',
      logo: '🚌',
      model: 'Economy',
      departure: '6:30am',
      arrival: '9:45am',
      nextDay: false,
      departureStation: 'Victoria Coach Station',
      arrivalStation: 'Bristol Bus & Coach Station',
      departureCity: searchParams.from,
      arrivalCity: searchParams.to,
      duration: '3h 15m',
      price: 180000,
      availableSeats: 24,
      amenities: ['wifi', 'usb'],
      eTicket: true,
      direct: true,
      departureTimeCategory: 'early',
      aiRecommended: true,
      rating: 4.6,
    },
    {
      id: 6,
      operator: 'Futa Bus Lines',
      logo: '🚍',
      model: 'Standard',
      departure: '2:15pm',
      arrival: '5:30pm',
      nextDay: false,
      departureStation: 'Victoria Coach Station',
      arrivalStation: 'Bristol Bus & Coach Station',
      departureCity: searchParams.from,
      arrivalCity: searchParams.to,
      duration: '3h 15m',
      price: 220000,
      availableSeats: 18,
      amenities: ['wifi', 'ac', 'usb'],
      eTicket: true,
      direct: false,
      departureTimeCategory: 'midday',
      aiRecommended: false,
      rating: 4.3,
    },
    {
      id: 7,
      operator: 'Mai Linh Express',
      logo: '🚐',
      model: 'Deluxe',
      departure: '8:00am',
      arrival: '11:30am',
      nextDay: false,
      departureStation: 'Victoria Coach Station',
      arrivalStation: 'Bristol Bus & Coach Station',
      departureCity: searchParams.from,
      arrivalCity: searchParams.to,
      duration: '3h 30m',
      price: 320000,
      availableSeats: 10,
      amenities: ['wifi', 'ac', 'usb', 'toilet'],
      eTicket: true,
      direct: true,
      departureTimeCategory: 'early',
      aiRecommended: false,
      rating: 4.4,
    },
    {
      id: 8,
      operator: 'Phuong Trang',
      logo: '🚌',
      model: 'Express',
      departure: '4:00pm',
      arrival: '7:20pm',
      nextDay: false,
      departureStation: 'Victoria Coach Station',
      arrivalStation: 'Bristol Bus & Coach Station',
      departureCity: searchParams.from,
      arrivalCity: searchParams.to,
      duration: '3h 20m',
      price: 280000,
      availableSeats: 14,
      amenities: ['wifi', 'ac', 'usb'],
      eTicket: true,
      direct: true,
      departureTimeCategory: 'midday',
      aiRecommended: false,
      rating: 4.5,
    },
  ];

  const amenityIcons: any = {
    wifi: <Wifi className="w-4 h-4" />,
    ac: <Wind className="w-4 h-4" />,
    toilet: <Droplet className="w-4 h-4" />,
    usb: <Usb className="w-4 h-4" />,
  };

  const filteredTrips = trips.filter((trip) => {
    if (filters.aiRecommended && !trip.aiRecommended) return false;
    if (filters.eTicketOnly && !trip.eTicket) return false;
    if (filters.directOnly && !trip.direct) return false;
    if (filters.departureTime.length > 0 && !filters.departureTime.includes(trip.departureTimeCategory))
      return false;
    if (filters.operators.length > 0 && !filters.operators.includes(trip.operator)) return false;
    return true;
  });

  const sortedTrips = [...filteredTrips].sort((a, b) => {
    switch (sortBy) {
      case 'cheapest':
        return a.price - b.price;
      case 'fastest':
        return parseInt(a.duration) - parseInt(b.duration);
      case 'earliest':
        return a.departure.localeCompare(b.departure);
      case 'latest':
        return b.departure.localeCompare(a.departure);
      default:
        return 0;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedTrips.length / itemsPerPage);
  const paginatedTrips = sortedTrips.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleTripSelect = (tripId: number) => {
    navigate(`/seat-selection/${tripId}`, {
      state: { trip: trips.find((t) => t.id === tripId), searchParams },
    });
  };

  const handleSearchUpdate = (newParams: any) => {
    setSearchParams(newParams);
  };

  const toggleFilter = (filterName: keyof typeof filters, value?: any) => {
    if (typeof filters[filterName] === 'boolean') {
      setFilters({ ...filters, [filterName]: !filters[filterName] });
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-gray-600 mb-6">
          <Link to="/" className="hover:text-[#2563EB]">
            Home
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900">Search Results</span>
        </div>

        {/* Search Summary Bar */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          {!showSearchEditor ? (
            <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-wrap">
                <div>
                  <span className="text-gray-900">
                    {searchParams.from} <ArrowRight className="inline w-4 h-4 mx-1" /> {searchParams.to}
                  </span>
                </div>
                <div className="text-gray-600">|</div>
                <div className="text-gray-600">{searchParams.date}</div>
                <div className="text-gray-600">|</div>
                <div className="text-gray-600">{searchParams.passengers} passenger(s)</div>
              </div>
              <button
                onClick={() => {
                  setShowSearchEditor(true);
                  setFromSearch(searchParams.from);
                  setToSearch(searchParams.to);
                }}
                className="flex items-center gap-2 px-4 py-2 text-[#2563EB] hover:bg-blue-50 rounded-lg transition-colors"
              >
                <ChevronDown className="w-4 h-4" />
                Edit Search
              </button>
            </div>
          ) : (
            <div className="p-6 bg-gradient-to-br from-blue-50 to-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-900">Update Your Search</h3>
                <button
                  onClick={() => setShowSearchEditor(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <ChevronUp className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* From */}
                <div>
                  <label className="block text-gray-700 mb-2 text-sm">From</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={fromSearch}
                      onChange={(e) => {
                        setFromSearch(e.target.value);
                        setShowFromSuggestions(true);
                      }}
                      onBlur={() => setTimeout(() => setShowFromSuggestions(false), 200)}
                      placeholder="Search city..."
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-gray-900"
                    />
                    {showFromSuggestions && fromSearch && (
                      <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto z-10">
                        {[
                          'Ho Chi Minh City',
                          'Hanoi',
                          'Da Nang',
                          'Da Lat',
                          'Nha Trang',
                          'Can Tho',
                          'Hue',
                          'Vung Tau',
                        ]
                          .filter((city) => city.toLowerCase().includes(fromSearch.toLowerCase()))
                          .map((city) => (
                            <div
                              key={city}
                              className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                              onClick={() => {
                                setFromSearch(city);
                                setShowFromSuggestions(false);
                              }}
                            >
                              {city}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* To */}
                <div>
                  <label className="block text-gray-700 mb-2 text-sm">To</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={toSearch}
                      onChange={(e) => {
                        setToSearch(e.target.value);
                        setShowToSuggestions(true);
                      }}
                      onBlur={() => setTimeout(() => setShowToSuggestions(false), 200)}
                      placeholder="Search city..."
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-gray-900"
                    />
                    {showToSuggestions && toSearch && (
                      <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto z-10">
                        {[
                          'Ho Chi Minh City',
                          'Hanoi',
                          'Da Nang',
                          'Da Lat',
                          'Nha Trang',
                          'Can Tho',
                          'Hue',
                          'Vung Tau',
                        ]
                          .filter((city) => city.toLowerCase().includes(toSearch.toLowerCase()))
                          .map((city) => (
                            <div
                              key={city}
                              className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                              onClick={() => {
                                setToSearch(city);
                                setShowToSuggestions(false);
                              }}
                            >
                              {city}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-gray-700 mb-2 text-sm">Date</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={searchParams.date}
                      onChange={(e) => setSearchParams({ ...searchParams, date: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-gray-900"
                    />
                  </div>
                </div>

                {/* Passengers */}
                <div>
                  <label className="block text-gray-700 mb-2 text-sm">Passengers</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="number"
                      value={searchParams.passengers}
                      onChange={(e) =>
                        setSearchParams({
                          ...searchParams,
                          passengers: parseInt(e.target.value) || 1,
                        })
                      }
                      min="1"
                      max="10"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-gray-900"
                    />
                  </div>
                </div>
              </div>

              {/* Update Button */}
              <div className="flex items-center justify-end gap-3 mt-4">
                <button
                  onClick={() => setShowSearchEditor(false)}
                  className="px-6 py-2 text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setSearchParams({
                      ...searchParams,
                      from: fromSearch,
                      to: toSearch,
                    });
                    setShowSearchEditor(false);
                  }}
                  className="px-6 py-2 bg-[#2563EB] text-white rounded-lg hover:bg-[#1d4ed8] transition-colors"
                >
                  Update Search
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Date Selector */}
        <div className="mb-6">
          <DatePickerWeekly
            selectedDate={searchParams.date}
            onDateChange={(date) => setSearchParams({ ...searchParams, date })}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filter Sidebar - Desktop */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md overflow-hidden sticky top-24">
              <div className="p-4 bg-gradient-to-r from-[#2563EB] to-[#1e40af]">
                <h3 className="text-white flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5" />
                  Filters
                </h3>
              </div>

              <div className="p-4 space-y-4">
                {/* AI Recommended */}
                <div className="pb-4 border-b border-gray-200">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={filters.aiRecommended}
                      onChange={() => toggleFilter('aiRecommended')}
                      className="rounded text-[#2563EB] focus:ring-[#2563EB] w-5 h-5"
                    />
                    <Sparkles className="w-5 h-5 text-[#2563EB]" />
                    <span className="text-gray-900 group-hover:text-[#2563EB] transition-colors flex-1">
                      AI Recommended
                    </span>
                    <span className="text-xs bg-blue-100 text-[#2563EB] px-2 py-1 rounded-full">
                      {trips.filter((t) => t.aiRecommended).length}
                    </span>
                  </label>
                </div>

                {/* Quick filters */}
                <div className="space-y-3 pb-4 border-b border-gray-200">
                  <h4 className="text-gray-900">Quick Filters</h4>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={filters.eTicketOnly}
                      onChange={() => toggleFilter('eTicketOnly')}
                      className="rounded text-[#10B981] focus:ring-[#10B981] w-5 h-5"
                    />
                    <div className="w-5 h-5 bg-green-100 rounded flex items-center justify-center">
                      <span className="text-xs text-[#10B981]">E</span>
                    </div>
                    <span className="text-gray-700 group-hover:text-gray-900 transition-colors flex-1">
                      E-ticket only
                    </span>
                    <span className="text-xs text-gray-500">
                      ({trips.filter((t) => t.eTicket).length})
                    </span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={filters.directOnly}
                      onChange={() => toggleFilter('directOnly')}
                      className="rounded text-[#EF4444] focus:ring-[#EF4444] w-5 h-5"
                    />
                    <div className="w-5 h-5 bg-red-100 rounded flex items-center justify-center">
                      <ArrowRight className="w-3 h-3 text-[#EF4444]" />
                    </div>
                    <span className="text-gray-700 group-hover:text-gray-900 transition-colors flex-1">
                      Direct only
                    </span>
                    <span className="text-xs text-gray-500">
                      ({trips.filter((t) => t.direct).length})
                    </span>
                  </label>
                </div>

                {/* Departure time */}
                <div className="space-y-3 pb-4 border-b border-gray-200">
                  <h4 className="text-gray-900">Departure Time</h4>
                  {[
                    { id: 'nighttime', label: 'Nighttime', time: 'Before 6am', icon: '🌙', color: 'purple' },
                    { id: 'early', label: 'Early Morning', time: '6am - 11am', icon: '☀️', color: 'yellow' },
                    { id: 'midday', label: 'Midday', time: '11am - 5pm', icon: '🌤️', color: 'orange' },
                    { id: 'late', label: 'Late Evening', time: 'After 5pm', icon: '🌆', color: 'blue' },
                  ].map((time) => (
                    <label key={time.id} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={filters.departureTime.includes(time.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFilters({
                              ...filters,
                              departureTime: [...filters.departureTime, time.id],
                            });
                          } else {
                            setFilters({
                              ...filters,
                              departureTime: filters.departureTime.filter((t) => t !== time.id),
                            });
                          }
                        }}
                        className="rounded text-[#2563EB] focus:ring-[#2563EB] w-5 h-5"
                      />
                      <span className="text-xl">{time.icon}</span>
                      <div className="flex-1">
                        <div className="text-gray-900 group-hover:text-gray-900">{time.label}</div>
                        <div className="text-xs text-gray-500">{time.time}</div>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Operators */}
                <div className="space-y-3">
                  <h4 className="text-gray-900">Operators</h4>
                  {['National Express', 'Futa Bus Lines', 'Mai Linh Express', 'Phuong Trang'].map(
                    (operator) => (
                      <label key={operator} className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={filters.operators.includes(operator)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFilters({
                                ...filters,
                                operators: [...filters.operators, operator],
                              });
                            } else {
                              setFilters({
                                ...filters,
                                operators: filters.operators.filter((o) => o !== operator),
                              });
                            }
                          }}
                          className="rounded text-[#2563EB] focus:ring-[#2563EB] w-5 h-5"
                        />
                        <div className="flex-1">
                          <div className="text-gray-900 group-hover:text-gray-900">{operator}</div>
                          <div className="text-xs text-gray-500">
                            ({trips.filter((t) => t.operator === operator).length} trips)
                          </div>
                        </div>
                      </label>
                    )
                  )}
                </div>
              </div>
            </div>
          </aside>

          {/* Mobile Filter Button */}
          <div className="lg:hidden fixed bottom-4 right-4 z-40">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-[#2563EB] text-white p-4 rounded-full shadow-lg hover:bg-[#1d4ed8] transition-colors"
            >
              <SlidersHorizontal className="w-6 h-6" />
            </button>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="text-gray-600">SELECT YOUR TRIP</p>
                  <h2 className="text-gray-900">{sortedTrips.length} results</h2>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-gray-700 text-sm">Sort by:</span>
                  {[
                    { id: 'cheapest', label: 'Cheapest' },
                    { id: 'fastest', label: 'Fastest' },
                    { id: 'earliest', label: 'Earliest' },
                    { id: 'latest', label: 'Latest' },
                  ].map((sort) => (
                    <button
                      key={sort.id}
                      onClick={() => setSortBy(sort.id)}
                      className={`px-3 py-2 rounded-md text-sm transition-colors ${
                        sortBy === sort.id
                          ? 'bg-[#2563EB] text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {sort.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Trip Cards */}
            <div className="space-y-4">
              {paginatedTrips.map((trip) => (
                <div
                  key={trip.id}
                  className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-all ${
                    trip.aiRecommended ? 'ring-2 ring-[#2563EB]' : ''
                  }`}
                >
                  {/* AI Recommended Badge */}
                  {trip.aiRecommended && (
                    <div className="bg-gradient-to-r from-[#2563EB] to-[#1e40af] text-white px-4 py-2 rounded-t-lg flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      <span className="text-sm">AI Recommended - Best value for your trip</span>
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
                      {/* Operator Logo */}
                      <div className="flex items-center gap-4 lg:w-48">
                        <div className="text-4xl">{trip.logo}</div>
                        <div className="flex-1">
                          <h3 className="text-gray-900 mb-1">{trip.operator}</h3>
                          <p className="text-sm text-gray-600">{trip.model}</p>
                        </div>
                      </div>

                      {/* Trip Details */}
                      <div className="flex-1 w-full">
                        <div className="flex items-center gap-4">
                          {/* Departure */}
                          <div className="text-center flex-shrink-0 w-32">
                            <div className="text-2xl text-gray-900 mb-1">{trip.departure}</div>
                            <div className="text-sm text-gray-700 truncate" title={trip.departureStation}>
                              {trip.departureStation.split(' ')[0]}
                            </div>
                            <div className="text-xs text-gray-500 uppercase mt-1">{trip.departureCity}</div>
                          </div>

                          {/* Duration */}
                          <div className="flex-1 flex flex-col items-center min-w-0">
                            <div className="flex items-center gap-2 text-gray-600 mb-2">
                              <Bus className="w-4 h-4" />
                              <Clock className="w-4 h-4" />
                              <span className="text-sm">{trip.duration}</span>
                            </div>
                            <div className="w-full h-0.5 bg-gray-300 relative">
                              <ArrowRight className="absolute right-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-5 h-5 text-gray-400" />
                            </div>
                            {/* Amenities below duration line */}
                            <div className="hidden lg:flex gap-2 mt-2">
                              {trip.amenities.map((amenity) => (
                                <div
                                  key={amenity}
                                  className="text-gray-500 hover:text-[#2563EB]"
                                  title={amenity.toUpperCase()}
                                >
                                  {amenityIcons[amenity]}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Arrival */}
                          <div className="text-center flex-shrink-0 w-32">
                            <div className="text-2xl text-gray-900 mb-1">
                              {trip.arrival}
                              {trip.nextDay && <sup className="text-sm text-[#EF4444]">+1</sup>}
                            </div>
                            <div className="text-sm text-gray-700 truncate" title={trip.arrivalStation}>
                              {trip.arrivalStation.split(' ')[0]}
                            </div>
                            <div className="text-xs text-gray-500 uppercase mt-1">{trip.arrivalCity}</div>
                          </div>

                          {/* Price & Button */}
                          <div className="flex items-center flex-shrink-0 ml-4">
                            <button
                              onClick={() => handleTripSelect(trip.id)}
                              className="bg-[#2563EB] text-white px-6 py-3 rounded-lg hover:bg-[#1d4ed8] transition-colors flex items-center gap-2 whitespace-nowrap"
                            >
                              ₫{trip.price.toLocaleString()}
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Mobile Amenities */}
                        <div className="flex lg:hidden gap-3 mt-4 pt-4 border-t border-gray-200">
                          {trip.amenities.map((amenity) => (
                            <div
                              key={amenity}
                              className="flex items-center gap-1 text-gray-500"
                              title={amenity.toUpperCase()}
                            >
                              {amenityIcons[amenity]}
                              <span className="text-xs">{amenity.toUpperCase()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>

                <div className="flex gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        currentPage === page
                          ? 'bg-[#2563EB] text-white'
                          : 'bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Promotional Banner */}
            <div className="mt-6 bg-gradient-to-r from-green-100 to-green-50 rounded-lg p-6 flex items-center justify-between">
              <div>
                <h3 className="text-gray-900 mb-2">Download the app and earn up to 90%</h3>
                <p className="text-[#10B981]">in discounts for future trips.</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-white p-3 rounded-lg">
                  <div className="w-24 h-24 bg-gray-200 rounded flex items-center justify-center">
                    <span className="text-xs text-gray-500">QR CODE</span>
                  </div>
                </div>
                <div className="text-4xl">💰</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}