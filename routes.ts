import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertScheduleSchema } from "@shared/schema";
import { z } from "zod";
import schedule from 'node-schedule';
import { WebSocketServer, WebSocket } from 'ws';
import { setupAuth } from './auth';

interface NotificationData {
  scheduleId: number;
  title: string;
  time: string;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);

  const httpServer = createServer(app);
  
  // Set up WebSocket server for real-time notifications
  // Use a specific path for our WebSocket server to avoid conflicts with Vite's WebSocket
  const wss = new WebSocketServer({ 
    server: httpServer, 
    path: '/ws-notifications' 
  });
  
  const clients = new Set<WebSocket>();
  
  wss.on('connection', (ws) => {
    console.log('WebSocket client connected for notifications');
    clients.add(ws);
    
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
      clients.delete(ws);
    });
  });
  
  // Helper function to broadcast notifications to all connected clients
  const broadcastNotification = (notification: NotificationData) => {
    const message = JSON.stringify({
      type: 'notification',
      data: notification
    });
    
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  };
  
  // Schedule notification jobs
  const scheduleNotifications = async () => {
    // Get today's schedules
    const todaySchedules = await storage.getTodaySchedules();
    
    // Clear any existing scheduled jobs
    Object.keys(schedule.scheduledJobs).forEach(jobName => {
      schedule.cancelJob(jobName);
    });
    
    // Schedule new notification jobs for each schedule
    todaySchedules.forEach(scheduleItem => {
      if (!scheduleItem.notify) return;
      
      const [hour, minute] = scheduleItem.time.split(':').map(Number);
      
      // Calculate notification time (10 minutes before)
      const notificationTime = new Date();
      notificationTime.setHours(hour, minute - 10, 0);
      
      // Only schedule if the time is in the future
      if (notificationTime > new Date()) {
        const jobName = `notify-${scheduleItem.id}`;
        
        schedule.scheduleJob(jobName, notificationTime, () => {
          broadcastNotification({
            scheduleId: scheduleItem.id,
            title: scheduleItem.title,
            time: scheduleItem.time
          });
        });
      }
    });
  };
  
  // Call initially and then set to run daily at midnight
  scheduleNotifications();
  schedule.scheduleJob('0 0 * * *', scheduleNotifications);
  
  // Schedule API routes
  app.get('/api/schedules', async (req, res) => {
    try {
      const schedules = await storage.getSchedules();
      res.json(schedules);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch schedules' });
    }
  });
  
  app.get('/api/schedules/today', async (req, res) => {
    try {
      const schedules = await storage.getTodaySchedules();
      res.json(schedules);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch today\'s schedules' });
    }
  });
  
  app.get('/api/schedules/tomorrow', async (req, res) => {
    try {
      const schedules = await storage.getTomorrowSchedules();
      res.json(schedules);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch tomorrow\'s schedules' });
    }
  });
  
  app.get('/api/schedules/upcoming', async (req, res) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const schedules = await storage.getUpcomingSchedules(today);
      res.json(schedules);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch upcoming schedules' });
    }
  });
  
  app.get('/api/schedules/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid ID format' });
      }
      
      const schedule = await storage.getScheduleById(id);
      if (!schedule) {
        return res.status(404).json({ message: 'Schedule not found' });
      }
      
      res.json(schedule);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch schedule' });
    }
  });
  
  app.post('/api/schedules', async (req, res) => {
    try {
      const parseResult = insertScheduleSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        return res.status(400).json({ 
          message: 'Invalid schedule data', 
          errors: parseResult.error.errors
        });
      }
      
      const newSchedule = await storage.createSchedule(parseResult.data);
      
      // Re-schedule notifications after adding a new schedule
      scheduleNotifications();
      
      res.status(201).json(newSchedule);
    } catch (error) {
      res.status(500).json({ message: 'Failed to create schedule' });
    }
  });
  
  app.put('/api/schedules/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid ID format' });
      }
      
      // Only validate the fields that are being updated
      const partialSchema = insertScheduleSchema.partial();
      const parseResult = partialSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        return res.status(400).json({ 
          message: 'Invalid schedule data', 
          errors: parseResult.error.errors
        });
      }
      
      const updatedSchedule = await storage.updateSchedule(id, parseResult.data);
      if (!updatedSchedule) {
        return res.status(404).json({ message: 'Schedule not found' });
      }
      
      // Re-schedule notifications after updating
      scheduleNotifications();
      
      res.json(updatedSchedule);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update schedule' });
    }
  });
  
  app.delete('/api/schedules/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid ID format' });
      }
      
      const deleted = await storage.deleteSchedule(id);
      if (!deleted) {
        return res.status(404).json({ message: 'Schedule not found' });
      }
      
      // Re-schedule notifications after deleting
      scheduleNotifications();
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete schedule' });
    }
  });

  return httpServer;
}
