import { useState } from 'react';
import { Calendar, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

interface DatePickerAdvancedProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

export default function DatePickerAdvanced({ selectedDate, onDateChange }: DatePickerAdvancedProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [viewMode, setViewMode] = useState<'year' | 'month' | 'date'>('date');
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());

  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const generateYears = () => {
    const years = [];
    const startYear = new Date().getFullYear();
    for (let i = 0; i < 20; i++) {
      years.push(startYear + i);
    }
    return years;
  };

  const handleYearSelect = (year: number) => {
    setCurrentYear(year);
    setViewMode('month');
  };

  const handleMonthSelect = (monthIndex: number) => {
    setCurrentMonth(monthIndex);
    setViewMode('date');
  };

  const handleDateSelect = (day: number) => {
    const newDate = new Date(currentYear, currentMonth, day);
    onDateChange(formatDate(newDate));
    setIsExpanded(false);
  };

  const handlePreviousYear = () => {
    if (viewMode === 'year') {
      setCurrentYear(currentYear - 20);
    } else {
      setCurrentYear(currentYear - 1);
    }
  };

  const handleNextYear = () => {
    if (viewMode === 'year') {
      setCurrentYear(currentYear + 20);
    } else {
      setCurrentYear(currentYear + 1);
    }
  };

  const handlePreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const selectedDateObj = selectedDate ? parseDate(selectedDate) : new Date();
  const selectedDateFormatted = selectedDateObj.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="relative">
      {/* Minimized View */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-300 rounded-lg hover:border-[#2563EB] transition-colors w-full"
      >
        <Calendar className="w-5 h-5 text-[#2563EB]" />
        <div className="flex-1 text-left">
          <div className="text-xs text-gray-600">Travel Date</div>
          <div className="text-gray-900">{selectedDateFormatted}</div>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Expanded View */}
      {isExpanded && (
        <div className="absolute top-full left-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-xl z-50 p-4 w-80">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={viewMode === 'date' ? handlePreviousMonth : handlePreviousYear}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>

            <button
              onClick={() => {
                if (viewMode === 'date') setViewMode('month');
                else if (viewMode === 'month') setViewMode('year');
              }}
              className="text-gray-900 hover:text-[#2563EB] transition-colors"
            >
              {viewMode === 'date' && `${months[currentMonth]} ${currentYear}`}
              {viewMode === 'month' && currentYear}
              {viewMode === 'year' && `${currentYear} - ${currentYear + 19}`}
            </button>

            <button
              onClick={viewMode === 'date' ? handleNextMonth : handleNextYear}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Year View */}
          {viewMode === 'year' && (
            <div className="grid grid-cols-4 gap-2">
              {generateYears().map((year) => (
                <button
                  key={year}
                  onClick={() => handleYearSelect(year)}
                  className={`py-3 rounded-md transition-colors ${
                    year === currentYear
                      ? 'bg-[#2563EB] text-white'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
          )}

          {/* Month View */}
          {viewMode === 'month' && (
            <div className="grid grid-cols-3 gap-2">
              {months.map((month, index) => (
                <button
                  key={month}
                  onClick={() => handleMonthSelect(index)}
                  className={`py-3 rounded-md transition-colors ${
                    index === currentMonth && currentYear === new Date().getFullYear()
                      ? 'bg-[#2563EB] text-white'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  {month.slice(0, 3)}
                </button>
              ))}
            </div>
          )}

          {/* Date View */}
          {viewMode === 'date' && (
            <>
              {/* Days of Week */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {daysOfWeek.map((day) => (
                  <div key={day} className="text-center text-xs text-gray-600 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {generateCalendarDays().map((day, index) => {
                  if (day === null) {
                    return <div key={`empty-${index}`} />;
                  }

                  const isToday =
                    day === new Date().getDate() &&
                    currentMonth === new Date().getMonth() &&
                    currentYear === new Date().getFullYear();

                  const isSelected =
                    day === selectedDateObj.getDate() &&
                    currentMonth === selectedDateObj.getMonth() &&
                    currentYear === selectedDateObj.getFullYear();

                  const isPast =
                    new Date(currentYear, currentMonth, day) < new Date(new Date().setHours(0, 0, 0, 0));

                  return (
                    <button
                      key={day}
                      onClick={() => !isPast && handleDateSelect(day)}
                      disabled={isPast}
                      className={`py-2 rounded-md transition-colors ${
                        isPast
                          ? 'text-gray-300 cursor-not-allowed'
                          : isSelected
                          ? 'bg-[#2563EB] text-white'
                          : isToday
                          ? 'border-2 border-[#2563EB] text-[#2563EB]'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* Footer */}
          <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end gap-2">
            <button
              onClick={() => setIsExpanded(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onDateChange(formatDate(new Date()));
                setIsExpanded(false);
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
