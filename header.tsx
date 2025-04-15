import { useState } from 'react';
import { Bell, Clock, User, LogOut } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { areNotificationsSupported, requestNotificationPermission } from "@/utils/notification-utils";
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onNotificationClick: () => void;
}

export function Header({ onNotificationClick }: HeaderProps) {
  const [hasNotification, setHasNotification] = useState(false);
  const [notificationSupported] = useState(areNotificationsSupported());
  const { user, logoutMutation } = useAuth();
  
  const handleNotificationClick = () => {
    setHasNotification(false);
    onNotificationClick();
  };
  
  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      onNotificationClick();
    }
  };
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="no-underline">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-primary" />
              <h1 className="ml-2 text-xl font-semibold text-gray-900">ScheduleAlert</h1>
            </div>
          </Link>
          
          <div className="flex items-center gap-3">
            {notificationSupported && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleEnableNotifications}
                className="flex items-center gap-2"
              >
                <Bell className="h-4 w-4" />
                <span className="hidden md:inline">Enable Notifications</span>
              </Button>
            )}
            
            <button 
              className="relative p-1 rounded-full text-gray-500 hover:text-gray-700 focus:outline-none"
              onClick={handleNotificationClick}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {hasNotification && (
                <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">
                  1
                </span>
              )}
            </button>
            
            <div className="relative">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="focus:outline-none">
                    <Avatar className="h-8 w-8 bg-primary/10">
                      <AvatarImage src={user?.image} />
                      <AvatarFallback>{user?.name?.charAt(0) || user?.username?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    <span>Hello, {user?.name || user?.username}</span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link href="/profile" className="no-underline text-foreground">
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
