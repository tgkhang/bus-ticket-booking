import { Link } from 'react-router-dom';
import { Bus, Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Bus className="w-8 h-8 text-[#2563EB]" />
              <span className="text-2xl text-white">BusBook</span>
            </div>
            <p className="text-gray-400 mb-4">
              Book your bus tickets easily and travel comfortably across the country.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-[#2563EB] transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-[#2563EB] transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-[#2563EB] transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-[#2563EB] transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="hover:text-[#2563EB] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/my-bookings" className="hover:text-[#2563EB] transition-colors">
                  My Bookings
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-[#2563EB] transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#2563EB] transition-colors">
                  Help & Support
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-[#2563EB] transition-colors">
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#2563EB] transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#2563EB] transition-colors">
                  Refund Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#2563EB] transition-colors">
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <MapPin className="w-5 h-5 text-[#2563EB] mt-0.5 flex-shrink-0" />
                <span>123 Main Street, City, Country</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-[#2563EB] flex-shrink-0" />
                <span>+1 234 567 8900</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-[#2563EB] flex-shrink-0" />
                <span>support@busbook.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 BusBook. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
