import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Bus } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const handleQuickLogin = () => {
    localStorage.setItem('isLoggedIn', 'true');
    window.location.href = '/';
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <Bus className="w-8 h-8 text-[#2563EB]" />
            <span className="text-2xl text-gray-900">BusBook</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className={`transition-colors ${
                isActive('/') ? 'text-[#2563EB]' : 'text-gray-600 hover:text-[#2563EB]'
              }`}
            >
              Home
            </Link>
            <Link
              to="/my-bookings"
              className={`transition-colors ${
                isActive('/my-bookings') ? 'text-[#2563EB]' : 'text-gray-600 hover:text-[#2563EB]'
              }`}
            >
              My Bookings
            </Link>
            <Link
              to="/admin"
              className={`transition-colors ${
                isActive('/admin') ? 'text-[#2563EB]' : 'text-gray-600 hover:text-[#2563EB]'
              }`}
            >
              Admin
            </Link>
            <button
              onClick={handleQuickLogin}
              className="text-gray-600 hover:text-[#2563EB] transition-colors"
            >
              Login
            </button>
            <Link
              to="/register"
              className="bg-[#2563EB] text-white px-6 py-2 rounded-md hover:bg-[#1d4ed8] transition-colors"
            >
              Register
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-md text-gray-600 hover:text-[#2563EB] hover:bg-gray-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col gap-4">
              <Link
                to="/"
                className={`px-4 py-2 rounded-md transition-colors ${
                  isActive('/') ? 'bg-[#2563EB] text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/my-bookings"
                className={`px-4 py-2 rounded-md transition-colors ${
                  isActive('/my-bookings') ? 'bg-[#2563EB] text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                My Bookings
              </Link>
              <Link
                to="/admin"
                className={`px-4 py-2 rounded-md transition-colors ${
                  isActive('/admin') ? 'bg-[#2563EB] text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Admin
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleQuickLogin();
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors text-left"
              >
                Login
              </button>
              <Link
                to="/register"
                className="px-4 py-2 bg-[#2563EB] text-white rounded-md hover:bg-[#1d4ed8] transition-colors text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Register
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}