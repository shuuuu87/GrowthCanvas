import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BookOpen, Plus, Edit, Trash2, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { format, parseISO } from 'date-fns';
import { formatDateForInput, formatDateForDisplay, getCurrentIST } from '@/lib/timeUtils';

const Diary = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<any>(null);

  const [entryForm, setEntryForm] = useState({
    title: '',
    content: '',
    mood: '',
    date: formatDateForInput(getCurrentIST())
  });

  const { data: entries, isLoading } = useQuery({
    queryKey: ['/api/diary'],
  });

  const createEntryMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/diary', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/diary'] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: 'Success',
        description: 'Diary entry created successfully',
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

  const updateEntryMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => apiRequest('PUT', `/api/diary/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/diary'] });
      setIsDialogOpen(false);
      setEditingEntry(null);
      resetForm();
      toast({
        title: 'Success',
        description: 'Diary entry updated successfully',
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

  const deleteEntryMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/diary/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/diary'] });
      toast({
        title: 'Success',
        description: 'Diary entry deleted successfully',
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
    setEntryForm({
      title: '',
      content: '',
      mood: '',
      date: formatDateForInput(getCurrentIST())
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const entryData = {
      ...entryForm,
      date: new Date(entryForm.date),
    };

    if (editingEntry) {
      updateEntryMutation.mutate({ id: editingEntry.id, ...entryData });
    } else {
      createEntryMutation.mutate(entryData);
    }
  };

  const handleEdit = (entry: any) => {
    setEditingEntry(entry);
    setEntryForm({
      title: entry.title,
      content: entry.content,
      mood: entry.mood || '',
      date: formatDateForInput(entry.date)
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this diary entry?')) {
      deleteEntryMutation.mutate(id);
    }
  };

  const moodEmojis: Record<string, string> = {
    'happy': '😊',
    'sad': '😢',
    'excited': '🎉',
    'anxious': '😰',
    'peaceful': '😌',
    'frustrated': '😤',
    'grateful': '🙏',
    'motivated': '💪'
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid gap-4">
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
        <h1 className="text-3xl font-bold text-foreground">Diary</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-new-entry">
              <Plus className="mr-2" size={16} />
              New Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingEntry ? 'Edit Entry' : 'Create New Entry'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={entryForm.title}
                  onChange={(e) => setEntryForm({ ...entryForm, title: e.target.value })}
                  placeholder="What's on your mind today?"
                  required
                  data-testid="input-entry-title"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={entryForm.date}
                    onChange={(e) => setEntryForm({ ...entryForm, date: e.target.value })}
                    required
                    data-testid="input-entry-date"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="mood">Mood</Label>
                  <Select
                    value={entryForm.mood}
                    onValueChange={(value) => setEntryForm({ ...entryForm, mood: value })}
                  >
                    <SelectTrigger data-testid="select-mood">
                      <SelectValue placeholder="How are you feeling?" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(moodEmojis).map(([mood, emoji]) => (
                        <SelectItem key={mood} value={mood}>
                          {emoji} {mood.charAt(0).toUpperCase() + mood.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={entryForm.content}
                  onChange={(e) => setEntryForm({ ...entryForm, content: e.target.value })}
                  placeholder="Write about your day, thoughts, or feelings..."
                  className="min-h-[200px]"
                  required
                  data-testid="textarea-entry-content"
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsDialogOpen(false);
                    setEditingEntry(null);
                    resetForm();
                  }}
                  data-testid="button-cancel-entry"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createEntryMutation.isPending || updateEntryMutation.isPending}
                  data-testid="button-save-entry"
                >
                  {editingEntry ? 'Update Entry' : 'Create Entry'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {entries?.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No diary entries yet</h3>
            <p className="text-muted-foreground mb-4">
              Start your personal growth journey by writing your first entry
            </p>
            <Button onClick={() => setIsDialogOpen(true)} data-testid="button-first-entry">
              <Plus className="mr-2" size={16} />
              Write First Entry
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {entries?.map((entry: any) => (
            <Card key={entry.id} className="card-hover" data-testid={`entry-${entry.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl mb-2">{entry.title}</CardTitle>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Calendar size={14} />
                        <span>{formatDateForDisplay(entry.date)}</span>
                      </div>
                      {entry.mood && (
                        <div className="flex items-center space-x-1">
                          <span>{moodEmojis[entry.mood]}</span>
                          <span className="capitalize">{entry.mood}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(entry)}
                      data-testid={`button-edit-entry-${entry.id}`}
                    >
                      <Edit size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(entry.id)}
                      data-testid={`button-delete-entry-${entry.id}`}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-card-foreground whitespace-pre-wrap">{entry.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Diary;
