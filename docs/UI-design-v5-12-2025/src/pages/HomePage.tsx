import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {
  MapPin,
  Calendar,
  Users,
  ArrowRight,
  Wifi,
  Wind,
  Zap,
  Shield,
  Star,
  Clock,
  CheckCircle,
  TrendingUp,
  Smartphone,
  Globe,
  Award,
  ThumbsUp,
  Sparkles,
} from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();
  const [searchForm, setSearchForm] = useState({
    from: '',
    to: '',
    date: '',
    returnDate: '',
    passengers: 1,
    tripType: 'single' as 'single' | 'return',
  });

  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);
  const [fromSearch, setFromSearch] = useState('');
  const [toSearch, setToSearch] = useState('');

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
    city.toLowerCase().includes(fromSearch.toLowerCase())
  );

  const filteredToCities = cities.filter((city) =>
    city.toLowerCase().includes(toSearch.toLowerCase())
  );

  const popularRoutes = [
    {
      id: 1,
      from: 'Ho Chi Minh City',
      to: 'Da Lat',
      duration: '6h 30m',
      price: 250000,
      image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=250&fit=crop',
      trips: '12 trips/day',
    },
    {
      id: 2,
      from: 'Hanoi',
      to: 'Ha Long Bay',
      duration: '3h 45m',
      price: 180000,
      image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=400&h=250&fit=crop',
      trips: '8 trips/day',
    },
    {
      id: 3,
      from: 'Ho Chi Minh City',
      to: 'Nha Trang',
      duration: '8h 15m',
      price: 320000,
      image: 'https://images.unsplash.com/photo-1559628376-f3fe5f782a2e?w=400&h=250&fit=crop',
      trips: '6 trips/day',
    },
    {
      id: 4,
      from: 'Da Nang',
      to: 'Hue',
      duration: '2h 30m',
      price: 120000,
      image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400&h=250&fit=crop',
      trips: '15 trips/day',
    },
    {
      id: 5,
      from: 'Hanoi',
      to: 'Sapa',
      duration: '5h 45m',
      price: 280000,
      image: 'https://images.unsplash.com/photo-1570365590330-1167f2b5bc90?w=400&h=250&fit=crop',
      trips: '5 trips/day',
    },
    {
      id: 6,
      from: 'Ho Chi Minh City',
      to: 'Can Tho',
      duration: '4h 00m',
      price: 150000,
      image: 'https://images.unsplash.com/photo-1583484963920-e2b513d3b1c8?w=400&h=250&fit=crop',
      trips: '10 trips/day',
    },
  ];

  const testimonials = [
    {
      id: 1,
      name: 'Sarah Johnson',
      role: 'Frequent Traveler',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
      rating: 5,
      comment:
        'BusBook has completely changed how I travel. The booking process is so smooth, and the buses are always on time. Highly recommended!',
    },
    {
      id: 2,
      name: 'Michael Chen',
      role: 'Business Professional',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      rating: 5,
      comment:
        'I travel for work weekly, and BusBook makes it hassle-free. The Wi-Fi on buses is excellent, and customer service is top-notch.',
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      role: 'Tourist',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
      rating: 5,
      comment:
        'As a tourist, I was worried about navigating bus travel, but BusBook made it incredibly easy. The app is intuitive and support is amazing!',
    },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedForm = {
      ...searchForm,
      from: fromSearch,
      to: toSearch,
    };

    if (updatedForm.from && updatedForm.to && updatedForm.date) {
      navigate('/search-results', { state: updatedForm });
    } else {
      alert('Please fill in all required fields');
    }
  };

  const handleRouteClick = (route: any) => {
    setSearchForm({
      from: route.from,
      to: route.to,
      date: new Date().toISOString().split('T')[0],
      returnDate: '',
      passengers: 1,
      tripType: 'single',
    });
    setFromSearch(route.from);
    setToSearch(route.to);
    navigate('/search-results', {
      state: {
        from: route.from,
        to: route.to,
        date: new Date().toISOString().split('T')[0],
        passengers: 1,
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <Header />

      {/* Hero Section with Background Image */}
      <section className="relative bg-gradient-to-br from-[#2563EB] to-[#1e40af] text-white py-20 lg:py-32 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span className="text-sm text-white">Trusted by 500,000+ travelers</span>
            </div>
            <h1 className="text-white mb-6 text-4xl lg:text-6xl leading-tight">
              Your Journey,<br />Our Priority
            </h1>
            <p className="text-xl lg:text-2xl text-blue-100 max-w-3xl mx-auto">
              Book comfortable and affordable bus tickets across Vietnam with real-time availability and instant confirmation
            </p>
          </div>

          {/* Search Form */}
          <form
            onSubmit={handleSearch}
            className="bg-white rounded-2xl shadow-2xl p-6 lg:p-8 max-w-5xl mx-auto"
          >
            {/* Trip Type Tabs */}
            <div className="flex gap-4 mb-6 border-b border-gray-200">
              <button
                type="button"
                onClick={() => setSearchForm({ ...searchForm, tripType: 'single', returnDate: '' })}
                className={`pb-3 px-4 transition-colors ${ 
                  searchForm.tripType === 'single'
                    ? 'border-b-2 border-[#2563EB] text-[#2563EB]'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Single Trip
              </button>
              <button
                type="button"
                onClick={() => setSearchForm({ ...searchForm, tripType: 'return' })}
                className={`pb-3 px-4 transition-colors ${
                  searchForm.tripType === 'return'
                    ? 'border-b-2 border-[#2563EB] text-[#2563EB]'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Round Trip
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* From */}
              <div className="lg:col-span-1">
                <label className="block text-gray-700 mb-2">From</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
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
                    required
                  />
                  {showFromSuggestions && fromSearch && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto z-20">
                      {filteredFromCities.map((city) => (
                        <div
                          key={city}
                          className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                          onClick={() => {
                            setFromSearch(city);
                            setSearchForm({ ...searchForm, from: city });
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
              <div className="lg:col-span-1">
                <label className="block text-gray-700 mb-2">To</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
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
                    required
                  />
                  {showToSuggestions && toSearch && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto z-20">
                      {filteredToCities.map((city) => (
                        <div
                          key={city}
                          className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                          onClick={() => {
                            setToSearch(city);
                            setSearchForm({ ...searchForm, to: city });
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
              <div className="lg:col-span-1">
                <label className="block text-gray-700 mb-2">Travel Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                  <input
                    type="date"
                    value={searchForm.date}
                    onChange={(e) => setSearchForm({ ...searchForm, date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-gray-900"
                    required
                  />
                </div>
              </div>

              {/* Return Date */}
              {searchForm.tripType === 'return' && (
                <div className="lg:col-span-1">
                  <label className="block text-gray-700 mb-2">Return Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                    <input
                      type="date"
                      value={searchForm.returnDate}
                      onChange={(e) => setSearchForm({ ...searchForm, returnDate: e.target.value })}
                      min={searchForm.date || new Date().toISOString().split('T')[0]}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-gray-900"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Passengers */}
              <div className="lg:col-span-1">
                <label className="block text-gray-700 mb-2">Passengers</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                  <input
                    type="number"
                    value={searchForm.passengers}
                    onChange={(e) =>
                      setSearchForm({ ...searchForm, passengers: parseInt(e.target.value) || 1 })
                    }
                    min="1"
                    max="10"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-gray-900"
                    required
                  />
                </div>
              </div>

              {/* Search Button */}
              <div className="lg:col-span-1 flex items-end">
                <button
                  type="submit"
                  className="w-full bg-[#2563EB] text-white py-3 rounded-lg hover:bg-[#1d4ed8] transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40"
                >
                  Search Trips
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </form>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto mt-8">
            {[
              { icon: Users, label: '500K+ Travelers', color: 'text-blue-300' },
              { icon: Globe, label: '200+ Routes', color: 'text-green-300' },
              { icon: Star, label: '4.8 Rating', color: 'text-yellow-300' },
              { icon: Shield, label: 'Secure Booking', color: 'text-purple-300' },
            ].map((stat, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                <stat.icon className={`w-6 h-6 ${stat.color} mx-auto mb-2`} />
                <p className="text-white text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-gray-900 mb-4">Why Choose BusBook?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the difference with our premium bus booking service
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: 'Instant Booking',
                description: 'Book your tickets in seconds with our lightning-fast platform and get instant confirmation',
                color: 'bg-yellow-100 text-yellow-600',
              },
              {
                icon: Shield,
                title: 'Secure Payments',
                description: 'Your transactions are protected with bank-level security and encryption',
                color: 'bg-blue-100 text-blue-600',
              },
              {
                icon: Clock,
                title: '24/7 Support',
                description: 'Our dedicated customer service team is always ready to assist you, day or night',
                color: 'bg-green-100 text-green-600',
              },
              {
                icon: Wifi,
                title: 'Modern Amenities',
                description: 'Enjoy WiFi, AC, comfortable seating, and charging ports on all premium buses',
                color: 'bg-purple-100 text-purple-600',
              },
              {
                icon: CheckCircle,
                title: 'Best Price Guarantee',
                description: 'We offer the most competitive prices with no hidden fees or surprise charges',
                color: 'bg-red-100 text-red-600',
              },
              {
                icon: Award,
                title: 'Verified Operators',
                description: 'All our bus operators are verified and meet our high standards of quality',
                color: 'bg-indigo-100 text-indigo-600',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all p-8 border border-gray-100 group"
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 ${feature.color} rounded-2xl mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Routes */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-[#2563EB] px-4 py-2 rounded-full mb-4">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">Most Popular</span>
            </div>
            <h2 className="text-gray-900 mb-4">Popular Routes</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover the most traveled destinations and book your journey today
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {popularRoutes.map((route) => (
              <div
                key={route.id}
                className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-2xl transition-all cursor-pointer group"
                onClick={() => handleRouteClick(route)}
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={route.image}
                    alt={`${route.from} to ${route.to}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                    <p className="text-sm text-gray-900">{route.trips}</p>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-gray-900">
                      <span>{route.from}</span>
                      <ArrowRight className="w-4 h-4 text-[#2563EB]" />
                      <span>{route.to}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm mb-1">
                        <Clock className="w-4 h-4 inline mr-1" />
                        {route.duration}
                      </p>
                      <p className="text-[#2563EB] text-xl">₫{route.price.toLocaleString()}</p>
                    </div>
                    <button className="bg-[#2563EB] text-white px-5 py-2.5 rounded-lg hover:bg-[#1d4ed8] transition-colors shadow-md hover:shadow-lg">
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => navigate('/search-results')}
              className="inline-flex items-center gap-2 bg-[#2563EB] text-white px-8 py-4 rounded-lg hover:bg-[#1d4ed8] transition-colors shadow-lg hover:shadow-xl"
            >
              View All Routes
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Book your bus tickets in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connection Lines for Desktop */}
            <div className="hidden md:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-blue-400 to-blue-200 -z-10"></div>

            {[
              {
                step: '01',
                title: 'Search & Compare',
                description: 'Enter your destination and travel dates to find available buses with real-time pricing',
                icon: '🔍',
              },
              {
                step: '02',
                title: 'Select & Book',
                description: 'Choose your preferred bus, select your seats, and complete the booking securely',
                icon: '🎫',
              },
              {
                step: '03',
                title: 'Travel & Enjoy',
                description: 'Receive your e-ticket instantly and enjoy a comfortable journey with premium amenities',
                icon: '🚌',
              },
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="relative inline-block mb-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-[#2563EB] to-[#1e40af] rounded-full flex items-center justify-center text-5xl shadow-lg">
                    {step.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md border-2 border-[#2563EB]">
                    <span className="text-[#2563EB]">{step.step}</span>
                  </div>
                </div>
                <h3 className="text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full mb-4">
              <ThumbsUp className="w-4 h-4" />
              <span className="text-sm">4.8/5 from 50,000+ reviews</span>
            </div>
            <h2 className="text-gray-900 mb-4">What Our Travelers Say</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join thousands of satisfied customers who trust BusBook
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all p-8">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.comment}"</p>
                <div className="flex items-center gap-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Download App CTA */}
      <section className="py-20 bg-gradient-to-br from-[#2563EB] to-[#1e40af] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1729860646477-c0f603c0300b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2JpbGUlMjBhcHAlMjBib29raW5nfGVufDF8fHx8MTc2MzkyNTI2M3ww&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Mobile app"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                <Smartphone className="w-4 h-4" />
                <span className="text-sm">Download Now</span>
              </div>
              <h2 className="text-white mb-6">Get the BusBook App</h2>
              <p className="text-xl text-blue-100 mb-8">
                Download our mobile app and enjoy exclusive deals, faster bookings, and seamless travel management on the go.
              </p>

              <div className="space-y-4 mb-8">
                {[
                  'Book tickets in 30 seconds',
                  'Get exclusive mobile-only discounts',
                  'Real-time bus tracking',
                  'Instant notifications and updates',
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-300 flex-shrink-0" />
                    <span className="text-white">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-4">
                <button className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-3">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                  <div className="text-left">
                    <div className="text-xs">Download on the</div>
                    <div className="text-sm">App Store</div>
                  </div>
                </button>
                <button className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-3">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                  </svg>
                  <div className="text-left">
                    <div className="text-xs">Get it on</div>
                    <div className="text-sm">Google Play</div>
                  </div>
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10 flex justify-center">
                <div className="w-64 h-96 bg-white/10 backdrop-blur-sm rounded-3xl p-4 shadow-2xl border border-white/20">
                  <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center">
                    <Smartphone className="w-24 h-24 text-white" />
                  </div>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-400 rounded-full opacity-20 blur-3xl"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-green-400 rounded-full opacity-20 blur-3xl"></div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
