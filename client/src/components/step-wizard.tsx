
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAssistantStore } from '@/store/assistant-store';
import { 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle, 
  User, 
  Bot, 
  Workflow, 
  MessageSquare, 
  Rocket,
  Code
} from 'lucide-react';
import { cn } from '@/lib/utils';

const steps = [
  {
    id: 1,
    title: "Create Assistant",
    description: "Set up your AI assistant with name, model, and basic configuration",
    icon: User,
    component: "assistant-config"
  },
  {
    id: 2, 
    title: "Configure Capabilities",
    description: "Select what your assistant can do and fine-tune its behavior",
    icon: Bot,
    component: "assistant-config"
  },
  {
    id: 3,
    title: "Build Workflow (Optional)",
    description: "Create custom workflows to handle complex tasks and logic",
    icon: Workflow,
    component: "workflow-builder",
    optional: true
  },
  {
    id: 4,
    title: "Test Your Assistant",
    description: "Chat with your assistant to test its responses and behavior",
    icon: MessageSquare,
    component: "chat-interface"
  },
  {
    id: 5,
    title: "Integration Guide",
    description: "Learn how to integrate your assistant into your applications",
    icon: Code,
    component: "integration-guide"
  },
  {
    id: 6,
    title: "Deploy Assistant",
    description: "Make your assistant active and ready for production use",
    icon: Rocket,
    component: "assistant-config"
  }
];

interface StepWizardProps {
  onStepSelect: (step: number) => void;
  activeComponent: string;
}

export function StepWizard({ onStepSelect, activeComponent }: StepWizardProps) {
  const store = useAssistantStore();
  const [currentStep, setCurrentStep] = useState(1);

  const completedSteps = currentStep - 1;
  const progress = (completedSteps / steps.length) * 100;

  const canProceed = (stepId: number): boolean => {
    const { currentAssistant } = store;
    
    switch (stepId) {
      case 1:
        return true; // Always can start
      case 2:
        return currentAssistant?.name?.trim().length > 0;
      case 3:
        return currentAssistant?.capabilities?.length > 0;
      case 4:
        return true; // Workflow is optional
      case 5:
        return true; // Can always test
      case 6:
        return currentAssistant?.name?.trim().length > 0 && currentAssistant?.capabilities?.length > 0;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length && canProceed(currentStep + 1)) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      onStepSelect(nextStep);
    }
  };

  const handleStepClick = (stepId: number) => {
    // Only allow clicking on current step or previous completed steps
    if (stepId <= currentStep) {
      setCurrentStep(stepId);
      onStepSelect(stepId);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      onStepSelect(prevStep);
    }
  };

  const currentStepData = steps[currentStep - 1];
  const Icon = currentStepData.icon;

  return (
    <Card className="h-fit">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">
                Step {currentStep} of {steps.length}
              </CardTitle>
              <p className="text-sm text-muted-foreground">{currentStepData.title}</p>
            </div>
          </div>
          {currentStepData.optional && (
            <Badge variant="outline" className="text-xs">Optional</Badge>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current Step Description */}
        <div className="p-4 bg-muted/30 rounded-lg">
          <h3 className="font-medium text-foreground mb-2">{currentStepData.title}</h3>
          <p className="text-sm text-muted-foreground">{currentStepData.description}</p>
        </div>

        {/* Step Progress Indicators */}
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center space-y-1">
              <div 
                className={cn(
                  "w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-medium transition-colors",
                  index < currentStep - 1 ? "bg-primary border-primary text-primary-foreground cursor-pointer hover:bg-primary/90" : 
                  index === currentStep - 1 ? "border-primary text-primary" : 
                  "border-muted-foreground/30 text-muted-foreground cursor-not-allowed",
                  index < currentStep ? "cursor-pointer" : "cursor-not-allowed"
                )}
                onClick={() => handleStepClick(step.id)}
              >
                {index < currentStep - 1 ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  step.id
                )}
              </div>
              <span className="text-xs text-center max-w-16 leading-tight">
                {step.title.split(' ')[0]}
              </span>
            </div>
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>

          <div className="text-xs text-muted-foreground">
            {currentStep}/{steps.length}
          </div>

          <Button
            size="sm"
            onClick={handleNext}
            disabled={currentStep === steps.length || !canProceed(currentStep + 1)}
          >
            {currentStep === 1 ? 'Create Agent' : currentStep === steps.length ? 'Complete' : 'Next'}
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        {/* Validation Messages */}
        {!canProceed(currentStep + 1) && currentStep < steps.length && (
          <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
            {currentStep === 1 && "Please enter an assistant name to continue"}
            {currentStep === 2 && "Please select at least one capability to continue"}
            {currentStep === 5 && "Please save and deploy your assistant to complete"}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
