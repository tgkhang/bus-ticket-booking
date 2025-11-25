import { useState } from 'react';
import { MapPin, Users, X, Check } from 'lucide-react';

interface SearchEditorProps {
  searchParams: any;
  onUpdate: (params: any) => void;
  onClose: () => void;
}

export default function SearchEditor({ searchParams, onUpdate, onClose }: SearchEditorProps) {
  const [formData, setFormData] = useState(searchParams);
  const [fromSearch, setFromSearch] = useState(searchParams.from);
  const [toSearch, setToSearch] = useState(searchParams.to);
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);

  const cities = [
    'Ho Chi Minh City',
    'Hanoi',
    'Da Nang',
    'Da Lat',
    'Nha Trang',
    'Can Tho',
    'Hue',
    'Vung Tau',
  ];

  const filteredFromCities = cities.filter((city) =>
    city.toLowerCase().includes(fromSearch.toLowerCase())
  );

  const filteredToCities = cities.filter((city) =>
    city.toLowerCase().includes(toSearch.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
      ...formData,
      from: fromSearch,
      to: toSearch,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-gray-900">Update Search</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* From */}
            <div>
              <label className="block text-gray-700 mb-2">From</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={fromSearch}
                  onChange={(e) => {
                    setFromSearch(e.target.value);
                    setShowFromSuggestions(true);
                  }}
                  onBlur={() => setTimeout(() => setShowFromSuggestions(false), 200)}
                  placeholder="Search city..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-gray-900"
                  required
                />
                {showFromSuggestions && fromSearch && filteredFromCities.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto z-10">
                    {filteredFromCities.map((city) => (
                      <div
                        key={city}
                        className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                        onClick={() => {
                          setFromSearch(city);
                          setShowFromSuggestions(false);
                        }}
                      >
                        {city}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* To */}
            <div>
              <label className="block text-gray-700 mb-2">To</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={toSearch}
                  onChange={(e) => {
                    setToSearch(e.target.value);
                    setShowToSuggestions(true);
                  }}
                  onBlur={() => setTimeout(() => setShowToSuggestions(false), 200)}
                  placeholder="Search city..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-gray-900"
                  required
                />
                {showToSuggestions && toSearch && filteredToCities.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto z-10">
                    {filteredToCities.map((city) => (
                      <div
                        key={city}
                        className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                        onClick={() => {
                          setToSearch(city);
                          setShowToSuggestions(false);
                        }}
                      >
                        {city}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Passengers */}
            <div>
              <label className="block text-gray-700 mb-2">Passengers</label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="number"
                  value={formData.passengers}
                  onChange={(e) =>
                    setFormData({ ...formData, passengers: parseInt(e.target.value) || 1 })
                  }
                  min="1"
                  max="10"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-gray-900"
                  required
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-700 hover:text-gray-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-[#2563EB] text-white rounded-lg hover:bg-[#1d4ed8] transition-colors flex items-center gap-2"
            >
              <Check className="w-5 h-5" />
              Update Search
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
