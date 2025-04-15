import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Schedule, InsertSchedule } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

export function useSchedules() {
  const { toast } = useToast();
  
  // Fetch all schedules
  const { 
    data: allSchedules = [],
    isLoading,
    isError
  } = useQuery<Schedule[]>({
    queryKey: ['/api/schedules'],
  });
  
  // Fetch today's schedules
  const { 
    data: todaySchedules = []
  } = useQuery<Schedule[]>({
    queryKey: ['/api/schedules/today'],
  });
  
  // Fetch tomorrow's schedules
  const { 
    data: tomorrowSchedules = []
  } = useQuery<Schedule[]>({
    queryKey: ['/api/schedules/tomorrow'],
  });
  
  // Fetch upcoming schedules
  const { 
    data: upcomingSchedules = []
  } = useQuery<Schedule[]>({
    queryKey: ['/api/schedules/upcoming'],
  });
  
  // Add a new schedule
  const addScheduleMutation = useMutation({
    mutationFn: async (newSchedule: Omit<InsertSchedule, 'id'>) => {
      const response = await apiRequest('POST', '/api/schedules', newSchedule);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Schedule created',
        description: 'Your schedule has been successfully added',
      });
      
      // Invalidate all schedule queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/schedules'] });
      queryClient.invalidateQueries({ queryKey: ['/api/schedules/today'] });
      queryClient.invalidateQueries({ queryKey: ['/api/schedules/tomorrow'] });
      queryClient.invalidateQueries({ queryKey: ['/api/schedules/upcoming'] });
    },
    onError: (error) => {
      toast({
        title: 'Failed to create schedule',
        description: error.message || 'An error occurred',
        variant: 'destructive',
      });
    }
  });
  
  // Update an existing schedule
  const updateScheduleMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertSchedule> }) => {
      const response = await apiRequest('PUT', `/api/schedules/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Schedule updated',
        description: 'Your schedule has been successfully updated',
      });
      
      // Invalidate all schedule queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/schedules'] });
      queryClient.invalidateQueries({ queryKey: ['/api/schedules/today'] });
      queryClient.invalidateQueries({ queryKey: ['/api/schedules/tomorrow'] });
      queryClient.invalidateQueries({ queryKey: ['/api/schedules/upcoming'] });
    },
    onError: (error) => {
      toast({
        title: 'Failed to update schedule',
        description: error.message || 'An error occurred',
        variant: 'destructive',
      });
    }
  });
  
  // Delete a schedule
  const deleteScheduleMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/schedules/${id}`);
      return id;
    },
    onSuccess: () => {
      toast({
        title: 'Schedule deleted',
        description: 'Your schedule has been successfully deleted',
      });
      
      // Invalidate all schedule queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/schedules'] });
      queryClient.invalidateQueries({ queryKey: ['/api/schedules/today'] });
      queryClient.invalidateQueries({ queryKey: ['/api/schedules/tomorrow'] });
      queryClient.invalidateQueries({ queryKey: ['/api/schedules/upcoming'] });
    },
    onError: (error) => {
      toast({
        title: 'Failed to delete schedule',
        description: error.message || 'An error occurred',
        variant: 'destructive',
      });
    }
  });
  
  // Helper function to add a schedule
  const addSchedule = async (schedule: Omit<InsertSchedule, 'id'>) => {
    return addScheduleMutation.mutateAsync(schedule);
  };
  
  // Helper function to update a schedule
  const updateSchedule = async (id: number, data: Partial<InsertSchedule>) => {
    return updateScheduleMutation.mutateAsync({ id, data });
  };
  
  // Helper function to delete a schedule
  const deleteSchedule = async (id: number) => {
    return deleteScheduleMutation.mutateAsync(id);
  };
  
  return {
    allSchedules,
    todaySchedules,
    tomorrowSchedules,
    upcomingSchedules,
    isLoading,
    isError,
    addSchedule,
    updateSchedule,
    deleteSchedule,
    isPending: addScheduleMutation.isPending || updateScheduleMutation.isPending || deleteScheduleMutation.isPending
  };
}
