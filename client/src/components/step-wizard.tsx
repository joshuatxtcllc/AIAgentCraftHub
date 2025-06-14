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
  Circle, 
  User, 
  Bot, 
  Workflow, 
  MessageSquare, 
  Rocket,
  HelpCircle,
  Code
} from 'lucide-react';
import { cn } from '@/lib/utils';

const steps = [
  {
    id: 1,
    title: "Create Assistant",
    description: "Set up your AI assistant with name, model, and basic configuration",
    icon: User,
    component: "assistant-config",
    validation: (store: any) => store.currentAssistant?.name?.trim() && store.currentAssistant?.model
  },
  {
    id: 2, 
    title: "Configure Capabilities",
    description: "Select what your assistant can do and fine-tune its behavior",
    icon: Bot,
    component: "assistant-config",
    validation: (store: any) => store.currentAssistant?.capabilities?.length > 0
  },
  {
    id: 3,
    title: "Build Workflow (Optional)",
    description: "Create custom workflows to handle complex tasks and logic",
    icon: Workflow,
    component: "workflow-builder", 
    validation: () => true, // Optional step
    optional: true
  },
  {
    id: 4,
    title: "Test Your Assistant",
    description: "Chat with your assistant to test its responses and behavior",
    icon: MessageSquare,
    component: "chat-interface",
    validation: (store: any) => store.chatMessages?.length > 0
  },
    {
    id: 5,
    title: "Integration Guide",
    description: "Learn how to integrate your assistant into your applications",
    icon: Code,
    component: "integration-guide",
    validation: () => true // Assuming integration guide is always valid
  },
  {
    id: 6,
    title: "Deploy Assistant",
    description: "Make your assistant active and ready for production use",
    icon: Rocket,
    component: "assistant-config",
    validation: (store: any) => store.currentAssistant?.isActive
  }
];

interface StepWizardProps {
  onStepSelect: (step: number) => void;
  activeComponent: string;
}

export function StepWizard({ onStepSelect, activeComponent }: StepWizardProps) {
  const store = useAssistantStore();
  const [currentStep, setCurrentStep] = useState(1);

  const completedSteps = steps.filter(step => step.validation(store)).length;
  const progress = (completedSteps / steps.length) * 100;

  const handleStepClick = (stepId: number) => {
    setCurrentStep(stepId);
    onStepSelect(stepId);
  };

  const handleNext = () => {
    const currentStepData = steps.find(step => step.id === currentStep);
    if (currentStepData && !currentStepData.validation(store) && !currentStepData.optional) {
      // Don't proceed if current step is not valid and not optional
      return;
    }

    if (currentStep < steps.length) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      onStepSelect(nextStep);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      onStepSelect(prevStep);
    }
  };

  return (
    <Card className="h-fit">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Assistant Builder Guide</CardTitle>
          <Badge variant="secondary">
            {completedSteps}/{steps.length} Complete
          </Badge>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {steps.map((step) => {
          const Icon = step.icon;
          const isCompleted = step.validation(store);
          const isCurrent = currentStep === step.id;
          const isActive = activeComponent === step.component;

          return (
            <div
              key={step.id}
              className={cn(
                "flex items-start space-x-3 p-3 rounded-lg border transition-all cursor-pointer",
                isCurrent && "border-primary bg-primary/5",
                isActive && "border-secondary bg-secondary/5",
                !isCurrent && !isActive && "border-border hover:border-muted-foreground/50"
              )}
              onClick={() => handleStepClick(step.id)}
            >
              <div className={cn(
                "flex items-center justify-center w-6 h-6 rounded-full border-2 mt-0.5",
                isCompleted ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground",
                isCurrent && !isCompleted && "border-primary"
              )}>
                {isCompleted ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <span className="text-xs font-medium">{step.id}</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h3 className={cn(
                    "text-sm font-medium",
                    isCompleted && "text-primary",
                    isCurrent && "text-foreground"
                  )}>
                    {step.title}
                  </h3>
                  {step.optional && (
                    <Badge variant="outline" className="text-xs">Optional</Badge>
                  )}
                  <Icon className={cn(
                    "w-4 h-4",
                    isCompleted && "text-primary",
                    isCurrent && "text-foreground"
                  )} />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}

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

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
            >
              <HelpCircle className="w-3 h-3 mr-1" />
              Help
            </Button>
          </div>

          <Button
            variant="default"
            size="sm"
            onClick={handleNext}
            disabled={currentStep === steps.length}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

```typescript
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
  Circle, 
  User, 
  Bot, 
  Workflow, 
  MessageSquare, 
  Rocket,
  HelpCircle,
  Code
} from 'lucide-react';
import { cn } from '@/lib/utils';

const steps = [
  {
    id: 1,
    title: "Create Assistant",
    description: "Set up your AI assistant with name, model, and basic configuration",
    icon: User,
    component: "assistant-config",
    validation: (store: any) => store.currentAssistant?.name?.trim() && store.currentAssistant?.model
  },
  {
    id: 2, 
    title: "Configure Capabilities",
    description: "Select what your assistant can do and fine-tune its behavior",
    icon: Bot,
    component: "assistant-config",
    validation: (store: any) => store.currentAssistant?.capabilities?.length > 0
  },
  {
    id: 3,
    title: "Build Workflow (Optional)",
    description: "Create custom workflows to handle complex tasks and logic",
    icon: Workflow,
    component: "workflow-builder", 
    validation: () => true, // Optional step
    optional: true
  },
  {
    id: 4,
    title: "Test Your Assistant",
    description: "Chat with your assistant to test its responses and behavior",
    icon: MessageSquare,
    component: "chat-interface",
    validation: (store: any) => store.chatMessages?.length > 0
  },
    {
    id: 5,
    title: "Integration Guide",
    description: "Learn how to integrate your assistant into your applications",
    icon: Code,
    component: "integration-guide",
    validation: () => true // Assuming integration guide is always valid
  },
  {
    id: 6,
    title: "Deploy Assistant",
    description: "Make your assistant active and ready for production use",
    icon: Rocket,
    component: "assistant-config",
    validation: (store: any) => store.currentAssistant?.isActive
  }
];

interface StepWizardProps {
  onStepSelect: (step: number) => void;
  activeComponent: string;
}

export function StepWizard({ onStepSelect, activeComponent }: StepWizardProps) {
  const store = useAssistantStore();
  const [currentStep, setCurrentStep] = useState(1);

  const completedSteps = steps.filter(step => step.validation(store)).length;
  const progress = (completedSteps / steps.length) * 100;

  const handleStepClick = (stepId: number) => {
    setCurrentStep(stepId);
    onStepSelect(stepId);
  };

  const handleNext = () => {
    const currentStepData = steps.find(step => step.id === currentStep);
    if (currentStepData && !currentStepData.validation(store) && !currentStepData.optional) {
      // Don't proceed if current step is not valid and not optional
      return;
    }

    if (currentStep < steps.length) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      onStepSelect(nextStep);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      onStepSelect(prevStep);
    }
  };

  return (
    <Card className="h-fit">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Assistant Builder Guide</CardTitle>
          <Badge variant="secondary">
            {completedSteps}/{steps.length} Complete
          </Badge>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {steps.map((step) => {
          const Icon = step.icon;
          const isCompleted = step.validation(store);
          const isCurrent = currentStep === step.id;
          const isActive = activeComponent === step.component;

          return (
            <div
              key={step.id}
              className={cn(
                "flex items-start space-x-3 p-3 rounded-lg border transition-all cursor-pointer",
                isCurrent && "border-primary bg-primary/5",
                isActive && "border-secondary bg-secondary/5",
                !isCurrent && !isActive && "border-border hover:border-muted-foreground/50"
              )}
              onClick={() => handleStepClick(step.id)}
            >
              <div className={cn(
                "flex items-center justify-center w-6 h-6 rounded-full border-2 mt-0.5",
                isCompleted ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground",
                isCurrent && !isCompleted && "border-primary"
              )}>
                {isCompleted ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <span className="text-xs font-medium">{step.id}</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h3 className={cn(
                    "text-sm font-medium",
                    isCompleted && "text-primary",
                    isCurrent && "text-foreground"
                  )}>
                    {step.title}
                  </h3>
                  {step.optional && (
                    <Badge variant="outline" className="text-xs">Optional</Badge>
                  )}
                  <Icon className={cn(
                    "w-4 h-4",
                    isCompleted && "text-primary",
                    isCurrent && "text-foreground"
                  )} />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}

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

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
            >
              <HelpCircle className="w-3 h-3 mr-1" />
              Help
            </Button>
          </div>

          <Button
            variant="default"
            size="sm"
            onClick={handleNext}
            disabled={currentStep === steps.length}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

```
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
  Circle, 
  User, 
  Bot, 
  Workflow, 
  MessageSquare, 
  Rocket,
  HelpCircle,
  Code
} from 'lucide-react';
import { cn } from '@/lib/utils';

const steps = [
  {
    id: 1,
    title: "Create Assistant",
    description: "Set up your AI assistant with name, model, and basic configuration",
    icon: User,
    component: "assistant-config",
    validation: (store: any) => store.currentAssistant?.name?.trim() && store.currentAssistant?.model
  },
  {
    id: 2, 
    title: "Configure Capabilities",
    description: "Select what your assistant can do and fine-tune its behavior",
    icon: Bot,
    component: "assistant-config",
    validation: (store: any) => store.currentAssistant?.capabilities?.length > 0
  },
  {
    id: 3,
    title: "Build Workflow (Optional)",
    description: "Create custom workflows to handle complex tasks and logic",
    icon: Workflow,
    component: "workflow-builder", 
    validation: () => true, // Optional step
    optional: true
  },
  {
    id: 4,
    title: "Test Your Assistant",
    description: "Chat with your assistant to test its responses and behavior",
    icon: MessageSquare,
    component: "chat-interface",
    validation: (store: any) => store.chatMessages?.length > 0
  },
    {
    id: 5,
    title: "Integration Guide",
    description: "Learn how to integrate your assistant into your applications",
    icon: Code,
    component: "integration-guide",
    validation: () => true // Assuming integration guide is always valid
  },
  {
    id: 6,
    title: "Deploy Assistant",
    description: "Make your assistant active and ready for production use",
    icon: Rocket,
    component: "assistant-config",
    validation: (store: any) => store.currentAssistant?.isActive
  }
];

interface StepWizardProps {
  onStepSelect: (step: number) => void;
  activeComponent: string;
}

export function StepWizard({ onStepSelect, activeComponent }: StepWizardProps) {
  const store = useAssistantStore();
  const [currentStep, setCurrentStep] = useState(1);

  const completedSteps = steps.filter(step => step.validation(store)).length;
  const progress = (completedSteps / steps.length) * 100;

  const handleStepClick = (stepId: number) => {
    setCurrentStep(stepId);
    onStepSelect(stepId);
  };

  const handleNext = () => {
    const currentStepData = steps.find(step => step.id === currentStep);
    if (currentStepData && !currentStepData.validation(store) && !currentStepData.optional) {
      // Don't proceed if current step is not valid and not optional
      return;
    }

    if (currentStep < steps.length) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      onStepSelect(nextStep);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      onStepSelect(prevStep);
    }
  };

  return (
    <Card className="h-fit">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Assistant Builder Guide</CardTitle>
          <Badge variant="secondary">
            {completedSteps}/{steps.length} Complete
          </Badge>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {steps.map((step) => {
          const Icon = step.icon;
          const isCompleted = step.validation(store);
          const isCurrent = currentStep === step.id;
          const isActive = activeComponent === step.component;

          return (
            <div
              key={step.id}
              className={cn(
                "flex items-start space-x-3 p-3 rounded-lg border transition-all cursor-pointer",
                isCurrent && "border-primary bg-primary/5",
                isActive && "border-secondary bg-secondary/5",
                !isCurrent && !isActive && "border-border hover:border-muted-foreground/50"
              )}
              onClick={() => handleStepClick(step.id)}
            >
              <div className={cn(
                "flex items-center justify-center w-6 h-6 rounded-full border-2 mt-0.5",
                isCompleted ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground",
                isCurrent && !isCompleted && "border-primary"
              )}>
                {isCompleted ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <span className="text-xs font-medium">{step.id}</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h3 className={cn(
                    "text-sm font-medium",
                    isCompleted && "text-primary",
                    isCurrent && "text-foreground"
                  )}>
                    {step.title}
                  </h3>
                  {step.optional && (
                    <Badge variant="outline" className="text-xs">Optional</Badge>
                  )}
                  <Icon className={cn(
                    "w-4 h-4",
                    isCompleted && "text-primary",
                    isCurrent && "text-foreground"
                  )} />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}

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

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
            >
              <HelpCircle className="w-3 h-3 mr-1" />
              Help
            </Button>
          </div>

          <Button
            variant="default"
            size="sm"
            onClick={handleNext}
            disabled={currentStep === steps.length}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

```typescript
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
  Circle, 
  User, 
  Bot, 
  Workflow, 
  MessageSquare, 
  Rocket,
  HelpCircle,
  Code
} from 'lucide-react';
import { cn } from '@/lib/utils';

const steps = [
  {
    id: 1,
    title: "Create Assistant",
    description: "Set up your AI assistant with name, model, and basic configuration",
    icon: User,
    component: "assistant-config",
    validation: (store: any) => store.currentAssistant?.name?.trim() && store.currentAssistant?.model
  },
  {
    id: 2, 
    title: "Configure Capabilities",
    description: "Select what your assistant can do and fine-tune its behavior",
    icon: Bot,
    component: "assistant-config",
    validation: (store: any) => store.currentAssistant?.capabilities?.length > 0
  },
  {
    id: 3,
    title: "Build Workflow (Optional)",
    description: "Create custom workflows to handle complex tasks and logic",
    icon: Workflow,
    component: "workflow-builder", 
    validation: () => true, // Optional step
    optional: true
  },
  {
    id: 4,
    title: "Test Your Assistant",
    description: "Chat with your assistant to test its responses and behavior",
    icon: MessageSquare,
    component: "chat-interface",
    validation: (store: any) => store.chatMessages?.length > 0
  },
    {
    id: 5,
    title: "Integration Guide",
    description: "Learn how to integrate your assistant into your applications",
    icon: Code,
    component: "integration-guide",
    validation: () => true // Assuming integration guide is always valid
  },
  {
    id: 6,
    title: "Deploy Assistant",
    description: "Make your assistant active and ready for production use",
    icon: Rocket,
    component: "assistant-config",
    validation: (store: any) => store.currentAssistant?.isActive
  }
];

interface StepWizardProps {
  onStepSelect: (step: number) => void;
  activeComponent: string;
}

export function StepWizard({ onStepSelect, activeComponent }: StepWizardProps) {
  const store = useAssistantStore();
  const [currentStep, setCurrentStep] = useState(1);

  const completedSteps = steps.filter(step => step.validation(store)).length;
  const progress = (completedSteps / steps.length) * 100;

  const handleStepClick = (stepId: number) => {
    setCurrentStep(stepId);
    onStepSelect(stepId);
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      onStepSelect(nextStep);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      onStepSelect(prevStep);
    }
  };

  return (
    <Card className="h-fit">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Assistant Builder Guide</CardTitle>
          <Badge variant="secondary">
            {completedSteps}/{steps.length} Complete
          </Badge>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {steps.map((step) => {
          const Icon = step.icon;
          const isCompleted = step.validation(store);
          const isCurrent = currentStep === step.id;
          const isActive = activeComponent === step.component;

          return (
            <div
              key={step.id}
              className={cn(
                "flex items-start space-x-3 p-3 rounded-lg border transition-all cursor-pointer",
                isCurrent && "border-primary bg-primary/5",
                isActive && "border-secondary bg-secondary/5",
                !isCurrent && !isActive && "border-border hover:border-muted-foreground/50"
              )}
              onClick={() => handleStepClick(step.id)}
            >
              <div className={cn(
                "flex items-center justify-center w-6 h-6 rounded-full border-2 mt-0.5",
                isCompleted ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground",
                isCurrent && !isCompleted && "border-primary"
              )}>
                {isCompleted ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <span className="text-xs font-medium">{step.id}</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h3 className={cn(
                    "text-sm font-medium",
                    isCompleted && "text-primary",
                    isCurrent && "text-foreground"
                  )}>
                    {step.title}
                  </h3>
                  {step.optional && (
                    <Badge variant="outline" className="text-xs">Optional</Badge>
                  )}
                  <Icon className={cn(
                    "w-4 h-4",
                    isCompleted && "text-primary",
                    isCurrent && "text-foreground"
                  )} />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}

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

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
            >
              <HelpCircle className="w-3 h-3 mr-1" />
              Help
            </Button>
          </div>

          <Button
            variant="default"
            size="sm"
            onClick={handleNext}
            disabled={currentStep === steps.length}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

```typescript
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
  Circle, 
  User, 
  Bot, 
  Workflow, 
  MessageSquare, 
  Rocket,
  HelpCircle,
  Code
} from 'lucide-react';
import { cn } from '@/lib/utils';

const steps = [
  {
    id: 1,
    title: "Create Assistant",
    description: "Set up your AI assistant with name, model, and basic configuration",
    icon: User,
    component: "assistant-config",
    validation: (store: any) => store.currentAssistant?.name?.trim() && store.currentAssistant?.model
  },
  {
    id: 2, 
    title: "Configure Capabilities",
    description: "Select what your assistant can do and fine-tune its behavior",
    icon: Bot,
    component: "assistant-config",
    validation: (store: any) => store.currentAssistant?.capabilities?.length > 0
  },
  {
    id: 3,
    title: "Build Workflow (Optional)",
    description: "Create custom workflows to handle complex tasks and logic",
    icon: Workflow,
    component: "workflow-builder", 
    validation: () => true, // Optional step
    optional: true
  },
  {
    id: 4,
    title: "Test Your Assistant",
    description: "Chat with your assistant to test its responses and behavior",
    icon: MessageSquare,
    component: "chat-interface",
    validation: (store: any) => store.chatMessages?.length > 0
  },
    {
    id: 5,
    title: "Integration Guide",
    description: "Learn how to integrate your assistant into your applications",
    icon: Code,
    component: "integration-guide",
    validation: () => true // Assuming integration guide is always valid
  },
  {
    id: 6,
    title: "Deploy Assistant",
    description: "Make your assistant active and ready for production use",
    icon: Rocket,
    component: "assistant-config",
    validation: (store: any) => store.currentAssistant?.isActive
  }
];

interface StepWizardProps {
  onStepSelect: (step: number) => void;
  activeComponent: string;
}

export function StepWizard({ onStepSelect, activeComponent }: StepWizardProps) {
  const store = useAssistantStore();
  const [currentStep, setCurrentStep] = useState(1);

  const completedSteps = steps.filter(step => step.validation(store)).length;
  const progress = (completedSteps / steps.length) * 100;

  const handleStepClick = (stepId: number) => {
    setCurrentStep(stepId);
    onStepSelect(stepId);
  };

  const handleNext = () => {