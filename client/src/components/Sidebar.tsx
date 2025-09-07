import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { 
  Home, 
  Calendar, 
  BookOpen, 
  PenTool, 
  AlertTriangle, 
  Trophy, 
  GraduationCap, 
  Users, 
  Brain,
  ChartLine,
  User,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const sidebarItems = [
  { path: '/', icon: Home, label: 'Dashboard' },
  { path: '/calendar', icon: Calendar, label: 'Calendar' },
  { path: '/diary', icon: BookOpen, label: 'Diary' },
  { path: '/stories', icon: PenTool, label: 'Stories' },
  { path: '/mistakes', icon: AlertTriangle, label: 'Mistakes' },
  { path: '/achievements', icon: Trophy, label: 'Achievements' },
  { path: '/study-tracker', icon: GraduationCap, label: 'Study Tracker' },
  { path: '/people', icon: Users, label: 'People' },
  { path: '/ai-interview', icon: Brain, label: 'AI Interview' },
];

const Sidebar = () => {
  const [location] = useLocation();
  const { user, signOut } = useAuth();

  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col" data-testid="sidebar">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <ChartLine className="text-primary-foreground text-sm" />
          </div>
          <h1 className="text-xl font-bold text-sidebar-foreground">GrowthTracker</h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {sidebarItems.map(({ path, icon: Icon, label }) => (
          <Link key={path} href={path}>
            <div
              className={`sidebar-item rounded-lg p-3 cursor-pointer ${
                location === path ? 'bg-sidebar-accent' : ''
              }`}
              data-testid={`nav-${label.toLowerCase().replace(' ', '-')}`}
            >
              <div className="flex items-center space-x-3">
                <Icon 
                  className={`${
                    location === path ? 'text-sidebar-primary' : 'text-muted-foreground'
                  }`} 
                  size={20} 
                />
                <span className="text-sidebar-foreground font-medium">{label}</span>
              </div>
            </div>
          </Link>
        ))}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <User className="text-primary-foreground" size={20} />
            </div>
            <div>
              <p className="text-sm font-medium text-sidebar-foreground" data-testid="user-name">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-muted-foreground" data-testid="user-email">
                {user?.email}
              </p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={signOut}
            data-testid="button-signout"
          >
            <LogOut size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
