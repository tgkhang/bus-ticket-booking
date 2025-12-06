import Link from 'next/link'
import { Bus, Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-gray-300 dark:text-gray-400 border-t border-gray-800 dark:border-gray-900">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Bus className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-white">BusBooking</span>
            </div>
            <p className="text-gray-400 dark:text-gray-500 mb-4 text-sm">
              Book your bus tickets easily and travel comfortably across the country. Your journey, our priority.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="text-gray-400 dark:text-gray-500 hover:text-blue-500 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 dark:text-gray-500 hover:text-blue-500 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 dark:text-gray-500 hover:text-blue-500 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 dark:text-gray-500 hover:text-blue-500 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-sm text-gray-400 dark:text-gray-500 hover:text-blue-500 transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/bookings"
                  className="text-sm text-gray-400 dark:text-gray-500 hover:text-blue-500 transition-colors"
                >
                  My Bookings
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-sm text-gray-400 dark:text-gray-500 hover:text-blue-500 transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/support"
                  className="text-sm text-gray-400 dark:text-gray-500 hover:text-blue-500 transition-colors"
                >
                  Help & Support
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-gray-400 dark:text-gray-500 hover:text-blue-500 transition-colors"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-gray-400 dark:text-gray-500 hover:text-blue-500 transition-colors"
                >
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-gray-400 dark:text-gray-500 hover:text-blue-500 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/refund"
                  className="text-sm text-gray-400 dark:text-gray-500 hover:text-blue-500 transition-colors"
                >
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/cookies"
                  className="text-sm text-gray-400 dark:text-gray-500 hover:text-blue-500 transition-colors"
                >
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-sm text-gray-400 dark:text-gray-500 hover:text-blue-500 transition-colors"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <MapPin className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-400 dark:text-gray-500">
                  123 Main Street, District 1, Ho Chi Minh City, Vietnam
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <a
                  href="tel:+84123456789"
                  className="text-sm text-gray-400 dark:text-gray-500 hover:text-blue-500 transition-colors"
                >
                  +84 123 456 789
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <a
                  href="mailto:support@busbooking.com"
                  className="text-sm text-gray-400 dark:text-gray-500 hover:text-blue-500 transition-colors"
                >
                  support@busbooking.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 dark:border-gray-900 mt-8 pt-8 text-center">
          <p className="text-sm text-gray-400 dark:text-gray-500">
            &copy; {currentYear} BusBooking. All rights reserved. Made with ❤️ in Vietnam.
          </p>
        </div>
      </div>
    </footer>
  )
}
