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
import { ChatInterface } from "@/components/chat-interface";
import { WorkflowBuilder } from "@/components/workflow-builder";
import { TemplateLibrary } from "@/components/template-library";
import { AssistantConfig } from "@/components/assistant-config";
import { IntegrationGuide } from "@/components/integration-guide";

// Page wrapper component
function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="bg-card border-b border-border px-6 py-4">
        <h1 className="text-2xl font-bold text-foreground">AI Assistant Builder</h1>
      </div>
      <div className="flex-1 overflow-auto p-6">
        {children}
      </div>
    </div>
  );
}

function Router() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden pt-16 md:pt-0">
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/builder" component={() => <PageWrapper><AssistantConfig /></PageWrapper>} />
        <Route path="/chat" component={() => <PageWrapper><ChatInterface /></PageWrapper>} />
        <Route path="/templates" component={() => <PageWrapper><TemplateLibrary /></PageWrapper>} />
        <Route path="/workflows" component={() => <PageWrapper><WorkflowBuilder /></PageWrapper>} />
        <Route path="/integration" component={() => <PageWrapper><IntegrationGuide /></PageWrapper>} />
        <Route path="/analytics" component={Dashboard} />
        <Route component={NotFound} />
      </Switch>
      </div>
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