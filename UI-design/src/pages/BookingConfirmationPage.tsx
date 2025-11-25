import { useLocation, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { CheckCircle, Ticket, Download, Printer, ArrowRight } from 'lucide-react';

export default function BookingConfirmationPage() {
  const location = useLocation();
  const { bookingRef, trip, searchParams, selectedSeats, totalPrice, passengers, contactInfo } =
    location.state || {};

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    alert('PDF download functionality would be implemented here');
  };

  if (!bookingRef || !trip) {
    return (
      <div className="min-h-screen bg-[#F9FAFB]">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-gray-600">No booking found. Please make a booking first.</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#10B981] rounded-full mb-4">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-gray-900 mb-2">Booking Confirmed!</h1>
          <p className="text-gray-600 text-xl">
            Your bus ticket has been successfully booked
          </p>
        </div>

        {/* Booking Reference */}
        <div className="bg-gradient-to-r from-[#2563EB] to-[#1e40af] rounded-lg shadow-lg p-6 mb-8 text-center">
          <p className="text-blue-100 mb-2">Booking Reference Number</p>
          <h2 className="text-white tracking-wider">{bookingRef}</h2>
          <p className="text-blue-100 mt-4">
            A confirmation email has been sent to {contactInfo?.email}
          </p>
        </div>

        {/* E-Ticket Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          {/* Ticket Header */}
          <div className="bg-[#2563EB] text-white p-6 flex items-center gap-3">
            <Ticket className="w-8 h-8" />
            <div>
              <h3 className="text-white">E-Ticket</h3>
              <p className="text-blue-100">Keep this ticket for your journey</p>
            </div>
          </div>

          {/* Ticket Body */}
          <div className="p-6">
            {/* Route & Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 pb-6 border-b border-gray-200">
              <div>
                <p className="text-gray-600 mb-2">Route</p>
                <p className="text-gray-900 text-xl">
                  {searchParams.from} <ArrowRight className="inline w-5 h-5 mx-2" />{' '}
                  {searchParams.to}
                </p>
              </div>
              <div>
                <p className="text-gray-600 mb-2">Travel Date</p>
                <p className="text-gray-900 text-xl">{searchParams.date}</p>
              </div>
            </div>

            {/* Departure & Arrival */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 pb-6 border-b border-gray-200">
              <div>
                <p className="text-gray-600 mb-2">Departure</p>
                <p className="text-gray-900 text-xl">{trip.departure}</p>
                <p className="text-gray-600">{searchParams.from}</p>
              </div>
              <div>
                <p className="text-gray-600 mb-2">Arrival</p>
                <p className="text-gray-900 text-xl">{trip.arrival}</p>
                <p className="text-gray-600">{searchParams.to}</p>
              </div>
            </div>

            {/* Bus Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 pb-6 border-b border-gray-200">
              <div>
                <p className="text-gray-600 mb-2">Bus Operator</p>
                <p className="text-gray-900">{trip.operator}</p>
              </div>
              <div>
                <p className="text-gray-600 mb-2">Bus Model</p>
                <p className="text-gray-900">{trip.model}</p>
              </div>
            </div>

            {/* Passengers */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <p className="text-gray-600 mb-3">Passengers</p>
              <div className="space-y-2">
                {passengers.map((passenger: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 p-3 rounded-md"
                  >
                    <div>
                      <p className="text-gray-900">{passenger.fullName}</p>
                      <p className="text-gray-600">ID: {passenger.idNumber}</p>
                    </div>
                    <span className="bg-[#2563EB] text-white px-3 py-1 rounded-md">
                      Seat {passenger.seat}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* QR Code Placeholder */}
            <div className="flex items-center justify-center mb-6 pb-6 border-b border-gray-200">
              <div className="bg-gray-100 w-48 h-48 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="w-40 h-40 bg-white border-4 border-gray-300 rounded-lg mx-auto mb-2 flex items-center justify-center">
                    <span className="text-gray-400">QR Code</span>
                  </div>
                  <p className="text-gray-600">Scan at boarding</p>
                </div>
              </div>
            </div>

            {/* Total Amount */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Total Paid</span>
                <span className="text-[#2563EB] text-2xl">
                  ₫{totalPrice.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 bg-white border-2 border-gray-300 text-gray-700 py-3 rounded-md hover:bg-gray-50 transition-colors"
          >
            <Printer className="w-5 h-5" />
            Print Ticket
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center justify-center gap-2 bg-white border-2 border-gray-300 text-gray-700 py-3 rounded-md hover:bg-gray-50 transition-colors"
          >
            <Download className="w-5 h-5" />
            Download PDF
          </button>
          <Link
            to="/my-bookings"
            className="flex items-center justify-center gap-2 bg-[#2563EB] text-white py-3 rounded-md hover:bg-[#1d4ed8] transition-colors"
          >
            View My Bookings
          </Link>
        </div>

        {/* Important Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-gray-900 mb-3">Important Information</h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-[#2563EB] mt-1">•</span>
              <span>Please arrive at the departure point at least 15 minutes before departure time</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#2563EB] mt-1">•</span>
              <span>Bring a valid ID that matches the passenger information provided</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#2563EB] mt-1">•</span>
              <span>Show this e-ticket or QR code to the driver when boarding</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#2563EB] mt-1">•</span>
              <span>
                For any changes or cancellations, please contact us at least 24 hours before departure
              </span>
            </li>
          </ul>
        </div>
      </div>

      <Footer />
    </div>
  );
}
