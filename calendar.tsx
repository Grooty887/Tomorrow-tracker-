import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSchedules } from '@/hooks/use-schedules';

export function Calendar() {
  const { allSchedules } = useSchedules();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Generate month and year for header
  const currentMonth = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  
  // Get days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  // Get first day of month (0 = Sunday, 1 = Monday, etc)
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };
  
  // Generate calendar data
  const generateCalendarData = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    
    // Previous month days that show in this month's calendar
    const prevMonthDays = [];
    if (firstDayOfMonth > 0) {
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevMonthYear = month === 0 ? year - 1 : year;
      const daysInPrevMonth = getDaysInMonth(prevMonthYear, prevMonth);
      
      for (let i = firstDayOfMonth - 1; i >= 0; i--) {
        prevMonthDays.push({
          day: daysInPrevMonth - i,
          currentMonth: false,
          date: new Date(prevMonthYear, prevMonth, daysInPrevMonth - i),
        });
      }
    }
    
    // Current month days
    const currentMonthDays = [];
    for (let i = 1; i <= daysInMonth; i++) {
      currentMonthDays.push({
        day: i,
        currentMonth: true,
        date: new Date(year, month, i),
      });
    }
    
    // Next month days that show in this month's calendar
    const nextMonthDays = [];
    const totalDaysDisplayed = prevMonthDays.length + currentMonthDays.length;
    const remainingCells = 42 - totalDaysDisplayed; // 6 rows * 7 days = 42 cells
    
    if (remainingCells > 0) {
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextMonthYear = month === 11 ? year + 1 : year;
      
      for (let i = 1; i <= remainingCells; i++) {
        nextMonthDays.push({
          day: i,
          currentMonth: false,
          date: new Date(nextMonthYear, nextMonth, i),
        });
      }
    }
    
    return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
  };
  
  const calendarDays = generateCalendarData();
  
  // Check if a date has a schedule
  const hasSchedule = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return allSchedules.some(schedule => schedule.date === dateStr);
  };
  
  // Handle month navigation
  const prevMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  };
  
  const nextMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  };
  
  // Check if a day is today
  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Calendar</h2>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">{currentMonth}</h3>
          <div className="flex space-x-2">
            <button 
              className="p-1 rounded-full hover:bg-gray-100"
              onClick={prevMonth}
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            <button 
              className="p-1 rounded-full hover:bg-gray-100"
              onClick={nextMonth}
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
        
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 text-center text-sm">
          {/* Weekday headers */}
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day, i) => (
            <div key={i} className="text-gray-500 font-medium">{day}</div>
          ))}
          
          {/* Calendar days */}
          {calendarDays.map((day, i) => (
            <div 
              key={i} 
              className={`py-2 relative ${day.currentMonth ? '' : 'text-gray-300'}`}
            >
              <span 
                className={`
                  ${isToday(day.date) ? 'bg-primary text-white rounded-full' : ''}
                  ${day.currentMonth ? 'hover:bg-gray-100' : ''}
                  w-7 h-7 flex items-center justify-center mx-auto
                `}
              >
                {day.day}
              </span>
              {day.currentMonth && hasSchedule(day.date) && (
                <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 h-1 w-1 bg-blue-500 rounded-full"></span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
