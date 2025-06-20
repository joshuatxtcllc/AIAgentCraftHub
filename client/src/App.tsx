import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "@/components/sidebar";
import Dashboard from "@/pages/dashboard";
import NotFound from "@/pages/not-found";
import { MobileNav } from "@/components/mobile-nav";
import { UserProvider } from "@/contexts/user-context";

function Router() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/builder" component={Dashboard} />
        <Route path="/chat" component={Dashboard} />
        <Route path="/templates" component={Dashboard} />
        <Route path="/workflows" component={Dashboard} />
        <Route path="/analytics" component={Dashboard} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
          <MobileNav />
        </TooltipProvider>
      </UserProvider>
    </QueryClientProvider>
  );
}

export default App;