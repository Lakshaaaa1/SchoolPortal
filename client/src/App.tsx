import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";
import { handlePendingNotificationActions } from "@/services/notifications";

function AppContent() {
  const { student } = useAuth();

  useEffect(() => {
    // Handle any pending notification actions when app starts
    handlePendingNotificationActions();
  }, []);

  if (!student) {
    return <Login />;
  }

  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <AppContent />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
