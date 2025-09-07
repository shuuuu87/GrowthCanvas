import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/Sidebar";
import AnimatedBackground from "@/components/AnimatedBackground";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Calendar from "@/pages/Calendar";
import Diary from "@/pages/Diary";
import Stories from "@/pages/Stories";
import Mistakes from "@/pages/Mistakes";
import Achievements from "@/pages/Achievements";
import StudyTracker from "@/pages/StudyTracker";
import People from "@/pages/People";
import AIInterview from "@/pages/AIInterview";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/calendar" component={Calendar} />
      <Route path="/diary" component={Diary} />
      <Route path="/stories" component={Stories} />
      <Route path="/mistakes" component={Mistakes} />
      <Route path="/achievements" component={Achievements} />
      <Route path="/study-tracker" component={StudyTracker} />
      <Route path="/people" component={People} />
      <Route path="/ai-interview" component={AIInterview} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AnimatedBackground />
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <Router />
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
