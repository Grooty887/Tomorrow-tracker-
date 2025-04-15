import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import AuthPage from "@/pages/auth-page";
import ProfilePage from "@/pages/profile-page";
import { useEffect, useState } from "react";
import { NotificationToast } from "./components/notification-toast";
import { EveningPrompt } from "./components/evening-prompt";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={Home} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [showEveningPrompt, setShowEveningPrompt] = useState<boolean>(false);
  const [notification, setNotification] = useState<{
    title: string;
    time: string;
    show: boolean;
  } | null>(null);
  
  // Set up WebSocket connection for real-time notifications
  useEffect(() => {
    // Check if it's evening (7 PM - 10 PM) to show evening prompt
    const checkForEveningPrompt = () => {
      const now = new Date();
      const hour = now.getHours();
      if (hour >= 19 && hour <= 22) {
        setShowEveningPrompt(true);
      }
    };
    
    // Check initially and then set interval
    checkForEveningPrompt();
    const intervalId = setInterval(checkForEveningPrompt, 60 * 60 * 1000); // Check every hour
    
    // Connect to WebSocket for notifications
    const socket = new WebSocket(`${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/ws-notifications`);
    
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'notification') {
          // Show browser notification if permission granted
          if (Notification.permission === 'granted') {
            new Notification(`Upcoming: ${data.data.title}`, {
              body: `Starting in 10 minutes (${data.data.time})`,
              icon: '/favicon.ico'
            });
          }
          
          // Also show in-app notification
          setNotification({
            title: data.data.title,
            time: data.data.time,
            show: true
          });
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    // Request notification permission if not set yet
    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
    
    return () => {
      clearInterval(intervalId);
      socket.close();
    };
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        
        {notification && (
          <NotificationToast
            title={notification.title}
            time={notification.time}
            show={notification.show}
            onDismiss={() => setNotification(null)}
          />
        )}
        
        {showEveningPrompt && (
          <EveningPrompt 
            onClose={() => setShowEveningPrompt(false)}
          />
        )}
        
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
