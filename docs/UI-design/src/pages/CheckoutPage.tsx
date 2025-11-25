import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ArrowLeft, Check, CreditCard, Wallet, Clock } from 'lucide-react';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { trip, searchParams, selectedSeats, totalPrice, passengers, contactInfo } =
    location.state || {};

  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiry: '',
    cvv: '',
    cardName: '',
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [isProcessing, setIsProcessing] = useState(false);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          alert('Session expired. Please start over.');
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreedToTerms) {
      alert('Please agree to the terms and conditions');
      return;
    }

    if (paymentMethod === 'card') {
      if (!cardDetails.cardNumber || !cardDetails.expiry || !cardDetails.cvv || !cardDetails.cardName) {
        alert('Please fill in all card details');
        return;
      }
    }

    setIsProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      const bookingRef = `BUS-2024-${Math.floor(Math.random() * 900000) + 100000}`;
      navigate('/booking-confirmation', {
        state: {
          bookingRef,
          trip,
          searchParams,
          selectedSeats,
          totalPrice,
          passengers,
          contactInfo,
          paymentMethod,
        },
      });
    }, 2000);
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
          Back to Passenger Details
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
                <div className="w-8 h-8 rounded-full bg-[#10B981] text-white flex items-center justify-center">
                  <Check className="w-5 h-5" />
                </div>
                <span className="text-gray-900">Details</span>
              </div>
              <div className="w-16 h-0.5 bg-[#2563EB]"></div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#2563EB] text-white flex items-center justify-center">
                  3
                </div>
                <span className="text-gray-900">Payment</span>
              </div>
            </div>
          </div>
        </div>

        {/* Countdown Timer */}
        <div className="bg-[#FEF3C7] border border-[#F59E0B] rounded-lg p-4 mb-8 flex items-center justify-center gap-2">
          <Clock className="w-5 h-5 text-[#F59E0B]" />
          <span className="text-gray-900">
            Seats held for: <span className="text-[#F59E0B]">{formatTime(timeLeft)}</span>
          </span>
        </div>

        <form onSubmit={handlePayment}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Payment Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Booking Summary Card */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-gray-900 mb-4">Booking Summary</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Route:</span>
                    <span className="text-gray-900">
                      {searchParams.from} → {searchParams.to}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date & Time:</span>
                    <span className="text-gray-900">
                      {searchParams.date} | {trip.departure}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Operator:</span>
                    <span className="text-gray-900">{trip.operator}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Seats:</span>
                    <span className="text-gray-900">{selectedSeats.join(', ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Passengers:</span>
                    <span className="text-gray-900">{passengers.length}</span>
                  </div>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-gray-900 mb-4">Payment Method</h2>

                <div className="space-y-3 mb-6">
                  {/* Credit Card */}
                  <label
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      paymentMethod === 'card'
                        ? 'border-[#2563EB] bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3"
                    />
                    <CreditCard className="w-6 h-6 text-gray-600 mr-3" />
                    <div className="flex-1">
                      <span className="text-gray-900">Credit / Debit Card</span>
                      <p className="text-gray-600">Visa, Mastercard, American Express</p>
                    </div>
                  </label>

                  {/* MoMo */}
                  <label
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      paymentMethod === 'momo'
                        ? 'border-[#2563EB] bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="momo"
                      checked={paymentMethod === 'momo'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3"
                    />
                    <Wallet className="w-6 h-6 text-pink-500 mr-3" />
                    <div className="flex-1">
                      <span className="text-gray-900">MoMo E-Wallet</span>
                      <p className="text-gray-600">Pay with MoMo</p>
                    </div>
                  </label>

                  {/* ZaloPay */}
                  <label
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      paymentMethod === 'zalopay'
                        ? 'border-[#2563EB] bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="zalopay"
                      checked={paymentMethod === 'zalopay'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3"
                    />
                    <Wallet className="w-6 h-6 text-blue-500 mr-3" />
                    <div className="flex-1">
                      <span className="text-gray-900">ZaloPay E-Wallet</span>
                      <p className="text-gray-600">Pay with ZaloPay</p>
                    </div>
                  </label>
                </div>

                {/* Card Details Form */}
                {paymentMethod === 'card' && (
                  <div className="space-y-4 border-t border-gray-200 pt-6">
                    <div>
                      <label className="block text-gray-700 mb-2">Card Number</label>
                      <input
                        type="text"
                        value={cardDetails.cardNumber}
                        onChange={(e) =>
                          setCardDetails({ ...cardDetails, cardNumber: e.target.value })
                        }
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-gray-900"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-700 mb-2">Expiry Date</label>
                        <input
                          type="text"
                          value={cardDetails.expiry}
                          onChange={(e) =>
                            setCardDetails({ ...cardDetails, expiry: e.target.value })
                          }
                          placeholder="MM/YY"
                          maxLength={5}
                          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 mb-2">CVV</label>
                        <input
                          type="text"
                          value={cardDetails.cvv}
                          onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                          placeholder="123"
                          maxLength={4}
                          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-gray-900"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-2">Cardholder Name</label>
                      <input
                        type="text"
                        value={cardDetails.cardName}
                        onChange={(e) =>
                          setCardDetails({ ...cardDetails, cardName: e.target.value })
                        }
                        placeholder="John Doe"
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-gray-900"
                      />
                    </div>
                  </div>
                )}

                {/* Terms & Conditions */}
                <div className="mt-6">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="mt-1 rounded text-[#2563EB] focus:ring-[#2563EB]"
                    />
                    <span className="text-gray-700">
                      I agree to the{' '}
                      <a href="#" className="text-[#2563EB] hover:underline">
                        Terms and Conditions
                      </a>{' '}
                      and{' '}
                      <a href="#" className="text-[#2563EB] hover:underline">
                        Privacy Policy
                      </a>
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Price Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                <h3 className="text-gray-900 mb-4">Price Summary</h3>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ticket Price</span>
                    <span className="text-gray-900">₫{totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service Fee</span>
                    <span className="text-gray-900">₫0</span>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-900">Total Amount</span>
                    <span className="text-[#2563EB] text-2xl">
                      ₫{totalPrice.toLocaleString()}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-[#2563EB] text-white py-3 rounded-md hover:bg-[#1d4ed8] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Processing...
                    </>
                  ) : (
                    'Pay Now'
                  )}
                </button>

                <p className="text-gray-600 text-center mt-4">
                  Secure payment powered by Stripe
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
}
