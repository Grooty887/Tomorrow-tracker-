import React from 'react';
import { Schedule } from '@shared/schema';
import { getRelativeTimeString } from '@/utils/date-utils';
import { Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface UpcomingListProps {
  schedules: Schedule[];
  isLoading: boolean;
}

export function UpcomingList({ schedules, isLoading }: UpcomingListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center space-x-4 p-3 rounded-md">
            <div className="flex-shrink-0 rounded-md p-2">
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
            <div className="flex-1 min-w-0">
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  if (schedules.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-gray-500">No upcoming schedules</p>
      </div>
    );
  }

  // Sort by date and time
  const sortedSchedules = [...schedules].sort((a, b) => {
    if (a.date === b.date) {
      return a.time.localeCompare(b.time);
    }
    return a.date.localeCompare(b.date);
  });

  // Take only the next 5 schedules
  const upcomingSchedules = sortedSchedules.slice(0, 5);

  return (
    <div className="space-y-4">
      {upcomingSchedules.map((schedule) => {
        const relativeTime = getRelativeTimeString(schedule.date, schedule.time);
        const dateLabel = new Date(schedule.date).toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        });

        return (
          <div key={schedule.id} className="flex items-center space-x-4 p-3 rounded-md hover:bg-gray-50">
            <div className="flex-shrink-0 bg-indigo-100 rounded-md p-2">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{schedule.title}</p>
              <p className="text-sm text-gray-500">{dateLabel}, {schedule.time}</p>
            </div>
            <div>
              <span className={`
                inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                ${relativeTime.includes('hour') ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}
              `}>
                {relativeTime}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
