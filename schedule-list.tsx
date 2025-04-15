import React from 'react';
import { Schedule } from '@shared/schema';
import { formatTimeRange } from '@/utils/date-utils';
import { Pencil, Trash2, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface ScheduleListProps {
  schedules: Schedule[];
  isLoading: boolean;
  onEdit: (schedule: Schedule) => void;
  onDelete: (id: number) => void;
}

export function ScheduleList({ schedules, isLoading, onEdit, onDelete }: ScheduleListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4 mb-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <Skeleton className="h-5 w-40 mb-2" />
                <Skeleton className="h-4 w-60" />
              </div>
              <div className="flex items-center">
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            </div>
            <div className="mt-2">
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (schedules.length === 0) {
    return (
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No schedules</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by creating a new schedule for tomorrow.</p>
      </div>
    );
  }

  const getDateBadge = (date: string) => {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    if (date === today) {
      return (
        <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
          Today
        </span>
      );
    } else if (date === tomorrowStr) {
      return (
        <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
          Tomorrow
        </span>
      );
    } else {
      return (
        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
          Upcoming
        </span>
      );
    }
  };

  return (
    <div className="space-y-4 mb-4">
      {schedules.map((schedule) => (
        <div key={schedule.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition duration-150 ease-in-out">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium text-gray-900">{schedule.title}</h3>
              <p className="text-sm text-gray-500">{schedule.description || "No description"}</p>
            </div>
            <div className="flex items-center">
              {getDateBadge(schedule.date)}
              <div className="flex ml-4">
                <button 
                  className="text-gray-500 hover:text-gray-700" 
                  onClick={() => onEdit(schedule)}
                >
                  <Pencil className="h-5 w-5" />
                </button>
                <button 
                  className="ml-2 text-gray-500 hover:text-red-600" 
                  onClick={() => onDelete(schedule.id)}
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm text-gray-600">
            <Clock className="h-5 w-5 mr-1 text-gray-400" />
            <span>{formatTimeRange(schedule.time, schedule.duration)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
