import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
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
import RouteManagementPage from './pages/admin/RouteManagementPage';
import TripManagementPage from './pages/admin/TripManagementPage';
import ChatWidget from './components/ChatWidget';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Customer Routes */}
          <Route path="/" element={<HomePage />} />
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
          <Route path="/admin/routes" element={<RouteManagementPage />} />
          <Route path="/admin/trips" element={<TripManagementPage />} />
        </Routes>
        <ChatWidget />
      </div>
    </Router>
  );
}
