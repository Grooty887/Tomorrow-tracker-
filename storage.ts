import { users, type User, type InsertUser, schedules, type Schedule, type InsertSchedule } from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updatedUser: Partial<User>): Promise<User | undefined>;
  
  // Schedule methods
  getSchedules(userId?: number): Promise<Schedule[]>;
  getScheduleById(id: number): Promise<Schedule | undefined>;
  createSchedule(schedule: InsertSchedule): Promise<Schedule>;
  updateSchedule(id: number, updatedSchedule: Partial<InsertSchedule>): Promise<Schedule | undefined>;
  deleteSchedule(id: number): Promise<boolean>;
  
  // Custom schedule queries
  getUpcomingSchedules(date: string): Promise<Schedule[]>;
  getTodaySchedules(): Promise<Schedule[]>;
  getTomorrowSchedules(): Promise<Schedule[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private scheduleStore: Map<number, Schedule>;
  private userIdCounter: number;
  private scheduleIdCounter: number;

  constructor() {
    this.users = new Map();
    this.scheduleStore = new Map();
    this.userIdCounter = 1;
    this.scheduleIdCounter = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const createdAt = new Date();
    const user: User = { ...insertUser, id, createdAt };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, updatedUser: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updated: User = { ...user, ...updatedUser };
    this.users.set(id, updated);
    return updated;
  }

  // Schedule methods
  async getSchedules(userId?: number): Promise<Schedule[]> {
    const schedules = Array.from(this.scheduleStore.values());
    if (userId) {
      return schedules.filter(schedule => schedule.userId === userId);
    }
    return schedules;
  }

  async getScheduleById(id: number): Promise<Schedule | undefined> {
    return this.scheduleStore.get(id);
  }

  async createSchedule(insertSchedule: InsertSchedule): Promise<Schedule> {
    const id = this.scheduleIdCounter++;
    const schedule: Schedule = { ...insertSchedule, id };
    this.scheduleStore.set(id, schedule);
    return schedule;
  }

  async updateSchedule(id: number, updatedSchedule: Partial<InsertSchedule>): Promise<Schedule | undefined> {
    const schedule = this.scheduleStore.get(id);
    if (!schedule) return undefined;
    
    const updated: Schedule = { ...schedule, ...updatedSchedule };
    this.scheduleStore.set(id, updated);
    return updated;
  }

  async deleteSchedule(id: number): Promise<boolean> {
    return this.scheduleStore.delete(id);
  }

  // Helper methods for schedule filtering
  async getUpcomingSchedules(date: string): Promise<Schedule[]> {
    const schedules = Array.from(this.scheduleStore.values());
    return schedules.filter(schedule => schedule.date >= date)
      .sort((a, b) => {
        if (a.date === b.date) {
          return a.time.localeCompare(b.time);
        }
        return a.date.localeCompare(b.date);
      });
  }

  async getTodaySchedules(): Promise<Schedule[]> {
    const today = new Date().toISOString().split('T')[0];
    const schedules = Array.from(this.scheduleStore.values());
    return schedules.filter(schedule => schedule.date === today)
      .sort((a, b) => a.time.localeCompare(b.time));
  }

  async getTomorrowSchedules(): Promise<Schedule[]> {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    const schedules = Array.from(this.scheduleStore.values());
    return schedules.filter(schedule => schedule.date === tomorrowStr)
      .sort((a, b) => a.time.localeCompare(b.time));
  }
}

export const storage = new MemStorage();
