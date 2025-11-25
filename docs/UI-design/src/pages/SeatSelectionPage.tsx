import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ArrowLeft, User, Radio } from 'lucide-react';

type SeatStatus = 'available' | 'booked' | 'selected' | 'locked';

interface Seat {
  id: string;
  status: SeatStatus;
  price: number;
}

export default function SeatSelectionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { tripId } = useParams();
  const { trip, searchParams } = location.state || {};

  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  useEffect(() => {
    // Initialize seats (4 columns x 10 rows = 40 seats)
    const initialSeats: Seat[] = [];
    const rows = 10;
    const cols = ['A', 'B', 'C', 'D'];

    for (let row = 1; row <= rows; row++) {
      for (let col of cols) {
        const seatId = `${col}${row}`;
        // Randomly make some seats booked or locked
        const random = Math.random();
        let status: SeatStatus = 'available';
        if (random < 0.15) status = 'booked';
        else if (random < 0.2) status = 'locked';

        initialSeats.push({
          id: seatId,
          status,
          price: trip?.price || 190000,
        });
      }
    }
    setSeats(initialSeats);
  }, [trip]);

  const handleSeatClick = (seatId: string) => {
    const seat = seats.find((s) => s.id === seatId);
    if (!seat || seat.status === 'booked' || seat.status === 'locked') return;

    if (selectedSeats.includes(seatId)) {
      // Deselect
      setSelectedSeats(selectedSeats.filter((s) => s !== seatId));
      setSeats(
        seats.map((s) => (s.id === seatId ? { ...s, status: 'available' as SeatStatus } : s))
      );
    } else {
      // Select (limit to number of passengers)
      if (selectedSeats.length < (searchParams?.passengers || 1)) {
        setSelectedSeats([...selectedSeats, seatId]);
        setSeats(
          seats.map((s) => (s.id === seatId ? { ...s, status: 'selected' as SeatStatus } : s))
        );
      }
    }
  };

  const getSeatColor = (status: SeatStatus) => {
    switch (status) {
      case 'available':
        return 'bg-[#10B981] hover:bg-[#059669] cursor-pointer';
      case 'booked':
        return 'bg-[#EF4444] cursor-not-allowed';
      case 'selected':
        return 'bg-[#F59E0B] cursor-pointer';
      case 'locked':
        return 'bg-[#F97316] cursor-not-allowed';
      default:
        return 'bg-gray-300';
    }
  };

  const totalPrice = selectedSeats.length * (trip?.price || 190000);

  const handleContinue = () => {
    if (selectedSeats.length === 0) {
      alert('Please select at least one seat');
      return;
    }
    navigate('/passenger-details', { state: { trip, searchParams, selectedSeats, totalPrice } });
  };

  if (!trip) {
    return (
      <div className="min-h-screen bg-[#F9FAFB]">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-gray-600">No trip selected. Please go back and select a trip.</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button & Header */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#2563EB] hover:text-[#1d4ed8] mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Search Results
        </button>

        {/* Trip Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-gray-900 mb-4">Trip Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-gray-600">Operator</p>
              <p className="text-gray-900">{trip.operator}</p>
            </div>
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
              <p className="text-gray-600">Duration</p>
              <p className="text-gray-900">{trip.duration}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Seat Map */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-gray-900">Select Your Seats</h2>
                <div className="flex items-center gap-2 text-[#10B981]">
                  <Radio className="w-4 h-4" />
                  <span>Live updates enabled</span>
                </div>
              </div>

              {/* Bus Layout */}
              <div className="max-w-md mx-auto">
                {/* Driver */}
                <div className="flex justify-end mb-6 pb-4 border-b-2 border-gray-300">
                  <div className="bg-gray-300 rounded-lg px-6 py-3 flex items-center gap-2">
                    <User className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-700">Driver</span>
                  </div>
                </div>

                {/* Seats Grid */}
                <div className="grid grid-cols-4 gap-3">
                  {seats.map((seat) => (
                    <button
                      key={seat.id}
                      onClick={() => handleSeatClick(seat.id)}
                      disabled={seat.status === 'booked' || seat.status === 'locked'}
                      className={`aspect-square rounded-lg flex items-center justify-center transition-colors ${getSeatColor(
                        seat.status
                      )} text-white`}
                      title={`Seat ${seat.id} - ${seat.status}`}
                    >
                      {seat.id}
                    </button>
                  ))}
                </div>

                {/* Legend */}
                <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-[#10B981] rounded"></div>
                    <span className="text-gray-700">Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-[#EF4444] rounded"></div>
                    <span className="text-gray-700">Booked</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-[#F59E0B] rounded"></div>
                    <span className="text-gray-700">Your Selection</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-[#F97316] rounded"></div>
                    <span className="text-gray-700">Locked by Others</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h3 className="text-gray-900 mb-4">Booking Summary</h3>

              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-gray-600">Selected Seats</p>
                  <p className="text-gray-900">
                    {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'No seats selected'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Number of Seats</p>
                  <p className="text-gray-900">
                    {selectedSeats.length} / {searchParams?.passengers || 1}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Price per Seat</p>
                  <p className="text-gray-900">₫{trip.price.toLocaleString()}</p>
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

              <button
                onClick={handleContinue}
                disabled={selectedSeats.length === 0}
                className="w-full bg-[#2563EB] text-white py-3 rounded-md hover:bg-[#1d4ed8] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Continue
              </button>

              {selectedSeats.length === 0 && (
                <p className="text-[#EF4444] text-center mt-3">
                  Please select your seats to continue
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
