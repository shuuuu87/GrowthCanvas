import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { GraduationCap, Plus, Edit, Trash2, Calendar, Clock, BookOpen, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { format, parseISO, subDays, isAfter } from 'date-fns';
import { formatDateForInput, formatDateForDisplay, getCurrentIST } from '@/lib/timeUtils';
import { Progress } from '@/components/ui/progress';

const StudyTracker = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<any>(null);

  const [sessionForm, setSessionForm] = useState({
    subject: '',
    topic: '',
    duration: '',
    notes: '',
    date: new Date().toISOString().split('T')[0]
  });

  const { data: sessions, isLoading } = useQuery({
    queryKey: ['/api/study-sessions'],
  });

  const createSessionMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/study-sessions', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/study-sessions'] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: 'Success',
        description: 'Study session logged successfully',
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

  const updateSessionMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => apiRequest('PUT', `/api/study-sessions/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/study-sessions'] });
      setIsDialogOpen(false);
      setEditingSession(null);
      resetForm();
      toast({
        title: 'Success',
        description: 'Study session updated successfully',
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

  const deleteSessionMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/study-sessions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/study-sessions'] });
      toast({
        title: 'Success',
        description: 'Study session deleted successfully',
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
    setSessionForm({
      subject: '',
      topic: '',
      duration: '',
      notes: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const sessionData = {
      ...sessionForm,
      duration: parseInt(sessionForm.duration),
      date: new Date(sessionForm.date).toISOString(),
    };

    if (editingSession) {
      updateSessionMutation.mutate({ id: editingSession.id, ...sessionData });
    } else {
      createSessionMutation.mutate(sessionData);
    }
  };

  const handleEdit = (session: any) => {
    setEditingSession(session);
    setSessionForm({
      subject: session.subject,
      topic: session.topic,
      duration: session.duration.toString(),
      notes: session.notes || '',
      date: format(parseISO(session.date), 'yyyy-MM-dd')
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this study session?')) {
      deleteSessionMutation.mutate(id);
    }
  };

  // Analytics calculations
  const totalSessions = sessions?.length || 0;
  const totalHours = sessions?.reduce((total: number, session: any) => total + (session.duration / 60), 0) || 0;
  
  const weekAgo = subDays(new Date(), 7);
  const thisWeekSessions = sessions?.filter((session: any) => 
    isAfter(parseISO(session.date), weekAgo)
  ) || [];
  const thisWeekHours = thisWeekSessions.reduce((total: number, session: any) => total + (session.duration / 60), 0) || 0;

  const subjects = sessions?.reduce((acc: Record<string, any>, session: any) => {
    if (!acc[session.subject]) {
      acc[session.subject] = { sessions: 0, minutes: 0, topics: new Set() };
    }
    acc[session.subject].sessions += 1;
    acc[session.subject].minutes += session.duration;
    acc[session.subject].topics.add(session.topic);
    return acc;
  }, {}) || {};

  const subjectColors = ['chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5'];

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Study Tracker</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-new-session">
              <Plus className="mr-2" size={16} />
              Log Session
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingSession ? 'Edit Study Session' : 'Log New Study Session'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={sessionForm.subject}
                    onChange={(e) => setSessionForm({ ...sessionForm, subject: e.target.value })}
                    placeholder="e.g., Mathematics, Programming"
                    required
                    data-testid="input-subject"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="topic">Topic</Label>
                  <Input
                    id="topic"
                    value={sessionForm.topic}
                    onChange={(e) => setSessionForm({ ...sessionForm, topic: e.target.value })}
                    placeholder="e.g., Calculus, React Hooks"
                    required
                    data-testid="input-topic"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    value={sessionForm.duration}
                    onChange={(e) => setSessionForm({ ...sessionForm, duration: e.target.value })}
                    placeholder="60"
                    required
                    data-testid="input-duration"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={sessionForm.date}
                    onChange={(e) => setSessionForm({ ...sessionForm, date: e.target.value })}
                    required
                    data-testid="input-session-date"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  value={sessionForm.notes}
                  onChange={(e) => setSessionForm({ ...sessionForm, notes: e.target.value })}
                  placeholder="What did you learn? Any challenges or insights?"
                  className="min-h-[100px]"
                  data-testid="textarea-session-notes"
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsDialogOpen(false);
                    setEditingSession(null);
                    resetForm();
                  }}
                  data-testid="button-cancel-session"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createSessionMutation.isPending || updateSessionMutation.isPending}
                  data-testid="button-save-session"
                >
                  {editingSession ? 'Update Session' : 'Log Session'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total Sessions</p>
                <p className="text-2xl font-bold text-card-foreground" data-testid="total-sessions">
                  {totalSessions}
                </p>
              </div>
              <BookOpen className="text-chart-1" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total Hours</p>
                <p className="text-2xl font-bold text-card-foreground" data-testid="total-hours">
                  {totalHours.toFixed(1)}
                </p>
              </div>
              <Clock className="text-chart-2" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">This Week</p>
                <p className="text-2xl font-bold text-card-foreground" data-testid="week-hours">
                  {thisWeekHours.toFixed(1)}h
                </p>
              </div>
              <BarChart3 className="text-chart-3" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Subjects</p>
                <p className="text-2xl font-bold text-card-foreground" data-testid="total-subjects">
                  {Object.keys(subjects).length}
                </p>
              </div>
              <GraduationCap className="text-chart-4" size={24} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subject Progress */}
      {Object.keys(subjects).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Subject Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {Object.entries(subjects).map(([subject, data]: [string, any], index) => (
              <div key={subject} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full bg-${subjectColors[index % subjectColors.length]}`}></div>
                    <span className="font-medium text-card-foreground">{subject}</span>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <div>{data.topics.size} topics • {(data.minutes / 60).toFixed(1)} hours</div>
                    <div>{data.sessions} sessions</div>
                  </div>
                </div>
                <Progress value={Math.min((data.minutes / 1200) * 100, 100)} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recent Sessions */}
      {sessions?.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No study sessions yet</h3>
            <p className="text-muted-foreground mb-4">
              Start tracking your learning progress by logging your first study session
            </p>
            <Button onClick={() => setIsDialogOpen(true)} data-testid="button-first-session">
              <Plus className="mr-2" size={16} />
              Log First Session
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Recent Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sessions?.slice(0, 10).map((session: any) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 bg-muted rounded-lg"
                  data-testid={`session-${session.id}`}
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-chart-1 bg-opacity-20 rounded-lg flex items-center justify-center">
                        <BookOpen className="text-chart-1" size={16} />
                      </div>
                      <div>
                        <h4 className="font-medium text-card-foreground">
                          {session.subject} - {session.topic}
                        </h4>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                          <div className="flex items-center space-x-1">
                            <Calendar size={12} />
                            <span>{format(parseISO(session.date), 'MMM d, yyyy')}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock size={12} />
                            <span>{session.duration} min</span>
                          </div>
                        </div>
                        {session.notes && (
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {session.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(session)}
                      data-testid={`button-edit-session-${session.id}`}
                    >
                      <Edit size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(session.id)}
                      data-testid={`button-delete-session-${session.id}`}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StudyTracker;
