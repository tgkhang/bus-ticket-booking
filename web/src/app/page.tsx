'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight,
  Shield,
  Zap,
  Users,
  Globe,
  Star,
  CheckCircle,
  Award,
  Clock,
  Wifi,
  Sparkles,
  ThumbsUp,
  Smartphone,
} from 'lucide-react'

export default function Home() {
  const { isAuthenticated, isInitialized, user } = useAuth()
  const router = useRouter()

  // auto redirect to dashboard if authenticated
  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      if (user?.role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/')
      }
    }
  }, [isAuthenticated, isInitialized, user, router])

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Hero Section with Background */}
      <section className="relative bg-linear-to-br from-[#2563EB] to-[#1e40af] text-white py-20 lg:py-32 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span className="text-sm text-white">Trusted by 500,000+ travelers</span>
            </div>
            <h1 className="text-white mb-6 text-4xl lg:text-6xl leading-tight font-bold">
              Your Journey,
              <br />
              Our Priority
            </h1>
            <p className="text-xl lg:text-2xl text-blue-100 max-w-3xl mx-auto">
              Book comfortable and affordable bus tickets across Vietnam with real-time availability and instant
              confirmation
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link href="/login">
              <button className="bg-white text-[#2563EB] px-8 py-4 rounded-lg hover:bg-gray-100 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl font-semibold text-lg">
                Sign In
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
            <Link href="/register">
              <button className="bg-white/10 backdrop-blur-sm border-2 border-white text-white px-8 py-4 rounded-lg hover:bg-white/20 transition-all font-semibold text-lg">
                Create Account
              </button>
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {[
              { icon: Users, label: '500K+ Travelers', color: 'text-blue-300' },
              { icon: Globe, label: '200+ Routes', color: 'text-green-300' },
              { icon: Star, label: '4.8 Rating', color: 'text-yellow-300' },
              { icon: Shield, label: 'Secure Booking', color: 'text-purple-300' },
            ].map((stat, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                <stat.icon className={`w-6 h-6 ${stat.color} mx-auto mb-2`} />
                <p className="text-white text-sm font-medium">{stat.label}</p>
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
                description:
                  'Book your tickets in seconds with our lightning-fast platform and get instant confirmation',
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
                <div
                  className={`inline-flex items-center justify-center w-16 h-16 ${feature.color} rounded-2xl mb-6 group-hover:scale-110 transition-transform`}
                >
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-gray-900 mb-3 font-semibold">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-linear-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Book your bus tickets in three simple steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connection Lines for Desktop */}
            <div className="hidden md:block absolute top-24 left-0 right-0 h-0.5 bg-linear-to-r from-blue-200 via-blue-400 to-blue-200 -z-10"></div>

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
                  <div className="w-24 h-24 bg-linear-to-br from-[#2563EB] to-[#1e40af] rounded-full flex items-center justify-center text-5xl shadow-lg">
                    {step.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md border-2 border-[#2563EB]">
                    <span className="text-[#2563EB] font-bold">{step.step}</span>
                  </div>
                </div>
                <h3 className="text-gray-900 mb-3 font-semibold">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full mb-4">
              <ThumbsUp className="w-4 h-4" />
              <span className="text-sm font-medium">4.8/5 from 50,000+ reviews</span>
            </div>
            <h2 className="text-gray-900 mb-4">What Our Travelers Say</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join thousands of satisfied customers who trust BusBook
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Sarah Johnson',
                role: 'Frequent Traveler',
                image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
                rating: 5,
                comment:
                  'BusBook has completely changed how I travel. The booking process is so smooth, and the buses are always on time. Highly recommended!',
              },
              {
                name: 'Michael Chen',
                role: 'Business Professional',
                image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
                rating: 5,
                comment:
                  'I travel for work weekly, and BusBook makes it hassle-free. The Wi-Fi on buses is excellent, and customer service is top-notch.',
              },
              {
                name: 'Emily Rodriguez',
                role: 'Tourist',
                image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
                rating: 5,
                comment:
                  'As a tourist, I was worried about navigating bus travel, but BusBook made it incredibly easy. The app is intuitive and support is amazing!',
              },
            ].map((testimonial, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all p-8 border border-gray-100"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">&quot;{testimonial.comment}&quot;</p>
                <div className="flex items-center gap-4">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    width={48}
                    height={48}
                    className="rounded-full object-cover"
                  />
                  <div>
                    <p className="text-gray-900 font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Download App CTA */}
      <section className="py-20 bg-linear-to-br from-[#2563EB] to-[#1e40af] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                <Smartphone className="w-4 h-4" />
                <span className="text-sm">Download Now</span>
              </div>
              <h2 className="text-white mb-6 text-4xl font-bold">Get the BusBook App</h2>
              <p className="text-xl text-blue-100 mb-8">
                Download our mobile app and enjoy exclusive deals, faster bookings, and seamless travel management on
                the go.
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
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                  </svg>
                  <div className="text-left">
                    <div className="text-xs">Download on the</div>
                    <div className="text-sm font-semibold">App Store</div>
                  </div>
                </button>
                <button className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-3">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                  </svg>
                  <div className="text-left">
                    <div className="text-xs">Get it on</div>
                    <div className="text-sm font-semibold">Google Play</div>
                  </div>
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10 flex justify-center">
                <div className="w-64 h-96 bg-white/10 backdrop-blur-sm rounded-3xl p-4 shadow-2xl border border-white/20">
                  <div className="w-full h-full bg-linear-to-br from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center">
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
    </div>
  )
}
