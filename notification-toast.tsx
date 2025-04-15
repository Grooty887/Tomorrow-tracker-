import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Clock, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NotificationToastProps {
  title: string;
  time: string;
  show: boolean;
  onDismiss: () => void;
}

export function NotificationToast({ title, time, show, onDismiss }: NotificationToastProps) {
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    if (show) {
      setVisible(true);
    }
  }, [show]);
  
  const handleDismiss = () => {
    setVisible(false);
    // Give time for the animation to finish
    setTimeout(onDismiss, 300);
  };
  
  const handleSnooze = () => {
    // In a real app, this would set a new notification time
    handleDismiss();
  };
  
  return (
    <div 
      className={cn(
        "fixed right-4 bottom-4 bg-white rounded-lg shadow-lg p-4 max-w-md transform transition-transform duration-300 z-30",
        visible ? "translate-y-0" : "translate-y-full"
      )}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Clock className="h-6 w-6 text-primary" />
        </div>
        <div className="ml-3 w-0 flex-1">
          <p className="text-sm font-medium text-gray-900">Upcoming: {title}</p>
          <p className="mt-1 text-sm text-gray-500">Starting in 10 minutes ({time})</p>
          <div className="mt-2 flex space-x-2">
            <Button 
              size="sm" 
              className="text-xs"
              onClick={handleDismiss}
            >
              Dismiss
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs"
              onClick={handleSnooze}
            >
              Snooze
            </Button>
          </div>
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button 
            className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            onClick={handleDismiss}
          >
            <span className="sr-only">Close</span>
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
