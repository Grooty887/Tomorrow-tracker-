import React from 'react';
import { useLocation } from 'wouter';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';

interface EveningPromptProps {
  onClose: () => void;
}

export function EveningPrompt({ onClose }: EveningPromptProps) {
  const [, setLocation] = useLocation();
  
  const handleAddSchedule = () => {
    // First close the prompt
    onClose();
    // Then set tomorrow as the default date in state or context
    // For simplicity, we'll just redirect to home
    setLocation('/');
    // In a real app, this would trigger the add schedule modal with tomorrow's date
    document.getElementById('add-schedule-btn')?.click();
  };
  
  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <div className="sm:flex sm:items-start">
          <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
            <Calendar className="h-6 w-6 text-primary" />
          </div>
          <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Plan tomorrow's schedule</h3>
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                What's on your agenda for tomorrow? Add your schedule now to get timely reminders.
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <Button 
            className="w-full"
            onClick={handleAddSchedule}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Schedule for Tomorrow
          </Button>
        </div>
        
        <div className="mt-4">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={onClose}
          >
            I'll do it later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
