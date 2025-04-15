import React, { useState } from 'react';
import { Header } from '@/components/header';
import { ScheduleList } from '@/components/schedule-list';
import { ScheduleModal } from '@/components/schedule-modal';
import { Calendar } from '@/components/calendar';
import { UpcomingList } from '@/components/upcoming-list';
import { useSchedules } from '@/hooks/use-schedules';
import { Schedule } from '@shared/schema';
import { formatDate } from '@/utils/date-utils';

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  
  const {
    todaySchedules,
    upcomingSchedules,
    isLoading,
    addSchedule,
    updateSchedule,
    deleteSchedule
  } = useSchedules();
  
  const handleAddSchedule = () => {
    setEditingSchedule(null);
    setIsModalOpen(true);
  };
  
  const handleEditSchedule = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setIsModalOpen(true);
  };
  
  const handleSaveSchedule = async (scheduleData: Partial<Schedule>) => {
    if (editingSchedule) {
      await updateSchedule(editingSchedule.id, scheduleData);
    } else {
      await addSchedule(scheduleData as Omit<Schedule, 'id'>);
    }
    setIsModalOpen(false);
  };
  
  const handleDeleteSchedule = async (id: number) => {
    await deleteSchedule(id);
  };
  
  const currentDate = formatDate(new Date());
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header onNotificationClick={() => {}} />
      
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="lg:grid lg:grid-cols-3 lg:gap-8">
            {/* Left Panel */}
            <div className="col-span-2">
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">{currentDate}</h2>
                  <div>
                    <button
                      id="add-schedule-btn"
                      className="bg-primary hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                      onClick={handleAddSchedule}
                    >
                      Add Schedule
                    </button>
                  </div>
                </div>
                
                <ScheduleList
                  schedules={todaySchedules}
                  isLoading={isLoading}
                  onEdit={handleEditSchedule}
                  onDelete={handleDeleteSchedule}
                />
              </div>
            </div>
            
            {/* Right Panel */}
            <div className="lg:pl-8">
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming</h2>
                <UpcomingList schedules={upcomingSchedules} isLoading={isLoading} />
              </div>
              
              <Calendar />
            </div>
          </div>
        </div>
      </main>
      
      <ScheduleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveSchedule}
        schedule={editingSchedule}
      />
    </div>
  );
}
