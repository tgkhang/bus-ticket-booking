import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import HomePage from './pages/HomePage';
import UserHomePage from './pages/UserHomePage';
import SearchResultsPage from './pages/SearchResultsPage';
import SeatSelectionPage from './pages/SeatSelectionPage';
import PassengerDetailsPage from './pages/PassengerDetailsPage';
import CheckoutPage from './pages/CheckoutPage';
import BookingConfirmationPage from './pages/BookingConfirmationPage';
import MyBookingsPage from './pages/MyBookingsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import BusManagementPage from './pages/admin/BusManagementPage';
import BusDetailPage from './pages/admin/BusDetailPage';
import RouteManagementPage from './pages/admin/RouteManagementPage';
import RouteDetailPage from './pages/admin/RouteDetailPage';
import TripManagementPage from './pages/admin/TripManagementPage';
import TripDetailPage from './pages/admin/TripDetailPage';
import OperatorManagementPage from './pages/admin/OperatorManagementPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import BookingManagementPage from './pages/admin/BookingManagementPage';
import ChatWidget from './components/ChatWidget';

export default function App() {
  // TODO: Replace with actual auth context/state management
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user is logged in (e.g., from localStorage or auth context)
    const userLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(userLoggedIn);
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Customer Routes */}
          <Route path="/" element={isLoggedIn ? <UserHomePage /> : <HomePage />} />
          <Route path="/search-results" element={<SearchResultsPage />} />
          <Route path="/seat-selection/:tripId" element={<SeatSelectionPage />} />
          <Route path="/passenger-details" element={<PassengerDetailsPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/booking-confirmation" element={<BookingConfirmationPage />} />
          <Route path="/my-bookings" element={<MyBookingsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/buses" element={<BusManagementPage />} />
          <Route path="/admin/buses/:busId" element={<BusDetailPage />} />
          <Route path="/admin/routes" element={<RouteManagementPage />} />
          <Route path="/admin/routes/:routeId" element={<RouteDetailPage />} />
          <Route path="/admin/trips" element={<TripManagementPage />} />
          <Route path="/admin/trips/:tripId" element={<TripDetailPage />} />
          <Route path="/admin/bookings" element={<BookingManagementPage />} />
          <Route path="/admin/operators" element={<OperatorManagementPage />} />
          <Route path="/admin/users" element={<UserManagementPage />} />
        </Routes>
        <ChatWidget />
      </div>
    </Router>
  );
}