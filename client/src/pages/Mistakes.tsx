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
import { AlertTriangle, Plus, Edit, Trash2, Calendar, Lightbulb } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { format, parseISO } from 'date-fns';
import { formatDateForInput, formatDateForDisplay, getCurrentIST } from '@/lib/timeUtils';

const Mistakes = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMistake, setEditingMistake] = useState<any>(null);

  const [mistakeForm, setMistakeForm] = useState({
    title: '',
    description: '',
    lesson: '',
    category: '',
    severity: '',
    date: formatDateForInput(getCurrentIST())
  });

  const { data: mistakes, isLoading } = useQuery({
    queryKey: ['/api/mistakes'],
  });

  const createMistakeMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/mistakes', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/mistakes'] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: 'Success',
        description: 'Mistake recorded successfully',
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

  const updateMistakeMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => apiRequest('PUT', `/api/mistakes/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/mistakes'] });
      setIsDialogOpen(false);
      setEditingMistake(null);
      resetForm();
      toast({
        title: 'Success',
        description: 'Mistake updated successfully',
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

  const deleteMistakeMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/mistakes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/mistakes'] });
      toast({
        title: 'Success',
        description: 'Mistake deleted successfully',
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
    setMistakeForm({
      title: '',
      description: '',
      lesson: '',
      category: '',
      severity: '',
      date: formatDateForInput(getCurrentIST())
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const mistakeData = {
      ...mistakeForm,
      date: new Date(mistakeForm.date).toISOString(),
    };

    if (editingMistake) {
      updateMistakeMutation.mutate({ id: editingMistake.id, ...mistakeData });
    } else {
      createMistakeMutation.mutate(mistakeData);
    }
  };

  const handleEdit = (mistake: any) => {
    setEditingMistake(mistake);
    setMistakeForm({
      title: mistake.title,
      description: mistake.description,
      lesson: mistake.lesson || '',
      category: mistake.category || '',
      severity: mistake.severity || '',
      date: formatDateForInput(mistake.date)
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this mistake record?')) {
      deleteMistakeMutation.mutate(id);
    }
  };

  const severityColors: Record<string, string> = {
    'low': 'bg-chart-2 text-white',
    'medium': 'bg-chart-3 text-white',
    'high': 'bg-destructive text-destructive-foreground'
  };

  const severityLabels: Record<string, string> = {
    'low': 'Low Impact',
    'medium': 'Medium Impact',
    'high': 'High Impact'
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
        <h1 className="text-3xl font-bold text-foreground">Mistakes</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-new-mistake">
              <Plus className="mr-2" size={16} />
              Record Mistake
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingMistake ? 'Edit Mistake' : 'Record New Mistake'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={mistakeForm.title}
                  onChange={(e) => setMistakeForm({ ...mistakeForm, title: e.target.value })}
                  placeholder="Brief description of the mistake"
                  required
                  data-testid="input-mistake-title"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={mistakeForm.date}
                    onChange={(e) => setMistakeForm({ ...mistakeForm, date: e.target.value })}
                    required
                    data-testid="input-mistake-date"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="severity">Severity</Label>
                  <Select
                    value={mistakeForm.severity}
                    onValueChange={(value) => setMistakeForm({ ...mistakeForm, severity: value })}
                  >
                    <SelectTrigger data-testid="select-severity">
                      <SelectValue placeholder="Select severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low Impact</SelectItem>
                      <SelectItem value="medium">Medium Impact</SelectItem>
                      <SelectItem value="high">High Impact</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={mistakeForm.category}
                  onChange={(e) => setMistakeForm({ ...mistakeForm, category: e.target.value })}
                  placeholder="e.g., Work, Personal, Financial"
                  data-testid="input-mistake-category"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={mistakeForm.description}
                  onChange={(e) => setMistakeForm({ ...mistakeForm, description: e.target.value })}
                  placeholder="What happened? Provide context..."
                  className="min-h-[100px]"
                  required
                  data-testid="textarea-mistake-description"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lesson">Lesson Learned</Label>
                <Textarea
                  id="lesson"
                  value={mistakeForm.lesson}
                  onChange={(e) => setMistakeForm({ ...mistakeForm, lesson: e.target.value })}
                  placeholder="What did you learn? How will you avoid this in the future?"
                  className="min-h-[100px]"
                  data-testid="textarea-mistake-lesson"
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsDialogOpen(false);
                    setEditingMistake(null);
                    resetForm();
                  }}
                  data-testid="button-cancel-mistake"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createMistakeMutation.isPending || updateMistakeMutation.isPending}
                  data-testid="button-save-mistake"
                >
                  {editingMistake ? 'Update Mistake' : 'Record Mistake'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {mistakes?.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No mistakes recorded yet</h3>
            <p className="text-muted-foreground mb-4">
              Transform your setbacks into comebacks by documenting and learning from mistakes
            </p>
            <Button onClick={() => setIsDialogOpen(true)} data-testid="button-first-mistake">
              <Plus className="mr-2" size={16} />
              Record First Mistake
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {mistakes?.map((mistake: any) => (
            <Card key={mistake.id} className="card-hover" data-testid={`mistake-${mistake.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{mistake.title}</CardTitle>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                      <div className="flex items-center space-x-1">
                        <Calendar size={14} />
                        <span>{formatDateForDisplay(mistake.date)}</span>
                      </div>
                      {mistake.category && (
                        <span className="bg-muted text-muted-foreground px-2 py-1 rounded text-xs">
                          {mistake.category}
                        </span>
                      )}
                      {mistake.severity && (
                        <span className={`px-2 py-1 rounded text-xs ${severityColors[mistake.severity]}`}>
                          {severityLabels[mistake.severity]}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(mistake)}
                      data-testid={`button-edit-mistake-${mistake.id}`}
                    >
                      <Edit size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(mistake.id)}
                      data-testid={`button-delete-mistake-${mistake.id}`}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-card-foreground whitespace-pre-wrap mb-4">{mistake.description}</p>
                {mistake.lesson && (
                  <div className="bg-muted rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <Lightbulb className="text-chart-3 mt-0.5" size={16} />
                      <div>
                        <h5 className="font-medium text-card-foreground mb-1">Lesson Learned</h5>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {mistake.lesson}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Mistakes;
