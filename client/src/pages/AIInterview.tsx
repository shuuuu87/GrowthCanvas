import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Brain, ArrowRight, ArrowLeft, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { format, parseISO } from 'date-fns';

const questions = [
  {
    id: 1,
    question: "Do you stick to your goals every day?",
    options: [
      { value: "very-consistent", label: "Yes - I work on my goals every day" },
      { value: "mostly-consistent", label: "Most of the time - I follow my plans usually" },
      { value: "somewhat-consistent", label: "Sometimes - I find it hard sometimes" },
      { value: "inconsistent", label: "Not really - I often lose interest" }
    ]
  },
  {
    id: 2,
    question: "What do you do when things don't go as planned?",
    options: [
      { value: "learn-adapt", label: "I learn from mistakes and try a new way" },
      { value: "persistent", label: "I keep trying the same way" },
      { value: "discouraged", label: "I feel sad but then try again later" },
      { value: "give-up", label: "I usually stop and try something else" }
    ]
  },
  {
    id: 3,
    question: "How often do you think about how you're doing?",
    options: [
      { value: "daily", label: "Every day - I check how I'm doing daily" },
      { value: "weekly", label: "Once a week - I think about it weekly" },
      { value: "monthly", label: "Once a month - I review monthly" },
      { value: "rarely", label: "Not often - I don't have a regular time" }
    ]
  },
  {
    id: 4,
    question: "What makes you want to improve yourself?",
    options: [
      { value: "intrinsic", label: "Feeling good about myself inside" },
      { value: "achievement", label: "Reaching goals I set for myself" },
      { value: "social", label: "Getting praise from other people" },
      { value: "future", label: "Making life better for me and others" }
    ]
  },
  {
    id: 5,
    question: "Do you have enough time for work, friends, health, and fun?",
    options: [
      { value: "excellent", label: "Yes - I have good balance in all areas" },
      { value: "good", label: "Mostly - Most things are balanced well" },
      { value: "struggling", label: "No - Some things take too much time" },
      { value: "poor", label: "No - I spend too much time on one thing" }
    ]
  }
];

const AIInterview = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [selectedOption, setSelectedOption] = useState('');
  const [isStarted, setIsStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const { data: latestAssessment } = useQuery({
    queryKey: ['/api/ai-assessments/latest'],
  });

  const { data: allAssessments } = useQuery({
    queryKey: ['/api/ai-assessments'],
  });

  const createAssessmentMutation = useMutation({
    mutationFn: (data: { responses: Record<string, string> }) => 
      apiRequest('POST', '/api/ai-assessments', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai-assessments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/ai-assessments/latest'] });
      setIsCompleted(true);
      toast({
        title: 'Assessment Complete!',
        description: 'Your personal growth assessment has been generated.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to complete assessment',
        variant: 'destructive',
      });
    },
  });

  const handleStart = () => {
    setIsStarted(true);
    setCurrentQuestion(0);
    setResponses({});
    setSelectedOption('');
    setIsCompleted(false);
  };

  const handleOptionSelect = (value: string) => {
    setSelectedOption(value);
  };

  const handleNext = () => {
    if (!selectedOption) return;

    const questionKey = `Question ${currentQuestion + 1}`;
    const selectedOptionLabel = questions[currentQuestion].options.find(
      opt => opt.value === selectedOption
    )?.label || selectedOption;

    const newResponses = {
      ...responses,
      [questionKey]: selectedOptionLabel
    };
    setResponses(newResponses);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption('');
    } else {
      // Complete the assessment
      createAssessmentMutation.mutate({ responses: newResponses });
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      const prevQuestionKey = `Question ${currentQuestion}`;
      const prevResponse = responses[prevQuestionKey];
      const prevOption = questions[currentQuestion - 1].options.find(
        opt => opt.label === prevResponse
      )?.value || '';
      setSelectedOption(prevOption);
    }
  };

  const progress = isCompleted ? 100 : ((currentQuestion + (selectedOption ? 1 : 0)) / questions.length) * 100;

  if (!isStarted) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">AI Personal Growth Assessment</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Start Assessment Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <Brain className="text-primary" size={24} />
                <span>5-Minute Growth Assessment</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted rounded-lg p-6 space-y-4">
                <div className="flex items-center space-x-3">
                  <Clock className="text-chart-1" size={20} />
                  <span className="font-medium text-card-foreground">Quick & Insightful</span>
                </div>
                <p className="text-muted-foreground">
                  Take a brief 5-question assessment to get personalized insights about your growth journey.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-card-foreground">What you'll get:</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="text-chart-2" size={16} />
                    <span className="text-sm text-muted-foreground">Personalized growth score (0-100)</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="text-chart-2" size={16} />
                    <span className="text-sm text-muted-foreground">AI-powered recommendations</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="text-chart-2" size={16} />
                    <span className="text-sm text-muted-foreground">Progress tracking over time</span>
                  </div>
                </div>
              </div>

              <Button 
                className="w-full" 
                onClick={handleStart}
                data-testid="button-start-assessment"
              >
                <Brain className="mr-2" size={16} />
                Start Assessment
              </Button>
            </CardContent>
          </Card>

          {/* Latest Results Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <TrendingUp className="text-chart-4" size={24} />
                <span>Your Latest Results</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {latestAssessment ? (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-chart-4 mb-2">
                      {latestAssessment.growthScore}
                    </div>
                    <p className="text-muted-foreground">Growth Score</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(parseISO(latestAssessment.createdAt), 'MMM d, yyyy')}
                    </p>
                  </div>

                  <Progress value={latestAssessment.growthScore} className="h-3" />

                  <div className="bg-muted rounded-lg p-4">
                    <h4 className="font-medium text-card-foreground mb-2">AI Recommendations</h4>
                    <p className="text-sm text-muted-foreground line-clamp-4">
                      {latestAssessment.recommendations}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Brain className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Take your first assessment to see your growth insights here
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Assessment History */}
        {allAssessments && allAssessments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Assessment History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {allAssessments.slice(0, 5).map((assessment: any) => (
                  <div
                    key={assessment.id}
                    className="flex items-center justify-between p-4 bg-muted rounded-lg"
                    data-testid={`assessment-${assessment.id}`}
                  >
                    <div>
                      <div className="flex items-center space-x-3">
                        <div className="text-lg font-semibold text-card-foreground">
                          Score: {assessment.growthScore}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {format(parseISO(assessment.createdAt), 'MMM d, yyyy')}
                        </div>
                      </div>
                    </div>
                    <Progress value={assessment.growthScore} className="w-24 h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-chart-2 mb-4" />
          <h1 className="text-3xl font-bold text-foreground mb-2">Assessment Complete!</h1>
          <p className="text-muted-foreground">
            Your personal growth assessment has been generated and saved.
          </p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8 text-center space-y-6">
            <div>
              <div className="text-5xl font-bold text-chart-4 mb-2">
                {latestAssessment?.growthScore || 'Processing...'}
              </div>
              <p className="text-muted-foreground">Your Growth Score</p>
            </div>

            {latestAssessment && (
              <>
                <Progress value={latestAssessment.growthScore} className="h-4" />

                <div className="bg-muted rounded-lg p-6 text-left">
                  <h3 className="font-semibold text-card-foreground mb-3">AI Recommendations</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {latestAssessment.recommendations}
                  </p>
                </div>
              </>
            )}

            <div className="flex space-x-4 justify-center">
              <Button 
                onClick={() => setIsStarted(false)} 
                variant="outline"
                data-testid="button-view-results"
              >
                View All Results
              </Button>
              <Button 
                onClick={handleStart}
                data-testid="button-retake-assessment"
              >
                Take Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">AI Assessment</h1>
        <div className="text-sm text-muted-foreground">
          Question {currentQuestion + 1} of {questions.length}
        </div>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="space-y-4">
            <Progress value={progress} className="h-2" />
            <CardTitle className="text-xl">
              {questions[currentQuestion].question}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            {questions[currentQuestion].options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleOptionSelect(option.value)}
                className={`
                  w-full text-left p-4 rounded-lg transition-colors border
                  ${selectedOption === option.value 
                    ? 'bg-primary text-primary-foreground border-primary' 
                    : 'bg-accent hover:bg-primary hover:text-primary-foreground border-border'
                  }
                `}
                data-testid={`option-${option.value}`}
              >
                <div className="flex items-center space-x-3">
                  <CheckCircle 
                    className={selectedOption === option.value ? 'text-primary-foreground' : 'text-muted-foreground'}
                    size={16} 
                  />
                  <span className="font-medium">{option.label}</span>
                </div>
              </button>
            ))}
          </div>

          <div className="flex justify-between items-center pt-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              data-testid="button-previous"
            >
              <ArrowLeft className="mr-2" size={16} />
              Previous
            </Button>

            <Button
              onClick={handleNext}
              disabled={!selectedOption || createAssessmentMutation.isPending}
              data-testid="button-next"
            >
              {currentQuestion === questions.length - 1 ? (
                createAssessmentMutation.isPending ? (
                  'Generating Results...'
                ) : (
                  'Complete Assessment'
                )
              ) : (
                <>
                  Next
                  <ArrowRight className="ml-2" size={16} />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIInterview;
