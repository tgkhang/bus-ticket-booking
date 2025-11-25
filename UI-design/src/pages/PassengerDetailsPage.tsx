import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ArrowLeft, Check } from 'lucide-react';

export default function PassengerDetailsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { trip, searchParams, selectedSeats, totalPrice } = location.state || {};

  const [passengers, setPassengers] = useState(
    selectedSeats?.map((seat: string, index: number) => ({
      id: index + 1,
      seat,
      fullName: '',
      idNumber: '',
    })) || []
  );

  const [contactInfo, setContactInfo] = useState({
    email: '',
    phone: '',
  });

  const handlePassengerChange = (index: number, field: string, value: string) => {
    const updated = [...passengers];
    updated[index] = { ...updated[index], [field]: value };
    setPassengers(updated);
  };

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields are filled
    const allFilled = passengers.every((p) => p.fullName && p.idNumber) && contactInfo.email && contactInfo.phone;
    
    if (!allFilled) {
      alert('Please fill in all required fields');
      return;
    }

    navigate('/checkout', {
      state: { trip, searchParams, selectedSeats, totalPrice, passengers, contactInfo },
    });
  };

  if (!trip || !selectedSeats) {
    return (
      <div className="min-h-screen bg-[#F9FAFB]">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-gray-600">Invalid booking data. Please start over.</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#2563EB] hover:text-[#1d4ed8] mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Seat Selection
        </button>

        {/* Progress Stepper */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#10B981] text-white flex items-center justify-center">
                  <Check className="w-5 h-5" />
                </div>
                <span className="text-gray-900">Search</span>
              </div>
              <div className="w-16 h-0.5 bg-[#10B981]"></div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#2563EB] text-white flex items-center justify-center">
                  2
                </div>
                <span className="text-gray-900">Details</span>
              </div>
              <div className="w-16 h-0.5 bg-gray-300"></div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center">
                  3
                </div>
                <span className="text-gray-600">Payment</span>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleContinue}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Passenger Details Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-gray-900 mb-6">Passenger Details</h2>

                <div className="space-y-6">
                  {passengers.map((passenger, index) => (
                    <div key={passenger.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-900">Passenger {index + 1}</h3>
                        <span className="bg-[#2563EB] text-white px-3 py-1 rounded-md">
                          Seat {passenger.seat}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-gray-700 mb-2">
                            Full Name <span className="text-[#EF4444]">*</span>
                          </label>
                          <input
                            type="text"
                            value={passenger.fullName}
                            onChange={(e) =>
                              handlePassengerChange(index, 'fullName', e.target.value)
                            }
                            placeholder="Enter full name"
                            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-gray-900"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 mb-2">
                            ID/Passport Number <span className="text-[#EF4444]">*</span>
                          </label>
                          <input
                            type="text"
                            value={passenger.idNumber}
                            onChange={(e) =>
                              handlePassengerChange(index, 'idNumber', e.target.value)
                            }
                            placeholder="Enter ID or passport number"
                            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-gray-900"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Contact Information */}
                <div className="mt-8 border-t border-gray-200 pt-8">
                  <h3 className="text-gray-900 mb-4">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 mb-2">
                        Email Address <span className="text-[#EF4444]">*</span>
                      </label>
                      <input
                        type="email"
                        value={contactInfo.email}
                        onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                        placeholder="your@email.com"
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-gray-900"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-2">
                        Phone Number <span className="text-[#EF4444]">*</span>
                      </label>
                      <input
                        type="tel"
                        value={contactInfo.phone}
                        onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                        placeholder="+84 123 456 789"
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-gray-900"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                <h3 className="text-gray-900 mb-4">Booking Summary</h3>

                <div className="space-y-4 mb-6">
                  <div>
                    <p className="text-gray-600">Route</p>
                    <p className="text-gray-900">
                      {searchParams.from} → {searchParams.to}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Date & Time</p>
                    <p className="text-gray-900">
                      {searchParams.date} | {trip.departure}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Operator</p>
                    <p className="text-gray-900">{trip.operator}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Selected Seats</p>
                    <p className="text-gray-900">{selectedSeats.join(', ')}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Passengers</p>
                    <p className="text-gray-900">{passengers.length}</p>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-900">Total Price</span>
                    <span className="text-[#2563EB] text-2xl">
                      ₫{totalPrice.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    type="submit"
                    className="w-full bg-[#2563EB] text-white py-3 rounded-md hover:bg-[#1d4ed8] transition-colors"
                  >
                    Continue to Payment
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="w-full bg-gray-200 text-gray-700 py-3 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Back
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
}
