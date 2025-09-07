import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Trophy, Plus, Edit, Trash2, Calendar, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { format, parseISO } from 'date-fns';
import { formatDateForInput, formatDateForDisplay, getCurrentIST } from '@/lib/timeUtils';

const Achievements = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<any>(null);

  const [achievementForm, setAchievementForm] = useState({
    title: '',
    description: '',
    category: '',
    date: formatDateForInput(getCurrentIST())
  });

  const { data: achievements, isLoading } = useQuery({
    queryKey: ['/api/achievements'],
  });

  const createAchievementMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/achievements', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/achievements'] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: 'Success',
        description: 'Achievement recorded successfully',
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

  const updateAchievementMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => apiRequest('PUT', `/api/achievements/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/achievements'] });
      setIsDialogOpen(false);
      setEditingAchievement(null);
      resetForm();
      toast({
        title: 'Success',
        description: 'Achievement updated successfully',
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

  const deleteAchievementMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/achievements/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/achievements'] });
      toast({
        title: 'Success',
        description: 'Achievement deleted successfully',
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
    setAchievementForm({
      title: '',
      description: '',
      category: '',
      date: formatDateForInput(getCurrentIST())
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const achievementData = {
      ...achievementForm,
      date: new Date(achievementForm.date).toISOString(),
    };

    if (editingAchievement) {
      updateAchievementMutation.mutate({ id: editingAchievement.id, ...achievementData });
    } else {
      createAchievementMutation.mutate(achievementData);
    }
  };

  const handleEdit = (achievement: any) => {
    setEditingAchievement(achievement);
    setAchievementForm({
      title: achievement.title,
      description: achievement.description,
      category: achievement.category || '',
      date: formatDateForInput(achievement.date)
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this achievement?')) {
      deleteAchievementMutation.mutate(id);
    }
  };

  const categoryColors: Record<string, string> = {
    'personal': 'bg-chart-1 text-white',
    'professional': 'bg-chart-2 text-white',
    'academic': 'bg-chart-3 text-white',
    'fitness': 'bg-chart-4 text-white',
    'creative': 'bg-chart-5 text-white',
    'default': 'bg-primary text-primary-foreground'
  };

  const getCategoryColor = (category: string) => {
    const normalizedCategory = category?.toLowerCase() || '';
    return categoryColors[normalizedCategory] || categoryColors['default'];
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
        <h1 className="text-3xl font-bold text-foreground">Achievements</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-new-achievement">
              <Plus className="mr-2" size={16} />
              Add Achievement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingAchievement ? 'Edit Achievement' : 'Add New Achievement'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={achievementForm.title}
                  onChange={(e) => setAchievementForm({ ...achievementForm, title: e.target.value })}
                  placeholder="What did you accomplish?"
                  required
                  data-testid="input-achievement-title"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={achievementForm.date}
                    onChange={(e) => setAchievementForm({ ...achievementForm, date: e.target.value })}
                    required
                    data-testid="input-achievement-date"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={achievementForm.category}
                    onChange={(e) => setAchievementForm({ ...achievementForm, category: e.target.value })}
                    placeholder="e.g., Personal, Professional, Academic"
                    data-testid="input-achievement-category"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={achievementForm.description}
                  onChange={(e) => setAchievementForm({ ...achievementForm, description: e.target.value })}
                  placeholder="Describe your achievement and why it's meaningful to you..."
                  className="min-h-[120px]"
                  required
                  data-testid="textarea-achievement-description"
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsDialogOpen(false);
                    setEditingAchievement(null);
                    resetForm();
                  }}
                  data-testid="button-cancel-achievement"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createAchievementMutation.isPending || updateAchievementMutation.isPending}
                  data-testid="button-save-achievement"
                >
                  {editingAchievement ? 'Update Achievement' : 'Add Achievement'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {achievements?.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Trophy className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No achievements yet</h3>
            <p className="text-muted-foreground mb-4">
              Start celebrating your wins, big and small
            </p>
            <Button onClick={() => setIsDialogOpen(true)} data-testid="button-first-achievement">
              <Plus className="mr-2" size={16} />
              Add First Achievement
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {achievements?.map((achievement: any) => (
            <Card key={achievement.id} className="card-hover" data-testid={`achievement-${achievement.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="w-12 h-12 bg-chart-3 bg-opacity-20 rounded-lg flex items-center justify-center">
                      <Trophy className="text-chart-3" size={20} />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{achievement.title}</CardTitle>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Calendar size={14} />
                          <span>{formatDateForDisplay(achievement.date)}</span>
                        </div>
                        {achievement.category && (
                          <span className={`px-2 py-1 rounded text-xs ${getCategoryColor(achievement.category)}`}>
                            {achievement.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(achievement)}
                      data-testid={`button-edit-achievement-${achievement.id}`}
                    >
                      <Edit size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(achievement.id)}
                      data-testid={`button-delete-achievement-${achievement.id}`}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-card-foreground whitespace-pre-wrap">{achievement.description}</p>
                <div className="flex items-center mt-4 text-sm text-muted-foreground">
                  <Star className="text-chart-3 mr-1" size={14} />
                  <span>Achievement unlocked!</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Achievements;
