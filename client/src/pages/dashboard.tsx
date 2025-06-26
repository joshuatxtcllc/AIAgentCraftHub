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
  Plus
} from 'lucide-react';
import { IntegrationGuide } from '@/components/integration-guide';

export default function Dashboard() {
  const { user } = useUser();
  const { setCurrentAssistant, selectedNodeId } = useAssistantStore();
  const { data: stats, isLoading: statsLoading } = useQuery<AssistantStats>({
    queryKey: ['/api/stats'],
    staleTime: 30000,
    retry: 2,
    retryDelay: 1000,
  });

  const [activeComponent, setActiveComponent] = useState('assistant-config');
  const [currentStep, setCurrentStep] = useState(1);

  const handleStepSelect = (stepId: number) => {
    setCurrentStep(stepId);
    const stepMapping = {
      1: 'assistant-config',  // Create Assistant
      2: 'assistant-config',  // Configure Capabilities  
      3: 'workflow-builder',  // Build Workflow (Optional)
      4: 'chat-interface',    // Test Your Assistant
      5: 'integration-guide', // Integration Guide
      6: 'assistant-config'   // Deploy Assistant
    };
    setActiveComponent(stepMapping[stepId] || 'assistant-config');
  };

  const handleCreateAssistant = () => {
    const newAssistant = {
      id: 0,
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

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Simplified Header */}
      <div className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">AI Assistant Builder</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Follow the steps below to create your intelligent assistant
            </p>
          </div>
          <Button onClick={handleCreateAssistant} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Start
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto">
        <div className="flex-1 grid grid-cols-12 gap-6 p-6 overflow-auto">
          {/* Left Column - Step Guide (Full Height) */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <StepWizard 
              onStepSelect={handleStepSelect} 
              activeComponent={activeComponent}
            />

            {/* Quick Stats */}
            {!statsLoading && stats && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="text-sm font-semibold mb-3">Your Progress</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-2 bg-muted/30 rounded">
                      <div className="flex items-center justify-center w-6 h-6 bg-primary/10 rounded mx-auto mb-1">
                        <CheckCircle className="w-3 h-3 text-primary" />
                      </div>
                      <div className="text-lg font-bold">{stats.activeAssistants}</div>
                      <div className="text-xs text-muted-foreground">Active</div>
                    </div>
                    <div className="text-center p-2 bg-muted/30 rounded">
                      <div className="flex items-center justify-center w-6 h-6 bg-secondary/10 rounded mx-auto mb-1">
                        <MessageSquare className="w-3 h-3 text-secondary" />
                      </div>
                      <div className="text-lg font-bold">{stats.conversations}</div>
                      <div className="text-xs text-muted-foreground">Chats</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Current Step Content */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            {activeComponent === 'assistant-config' && currentStep === 1 && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Welcome to AI Assistant Builder</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Choose how you want to create your assistant
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <h3 className="text-lg font-semibold mb-4">Pick a template or build from scratch</h3>
                      <p className="text-muted-foreground mb-6">
                        Select a pre-built template below to get started quickly, or scroll down and click "Next" to build your assistant from scratch.
                      </p>
                      <div className="flex justify-center">
                        <Button onClick={() => setCurrentStep(2)} className="mr-4">
                          Build from Scratch
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <TemplateLibrary />
              </div>
            )}
            {activeComponent === 'assistant-config' && currentStep !== 1 && (
              <AssistantConfig />
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
            {selectedNodeId && <NodeConfig nodeId={selectedNodeId} />}
          </div>
        </div>
      </div>
    </div>
  );
}