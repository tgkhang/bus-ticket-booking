import { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface DatePickerWeeklyProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

export default function DatePickerWeekly({ selectedDate, onDateChange }: DatePickerWeeklyProps) {
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [weekStartDate, setWeekStartDate] = useState(new Date());

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const parseDate = (dateStr: string) => {
    const parts = dateStr.split('-');
    return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  };

  const getWeekDates = (startDate: Date) => {
    const dates = [];
    for (let i = 0; i < 8; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates(weekStartDate);

  const handlePreviousWeek = () => {
    const newDate = new Date(weekStartDate);
    newDate.setDate(newDate.getDate() - 7);
    setWeekStartDate(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(weekStartDate);
    newDate.setDate(newDate.getDate() + 7);
    setWeekStartDate(newDate);
  };

  const handleMonthSelect = (monthIndex: number) => {
    setCurrentMonth(monthIndex);
    const newDate = new Date(currentYear, monthIndex, 1);
    setWeekStartDate(newDate);
    setShowMonthPicker(false);
  };

  const handleYearSelect = (year: number) => {
    setCurrentYear(year);
    const newDate = new Date(year, currentMonth, 1);
    setWeekStartDate(newDate);
    setShowYearPicker(false);
  };

  const generateYears = () => {
    const years = [];
    const startYear = new Date().getFullYear();
    for (let i = 0; i < 20; i++) {
      years.push(startYear + i);
    }
    return years;
  };

  const selectedDateObj = selectedDate ? parseDate(selectedDate) : new Date();

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Month/Year Selector */}
      <div className="border-b border-gray-200 px-4 py-3 flex items-center justify-between bg-gray-50">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#2563EB]" />
          <button
            onClick={() => {
              setShowMonthPicker(!showMonthPicker);
              setShowYearPicker(false);
            }}
            className="text-gray-900 hover:text-[#2563EB] transition-colors"
          >
            {months[weekStartDate.getMonth()]}
          </button>
          <span className="text-gray-500">/</span>
          <button
            onClick={() => {
              setShowYearPicker(!showYearPicker);
              setShowMonthPicker(false);
            }}
            className="text-gray-900 hover:text-[#2563EB] transition-colors"
          >
            {weekStartDate.getFullYear()}
          </button>
        </div>
        <div className="text-sm text-gray-600">Select travel date</div>
      </div>

      {/* Month Picker - Horizontal Scroll List */}
      {showMonthPicker && (
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="flex items-center">
            <button
              onClick={() => {
                const newMonth = currentMonth === 0 ? 11 : currentMonth - 1;
                setCurrentMonth(newMonth);
              }}
              className="px-3 py-4 hover:bg-gray-100 transition-colors flex-shrink-0"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex-1 overflow-x-auto">
              <div className="flex gap-2 px-4 py-3">
                {months.map((month, index) => (
                  <button
                    key={month}
                    onClick={() => handleMonthSelect(index)}
                    className={`px-4 py-2 rounded-md whitespace-nowrap transition-colors ${
                      index === weekStartDate.getMonth()
                        ? 'bg-[#2563EB] text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    {month}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={() => {
                const newMonth = currentMonth === 11 ? 0 : currentMonth + 1;
                setCurrentMonth(newMonth);
              }}
              className="px-3 py-4 hover:bg-gray-100 transition-colors flex-shrink-0"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      )}

      {/* Year Picker - Horizontal Scroll List */}
      {showYearPicker && (
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="flex items-center">
            <button
              onClick={() => setCurrentYear(currentYear - 1)}
              className="px-3 py-4 hover:bg-gray-100 transition-colors flex-shrink-0"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex-1 overflow-x-auto">
              <div className="flex gap-2 px-4 py-3">
                {generateYears().map((year) => (
                  <button
                    key={year}
                    onClick={() => handleYearSelect(year)}
                    className={`px-4 py-2 rounded-md whitespace-nowrap transition-colors ${
                      year === weekStartDate.getFullYear()
                        ? 'bg-[#2563EB] text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={() => setCurrentYear(currentYear + 1)}
              className="px-3 py-4 hover:bg-gray-100 transition-colors flex-shrink-0"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      )}

      {/* Week Date Selector */}
      <div className="flex items-center">
        <button
          onClick={handlePreviousWeek}
          className="px-3 py-4 hover:bg-gray-100 transition-colors flex-shrink-0"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1 flex overflow-x-auto">
          {weekDates.map((date, index) => {
            const isSelected =
              formatDate(date) === selectedDate ||
              (date.getDate() === selectedDateObj.getDate() &&
                date.getMonth() === selectedDateObj.getMonth() &&
                date.getFullYear() === selectedDateObj.getFullYear());

            const isToday =
              date.getDate() === new Date().getDate() &&
              date.getMonth() === new Date().getMonth() &&
              date.getFullYear() === new Date().getFullYear();

            const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));

            return (
              <button
                key={index}
                onClick={() => !isPast && onDateChange(formatDate(date))}
                disabled={isPast}
                className={`flex-1 min-w-[100px] py-4 px-2 text-center border-r border-gray-200 transition-colors ${
                  isPast
                    ? 'bg-gray-50 cursor-not-allowed opacity-50'
                    : isSelected
                    ? 'bg-blue-50 border-b-2 border-[#2563EB]'
                    : 'hover:bg-blue-50'
                }`}
              >
                <div
                  className={`text-sm ${
                    isSelected ? 'text-[#2563EB]' : isPast ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  {date.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className="text-xl mt-1">
                  {date.getDate()}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {isToday ? 'Today' : date.toLocaleDateString('en-US', { month: 'short' })}
                </div>
              </button>
            );
          })}
        </div>
        <button
          onClick={handleNextWeek}
          className="px-3 py-4 hover:bg-gray-100 transition-colors flex-shrink-0"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </div>
  );
}