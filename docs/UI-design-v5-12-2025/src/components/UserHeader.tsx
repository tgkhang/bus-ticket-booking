import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Bus, LogOut, User } from 'lucide-react';
import { useState } from 'react';

interface UserHeaderProps {
  userName?: string;
}

export default function UserHeader({ userName = 'John Doe' }: UserHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    navigate('/');
    window.location.reload();
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
            
            {/* User Profile Dropdown */}
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#2563EB] to-[#1d4ed8] flex items-center justify-center text-white">
                  <span>{userName.charAt(0).toUpperCase()}</span>
                </div>
                <span className="text-gray-900">{userName}</span>
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-red-600 transition-colors p-2 rounded-md hover:bg-red-50"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
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
              <div className="px-4 py-2 flex items-center gap-2 text-gray-700">
                <User className="w-5 h-5" />
                <span>{userName}</span>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors text-left flex items-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
