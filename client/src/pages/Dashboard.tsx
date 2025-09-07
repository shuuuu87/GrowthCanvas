import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Book, Trophy, ChartLine, Plus, BookOpen, GraduationCap, AlertTriangle, Brain } from 'lucide-react';
import { Link } from 'wouter';
import { Progress } from '@/components/ui/progress';
import { getCurrentIST, getCurrentDateFormatted, isSameDayIST } from '@/lib/timeUtils';

const Dashboard = () => {
  const { user } = useAuth();
  
  const { data: studySessions } = useQuery({
    queryKey: ['/api/study-sessions'],
  });

  const { data: diaryEntries } = useQuery({
    queryKey: ['/api/diary'],
  });

  const { data: achievements } = useQuery({
    queryKey: ['/api/achievements'],
  });

  const { data: latestAssessment } = useQuery({
    queryKey: ['/api/ai-assessments/latest'],
  });

  // Calculate stats (using IST)
  const todayStudyHours = studySessions?.filter((session: any) => {
    const today = getCurrentIST();
    return isSameDayIST(session.date, today);
  }).reduce((total: number, session: any) => total + (session.duration / 60), 0) || 0;

  const thisWeekEntries = diaryEntries?.filter((entry: any) => {
    const today = getCurrentIST();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const entryDate = new Date(entry.date);
    return entryDate >= weekAgo;
  }).length || 0;

  const thisMonthAchievements = achievements?.filter((achievement: any) => {
    const today = getCurrentIST();
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    const achievementDate = new Date(achievement.date);
    return achievementDate >= monthAgo;
  }).length || 0;

  const studySubjects = studySessions?.reduce((acc: Record<string, {total: number, completed: number}>, session: any) => {
    if (!acc[session.subject]) {
      acc[session.subject] = { total: 0, completed: 0 };
    }
    acc[session.subject].total += session.duration;
    acc[session.subject].completed += 1;
    return acc;
  }, {}) || {};

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground" data-testid="greeting">
            Good morning, {user?.firstName}!
          </h2>
          <p className="text-muted-foreground mt-1">
            Here's your personal growth overview for today
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/ai-interview">
            <Button data-testid="button-ai-assessment">
              <Brain className="mr-2" size={16} />
              Start AI Assessment
            </Button>
          </Link>
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Calendar size={16} />
            <span data-testid="current-date">
              {getCurrentDateFormatted()} (IST)
            </span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <section>
        <h3 className="text-lg font-semibold text-foreground mb-4">Today's Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Study Hours</p>
                  <p className="text-2xl font-bold text-card-foreground" data-testid="study-hours">
                    {todayStudyHours.toFixed(1)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-chart-1 bg-opacity-20 rounded-lg flex items-center justify-center">
                  <Clock className="text-chart-1" />
                </div>
              </div>
              <div className="mt-4">
                <Progress value={(todayStudyHours / 5) * 100} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {Math.round((todayStudyHours / 5) * 100)}% of daily goal
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Diary Entries</p>
                  <p className="text-2xl font-bold text-card-foreground" data-testid="diary-entries">
                    {thisWeekEntries}
                  </p>
                </div>
                <div className="w-12 h-12 bg-chart-2 bg-opacity-20 rounded-lg flex items-center justify-center">
                  <Book className="text-chart-2" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-xs text-muted-foreground">This week</p>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Achievements</p>
                  <p className="text-2xl font-bold text-card-foreground" data-testid="achievements">
                    {thisMonthAchievements}
                  </p>
                </div>
                <div className="w-12 h-12 bg-chart-3 bg-opacity-20 rounded-lg flex items-center justify-center">
                  <Trophy className="text-chart-3" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-xs text-muted-foreground">This month</p>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Growth Score</p>
                  <p className="text-2xl font-bold text-card-foreground" data-testid="growth-score">
                    {latestAssessment?.growthScore || 'N/A'}
                  </p>
                </div>
                <div className="w-12 h-12 bg-chart-4 bg-opacity-20 rounded-lg flex items-center justify-center">
                  <ChartLine className="text-chart-4" />
                </div>
              </div>
              <div className="mt-4">
                {latestAssessment?.growthScore && (
                  <>
                    <Progress value={latestAssessment.growthScore} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">AI Assessment</p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Study Progress */}
      {Object.keys(studySubjects).length > 0 && (
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Study Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(studySubjects).slice(0, 3).map(([subject, data]) => (
                  <div key={subject}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-card-foreground">{subject}</span>
                      <span className="text-sm text-muted-foreground">
                        {data.completed} sessions
                      </span>
                    </div>
                    <Progress value={Math.min((data.total / 1200) * 100, 100)} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* AI Insights */}
          <Card>
            <CardHeader>
              <CardTitle>AI Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {latestAssessment ? (
                <>
                  <div className="bg-muted rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-primary bg-opacity-20 rounded-full flex items-center justify-center">
                        <Brain className="text-primary text-xs" />
                      </div>
                      <div>
                        <p className="text-sm text-card-foreground font-medium">Latest Assessment</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {latestAssessment.recommendations.slice(0, 100)}...
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-muted rounded-lg p-4">
                  <p className="text-sm text-muted-foreground text-center">
                    Take your first AI assessment to get personalized insights!
                  </p>
                </div>
              )}
              
              <Link href="/ai-interview">
                <Button className="w-full" data-testid="button-assessment">
                  <Brain className="mr-2" size={16} />
                  Take 5-Min Assessment
                </Button>
              </Link>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Quick Actions */}
      <section>
        <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/diary">
            <Card className="card-hover cursor-pointer" data-testid="card-diary">
              <CardContent className="p-4 text-center">
                <Plus className="text-primary text-2xl mb-2 mx-auto" />
                <p className="text-card-foreground font-medium">New Diary Entry</p>
              </CardContent>
            </Card>
          </Link>
          
          <Link href="/study-tracker">
            <Card className="card-hover cursor-pointer" data-testid="card-study">
              <CardContent className="p-4 text-center">
                <BookOpen className="text-chart-1 text-2xl mb-2 mx-auto" />
                <p className="text-card-foreground font-medium">Log Study Session</p>
              </CardContent>
            </Card>
          </Link>
          
          <Link href="/achievements">
            <Card className="card-hover cursor-pointer" data-testid="card-achievement">
              <CardContent className="p-4 text-center">
                <Trophy className="text-chart-3 text-2xl mb-2 mx-auto" />
                <p className="text-card-foreground font-medium">Add Achievement</p>
              </CardContent>
            </Card>
          </Link>
          
          <Link href="/mistakes">
            <Card className="card-hover cursor-pointer" data-testid="card-mistake">
              <CardContent className="p-4 text-center">
                <AlertTriangle className="text-chart-5 text-2xl mb-2 mx-auto" />
                <p className="text-card-foreground font-medium">Track Mistake</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
