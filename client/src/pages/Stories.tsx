import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PenTool, Plus, Edit, Trash2, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { format, parseISO } from 'date-fns';

const Stories = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<any>(null);

  const [storyForm, setStoryForm] = useState({
    title: '',
    content: '',
    category: ''
  });

  const { data: stories, isLoading } = useQuery({
    queryKey: ['/api/stories'],
  });

  const createStoryMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/stories', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/stories'] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: 'Success',
        description: 'Story created successfully',
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

  const updateStoryMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => apiRequest('PUT', `/api/stories/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/stories'] });
      setIsDialogOpen(false);
      setEditingStory(null);
      resetForm();
      toast({
        title: 'Success',
        description: 'Story updated successfully',
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

  const deleteStoryMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/stories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/stories'] });
      toast({
        title: 'Success',
        description: 'Story deleted successfully',
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
    setStoryForm({
      title: '',
      content: '',
      category: ''
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingStory) {
      updateStoryMutation.mutate({ id: editingStory.id, ...storyForm });
    } else {
      createStoryMutation.mutate(storyForm);
    }
  };

  const handleEdit = (story: any) => {
    setEditingStory(story);
    setStoryForm({
      title: story.title,
      content: story.content,
      category: story.category || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this story?')) {
      deleteStoryMutation.mutate(id);
    }
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
        <h1 className="text-3xl font-bold text-foreground">Stories</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-new-story">
              <Plus className="mr-2" size={16} />
              New Story
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingStory ? 'Edit Story' : 'Create New Story'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={storyForm.title}
                  onChange={(e) => setStoryForm({ ...storyForm, title: e.target.value })}
                  placeholder="What's your story about?"
                  required
                  data-testid="input-story-title"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={storyForm.category}
                  onChange={(e) => setStoryForm({ ...storyForm, category: e.target.value })}
                  placeholder="e.g., Personal Growth, Travel, Career"
                  data-testid="input-story-category"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={storyForm.content}
                  onChange={(e) => setStoryForm({ ...storyForm, content: e.target.value })}
                  placeholder="Tell your story..."
                  className="min-h-[300px]"
                  required
                  data-testid="textarea-story-content"
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsDialogOpen(false);
                    setEditingStory(null);
                    resetForm();
                  }}
                  data-testid="button-cancel-story"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createStoryMutation.isPending || updateStoryMutation.isPending}
                  data-testid="button-save-story"
                >
                  {editingStory ? 'Update Story' : 'Create Story'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {stories?.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <PenTool className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No stories yet</h3>
            <p className="text-muted-foreground mb-4">
              Start documenting your personal journey and experiences
            </p>
            <Button onClick={() => setIsDialogOpen(true)} data-testid="button-first-story">
              <Plus className="mr-2" size={16} />
              Write First Story
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {stories?.map((story: any) => (
            <Card key={story.id} className="card-hover" data-testid={`story-${story.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl mb-2">{story.title}</CardTitle>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Calendar size={14} />
                        <span>{format(parseISO(story.createdAt), 'MMM d, yyyy')}</span>
                      </div>
                      {story.category && (
                        <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs">
                          {story.category}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(story)}
                      data-testid={`button-edit-story-${story.id}`}
                    >
                      <Edit size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(story.id)}
                      data-testid={`button-delete-story-${story.id}`}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-card-foreground whitespace-pre-wrap line-clamp-6">
                  {story.content}
                </p>
                {story.content.length > 300 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(story)}
                    className="mt-2 p-0 h-auto text-primary hover:text-primary/80"
                  >
                    Read more...
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Stories;
