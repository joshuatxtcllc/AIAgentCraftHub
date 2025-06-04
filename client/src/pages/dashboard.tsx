import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WorkflowBuilder } from '@/components/workflow-builder';
import { TemplateLibrary } from '@/components/template-library';
import { ChatInterface } from '@/components/chat-interface';
import { AssistantConfig } from '@/components/assistant-config';
import { ActivityFeed } from '@/components/activity-feed';
import { NodeConfig } from '@/components/node-config';
import { StepWizard } from '@/components/step-wizard';
import { useAssistantStore } from '@/store/assistant-store';
import { useUser } from "@/contexts/user-context";
import { type AssistantStats } from '@shared/schema';
import { 
  CheckCircle, 
  MessageSquare, 
  TrendingUp, 
  Zap,
  Plus,
  Save 
} from 'lucide-react';
import { IntegrationGuide } from '@/components/integration-guide';

export default function Dashboard() {
  const { user } = useUser();
  const { setCurrentAssistant, selectedNodeId } = useAssistantStore();
  const { data: stats, isLoading: statsLoading } = useQuery<AssistantStats>({
    queryKey: ['/api/stats'],
  });

  const [activeComponent, setActiveComponent] = useState('assistant-config');

  const handleStepSelect = (stepId) => {
    setActiveComponent(stepId);
  };

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
      userId: user?.id,
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
        {/* Main Content Grid */}
      <div className="flex-1 grid grid-cols-12 gap-6 p-6 overflow-auto">
        {/* Left Column - Step Guide */}
        <div className="col-span-12 xl:col-span-3 space-y-6">
          <StepWizard 
            onStepSelect={handleStepSelect} 
            activeComponent={activeComponent}
          />
          <ActivityFeed />
        </div>

        {/* Center Column - Main Component */}
        <div className="col-span-12 xl:col-span-6 space-y-6">
          {activeComponent === 'assistant-config' && (
            <>
              <AssistantConfig />
              <TemplateLibrary />
            </>
          )}
          {activeComponent === 'workflow-builder' && (
            <WorkflowBuilder />
          )}
          {activeComponent === 'chat-interface' && (
            <ChatInterface />
          )}
          {activeComponent === 'integration-guide' && (
            <IntegrationGuide />
          )}
          {selectedNodeId && <NodeConfig />}
        </div>

        {/* Right Column - Stats & Quick Actions */}
        <div className="col-span-12 xl:col-span-3 space-y-6">
          {/* Quick Stats */}
          {!statsLoading && stats && (
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-lg mx-auto mb-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                    </div>
                    <div className="text-2xl font-bold">{stats.activeAssistants}</div>
                    <div className="text-xs text-muted-foreground">Active</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center w-8 h-8 bg-secondary/10 rounded-lg mx-auto mb-2">
                      <MessageSquare className="w-4 h-4 text-secondary" />
                    </div>
                    <div className="text-2xl font-bold">{stats.conversations}</div>
                    <div className="text-xs text-muted-foreground">Chats</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions for Current Step */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <h3 className="text-sm font-semibold">Quick Actions</h3>
              {activeComponent === 'assistant-config' && (
                <div className="space-y-2">
                  <Button size="sm" className="w-full" onClick={handleCreateAssistant}>
                    <Plus className="w-3 h-3 mr-2" />
                    New Assistant
                  </Button>
                  <Button size="sm" variant="outline" className="w-full" onClick={handleSaveDraft}>
                    <Save className="w-3 h-3 mr-2" />
                    Save Draft
                  </Button>
                </div>
              )}
              {activeComponent === 'workflow-builder' && (
                <div className="space-y-2">
                  <Button size="sm" className="w-full" onClick={() => setActiveComponent('chat-interface')}>
                    <MessageSquare className="w-3 h-3 mr-2" />
                    Test Workflow
                  </Button>
                </div>
              )}
              {activeComponent === 'chat-interface' && (
                <div className="space-y-2">
                  <Button size="sm" className="w-full" onClick={() => setActiveComponent('assistant-config')}>
                    <Zap className="w-3 h-3 mr-2" />
                    Deploy Assistant
                  </Button>
                </div>
              )}
              {activeComponent === 'integration-guide' && (
                <div className="space-y-2">
                  <Button size="sm" className="w-full" onClick={() => setActiveComponent('assistant-config')}>
                    <Zap className="w-3 h-3 mr-2" />
                    Back to Assistant Config
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
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