import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WorkflowBuilder } from '@/components/workflow-builder';
import { TemplateLibrary } from '@/components/template-library';
import { ChatInterface } from '@/components/chat-interface';
import { AssistantConfig } from '@/components/assistant-config';
import { ActivityFeed } from '@/components/activity-feed';
import { useAssistantStore } from '@/store/assistant-store';
import { type AssistantStats } from '@shared/schema';
import { 
  CheckCircle, 
  MessageSquare, 
  TrendingUp, 
  Zap,
  Plus,
  Save 
} from 'lucide-react';

export default function Dashboard() {
  const { setCurrentAssistant } = useAssistantStore();
  const { data: stats, isLoading: statsLoading } = useQuery<AssistantStats>({
    queryKey: ['/api/stats'],
  });

  const handleCreateAssistant = () => {
    // Create a new assistant object with default values that matches the Assistant type
    const newAssistant = {
      id: 0, // Will be set by the server
      name: '',
      description: null,
      model: 'gpt-4',
      temperature: 30,
      capabilities: ['conversation', 'analysis'],
      instructions: null,
      isActive: true,
      userId: 1,
      createdAt: new Date()
    };
    
    setCurrentAssistant(newAssistant);
  };

  const handleSaveDraft = () => {
    // TODO: Implement save draft functionality
    console.log('Save draft');
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header Bar */}
      <div className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">AI Assistant Builder</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Create and manage intelligent assistants for your business
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={handleSaveDraft}>
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </Button>
            <Button onClick={handleCreateAssistant}>
              <Plus className="w-4 h-4 mr-2" />
              Create Assistant
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Active Assistants"
              value={stats?.activeAssistants || 0}
              icon={CheckCircle}
              iconColor="text-primary"
              iconBg="bg-primary/10"
              loading={statsLoading}
            />
            <StatCard
              title="Conversations"
              value={stats?.conversations || 0}
              icon={MessageSquare}
              iconColor="text-secondary"
              iconBg="bg-secondary/10"
              loading={statsLoading}
            />
            <StatCard
              title="Success Rate"
              value={stats?.successRate || "0%"}
              icon={TrendingUp}
              iconColor="text-accent"
              iconBg="bg-accent/10"
              loading={statsLoading}
            />
            <StatCard
              title="Workflows"
              value={stats?.workflows || 0}
              icon={Zap}
              iconColor="text-purple-600"
              iconBg="bg-purple-100"
              loading={statsLoading}
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Workflow Builder & Templates */}
            <div className="lg:col-span-2 space-y-6">
              <WorkflowBuilder />
              <TemplateLibrary />
            </div>

            {/* Right Column - Chat, Config & Activity */}
            <div className="space-y-6">
              <ChatInterface />
              <AssistantConfig />
              <ActivityFeed />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  iconBg: string;
  loading?: boolean;
}

function StatCard({ title, value, icon: Icon, iconColor, iconBg, loading }: StatCardProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="w-20 h-4 bg-muted rounded animate-pulse"></div>
              <div className="w-12 h-8 bg-muted rounded animate-pulse"></div>
            </div>
            <div className="w-12 h-12 bg-muted rounded-lg animate-pulse"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold text-foreground mt-2">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
          </div>
          <div className={`w-12 h-12 ${iconBg} rounded-lg flex items-center justify-center`}>
            <Icon className={`w-6 h-6 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
