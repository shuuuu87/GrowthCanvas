import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar as CalendarIcon, Plus, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';
import { getCurrentIST, formatDateTimeForInput, formatDateForDisplay, formatTimeForDisplay, isSameDayIST } from '@/lib/timeUtils';

const Calendar = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState(getCurrentIST());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);

  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    category: ''
  });

  const { data: events, isLoading } = useQuery({
    queryKey: ['/api/calendar'],
  });

  const createEventMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/calendar', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/calendar'] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: 'Success',
        description: 'Event created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => apiRequest('PUT', `/api/calendar/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/calendar'] });
      setIsDialogOpen(false);
      setEditingEvent(null);
      resetForm();
      toast({
        title: 'Success',
        description: 'Event updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/calendar/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/calendar'] });
      toast({
        title: 'Success',
        description: 'Event deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setEventForm({
      title: '',
      description: '',
      startTime: '',
      endTime: '',
      category: ''
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const eventData = {
      ...eventForm,
      startTime: new Date(eventForm.startTime).toISOString(),
      endTime: new Date(eventForm.endTime).toISOString(),
    };

    if (editingEvent) {
      updateEventMutation.mutate({ id: editingEvent.id, ...eventData });
    } else {
      createEventMutation.mutate(eventData);
    }
  };

  const handleEdit = (event: any) => {
    setEditingEvent(event);
    setEventForm({
      title: event.title,
      description: event.description || '',
      startTime: formatDateTimeForInput(event.startTime),
      endTime: formatDateTimeForInput(event.endTime),
      category: event.category || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      deleteEventMutation.mutate(id);
    }
  };

  // Generate calendar days
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get events for selected date (using IST)
  const selectedDateEvents = events?.filter((event: any) => 
    isSameDayIST(event.startTime, selectedDate)
  ) || [];

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Calendar</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-new-event">
              <Plus className="mr-2" size={16} />
              New Event
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingEvent ? 'Edit Event' : 'Create New Event'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  required
                  data-testid="input-event-title"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={eventForm.description}
                  onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                  data-testid="textarea-event-description"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="datetime-local"
                    value={eventForm.startTime}
                    onChange={(e) => setEventForm({ ...eventForm, startTime: e.target.value })}
                    required
                    data-testid="input-start-time"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="datetime-local"
                    value={eventForm.endTime}
                    onChange={(e) => setEventForm({ ...eventForm, endTime: e.target.value })}
                    required
                    data-testid="input-end-time"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={eventForm.category}
                  onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}
                  placeholder="e.g., Study, Personal, Work"
                  data-testid="input-event-category"
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsDialogOpen(false);
                    setEditingEvent(null);
                    resetForm();
                  }}
                  data-testid="button-cancel-event"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createEventMutation.isPending || updateEventMutation.isPending}
                  data-testid="button-save-event"
                >
                  {editingEvent ? 'Update Event' : 'Create Event'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <CalendarIcon size={20} />
                  <span>{format(selectedDate, 'MMMM yyyy')}</span>
                </CardTitle>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1))}
                    data-testid="button-prev-month"
                  >
                    ←
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedDate(new Date())}
                    data-testid="button-today"
                  >
                    Today
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1))}
                    data-testid="button-next-month"
                  >
                    →
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 text-center text-sm mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="p-2 text-muted-foreground font-medium">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {days.map(day => {
                  const dayEvents = events?.filter((event: any) => 
                    isSameDayIST(event.startTime, day)
                  ) || [];
                  const isSelected = isSameDay(day, selectedDate);
                  const isToday = isSameDay(day, new Date());
                  
                  return (
                    <button
                      key={day.toString()}
                      onClick={() => setSelectedDate(day)}
                      className={`
                        p-2 text-sm rounded transition-colors relative
                        ${isSelected ? 'bg-primary text-primary-foreground' : ''}
                        ${isToday && !isSelected ? 'bg-accent text-accent-foreground' : ''}
                        ${!isSelected && !isToday ? 'hover:bg-muted' : ''}
                      `}
                      data-testid={`calendar-day-${format(day, 'yyyy-MM-dd')}`}
                    >
                      {format(day, 'd')}
                      {dayEvents.length > 0 && (
                        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                          <div className="w-1 h-1 bg-chart-1 rounded-full"></div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Selected Date Events */}
        <Card>
          <CardHeader>
            <CardTitle>
              Events for {formatDateForDisplay(selectedDate)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDateEvents.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No events scheduled for this day
              </p>
            ) : (
              <div className="space-y-3">
                {selectedDateEvents.map((event: any) => (
                  <div
                    key={event.id}
                    className="bg-muted rounded-lg p-3"
                    data-testid={`event-${event.id}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-card-foreground">{event.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatTimeForDisplay(event.startTime)} - {formatTimeForDisplay(event.endTime)}
                        </p>
                        {event.description && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {event.description}
                          </p>
                        )}
                        {event.category && (
                          <span className="inline-block bg-primary text-primary-foreground px-2 py-1 rounded text-xs mt-2">
                            {event.category}
                          </span>
                        )}
                      </div>
                      <div className="flex space-x-1 ml-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(event)}
                          data-testid={`button-edit-event-${event.id}`}
                        >
                          <Edit size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(event.id)}
                          data-testid={`button-delete-event-${event.id}`}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Calendar;
