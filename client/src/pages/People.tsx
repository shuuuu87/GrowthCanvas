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
import { Users, Plus, Edit, Trash2, Heart, Frown, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { format, parseISO } from 'date-fns';
import { formatDateForDisplay } from '@/lib/timeUtils';

const People = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<any>(null);

  const [personForm, setPersonForm] = useState({
    name: '',
    relationship: '',
    sentiment: '',
    description: '',
    notes: ''
  });

  const { data: people, isLoading } = useQuery({
    queryKey: ['/api/people'],
  });

  const createPersonMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/people', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/people'] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: 'Success',
        description: 'Person added successfully',
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

  const updatePersonMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => apiRequest('PUT', `/api/people/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/people'] });
      setIsDialogOpen(false);
      setEditingPerson(null);
      resetForm();
      toast({
        title: 'Success',
        description: 'Person updated successfully',
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

  const deletePersonMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/people/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/people'] });
      toast({
        title: 'Success',
        description: 'Person removed successfully',
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
    setPersonForm({
      name: '',
      relationship: '',
      sentiment: '',
      description: '',
      notes: ''
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingPerson) {
      updatePersonMutation.mutate({ id: editingPerson.id, ...personForm });
    } else {
      createPersonMutation.mutate(personForm);
    }
  };

  const handleEdit = (person: any) => {
    setEditingPerson(person);
    setPersonForm({
      name: person.name,
      relationship: person.relationship,
      sentiment: person.sentiment,
      description: person.description || '',
      notes: person.notes || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this person?')) {
      deletePersonMutation.mutate(id);
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    return sentiment === 'positive' ? Heart : Frown;
  };

  const getSentimentColor = (sentiment: string) => {
    return sentiment === 'positive' ? 'text-chart-2' : 'text-chart-5';
  };

  const getSentimentBgColor = (sentiment: string) => {
    return sentiment === 'positive' ? 'bg-chart-2 bg-opacity-20' : 'bg-chart-5 bg-opacity-20';
  };

  // Separate people by sentiment
  const positivePeople = people?.filter((person: any) => person.sentiment === 'positive') || [];
  const negativePeople = people?.filter((person: any) => person.sentiment === 'negative') || [];

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
        <h1 className="text-3xl font-bold text-foreground">People</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-new-person">
              <Plus className="mr-2" size={16} />
              Add Person
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingPerson ? 'Edit Person' : 'Add New Person'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={personForm.name}
                  onChange={(e) => setPersonForm({ ...personForm, name: e.target.value })}
                  placeholder="Person's name"
                  required
                  data-testid="input-person-name"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="relationship">Relationship</Label>
                  <Input
                    id="relationship"
                    value={personForm.relationship}
                    onChange={(e) => setPersonForm({ ...personForm, relationship: e.target.value })}
                    placeholder="e.g., Friend, Colleague, Family"
                    required
                    data-testid="input-relationship"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sentiment">Sentiment</Label>
                  <Select
                    value={personForm.sentiment}
                    onValueChange={(value) => setPersonForm({ ...personForm, sentiment: value })}
                  >
                    <SelectTrigger data-testid="select-sentiment">
                      <SelectValue placeholder="How do you feel about them?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="positive">❤️ Positive / Love</SelectItem>
                      <SelectItem value="negative">😞 Negative / Dislike</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={personForm.description}
                  onChange={(e) => setPersonForm({ ...personForm, description: e.target.value })}
                  placeholder="Brief description of this person and your relationship..."
                  className="min-h-[100px]"
                  data-testid="textarea-person-description"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={personForm.notes}
                  onChange={(e) => setPersonForm({ ...personForm, notes: e.target.value })}
                  placeholder="Any additional notes, memories, or thoughts..."
                  className="min-h-[100px]"
                  data-testid="textarea-person-notes"
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsDialogOpen(false);
                    setEditingPerson(null);
                    resetForm();
                  }}
                  data-testid="button-cancel-person"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createPersonMutation.isPending || updatePersonMutation.isPending}
                  data-testid="button-save-person"
                >
                  {editingPerson ? 'Update Person' : 'Add Person'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {people?.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No people tracked yet</h3>
            <p className="text-muted-foreground mb-4">
              Start tracking your relationships and feelings about important people in your life
            </p>
            <Button onClick={() => setIsDialogOpen(true)} data-testid="button-first-person">
              <Plus className="mr-2" size={16} />
              Add First Person
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Positive Relationships */}
          {positivePeople.length > 0 && (
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <Heart className="text-chart-2" size={24} />
                <h2 className="text-xl font-semibold text-foreground">People I Love</h2>
                <span className="bg-chart-2 bg-opacity-20 text-chart-2 px-2 py-1 rounded text-sm">
                  {positivePeople.length}
                </span>
              </div>
              <div className="grid gap-4">
                {positivePeople.map((person: any) => (
                  <Card key={person.id} className="card-hover" data-testid={`person-${person.id}`}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getSentimentBgColor(person.sentiment)}`}>
                            <User className={getSentimentColor(person.sentiment)} size={20} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold text-card-foreground">{person.name}</h3>
                              {React.createElement(getSentimentIcon(person.sentiment), {
                                className: getSentimentColor(person.sentiment),
                                size: 16
                              })}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{person.relationship}</p>
                            {person.description && (
                              <p className="text-card-foreground whitespace-pre-wrap mb-2">
                                {person.description}
                              </p>
                            )}
                            {person.notes && (
                              <div className="bg-muted rounded-lg p-3 mt-3">
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                  {person.notes}
                                </p>
                              </div>
                            )}
                            <p className="text-xs text-muted-foreground mt-3">
                              Added {format(parseISO(person.createdAt), 'MMM d, yyyy')}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(person)}
                            data-testid={`button-edit-person-${person.id}`}
                          >
                            <Edit size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(person.id)}
                            data-testid={`button-delete-person-${person.id}`}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Negative Relationships */}
          {negativePeople.length > 0 && (
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <Frown className="text-chart-5" size={24} />
                <h2 className="text-xl font-semibold text-foreground">Challenging Relationships</h2>
                <span className="bg-chart-5 bg-opacity-20 text-chart-5 px-2 py-1 rounded text-sm">
                  {negativePeople.length}
                </span>
              </div>
              <div className="grid gap-4">
                {negativePeople.map((person: any) => (
                  <Card key={person.id} className="card-hover" data-testid={`person-${person.id}`}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getSentimentBgColor(person.sentiment)}`}>
                            <User className={getSentimentColor(person.sentiment)} size={20} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold text-card-foreground">{person.name}</h3>
                              {React.createElement(getSentimentIcon(person.sentiment), {
                                className: getSentimentColor(person.sentiment),
                                size: 16
                              })}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{person.relationship}</p>
                            {person.description && (
                              <p className="text-card-foreground whitespace-pre-wrap mb-2">
                                {person.description}
                              </p>
                            )}
                            {person.notes && (
                              <div className="bg-muted rounded-lg p-3 mt-3">
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                  {person.notes}
                                </p>
                              </div>
                            )}
                            <p className="text-xs text-muted-foreground mt-3">
                              Added {format(parseISO(person.createdAt), 'MMM d, yyyy')}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(person)}
                            data-testid={`button-edit-person-${person.id}`}
                          >
                            <Edit size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(person.id)}
                            data-testid={`button-delete-person-${person.id}`}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default People;
