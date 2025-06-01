import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { useAssistantStore } from '@/store/assistant-store';
import { type InsertAssistant } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Rocket, Save } from 'lucide-react';

const availableModels = [
  { value: 'gpt-4', label: 'GPT-4 (Recommended)' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
  { value: 'claude-3', label: 'Claude 3' },
  { value: 'llama-2', label: 'Llama 2' },
];

const availableCapabilities = [
  'Web Search',
  'File Analysis', 
  'Code Generation',
  'Data Analysis',
  'Image Generation',
  'Voice Synthesis',
];

export function AssistantConfig() {
  const { currentAssistant, setCurrentAssistant } = useAssistantStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [config, setConfig] = useState<InsertAssistant>({
    name: '',
    description: '',
    model: 'gpt-4',
    temperature: 30,
    capabilities: [],
    instructions: '',
    isActive: false,
    userId: 1, // Default user
  });

  useEffect(() => {
    if (currentAssistant) {
      setConfig({
        name: currentAssistant.name,
        description: currentAssistant.description || '',
        model: currentAssistant.model,
        temperature: currentAssistant.temperature || 30,
        capabilities: currentAssistant.capabilities || [],
        instructions: currentAssistant.instructions || '',
        isActive: currentAssistant.isActive,
        userId: currentAssistant.userId || 1,
      });
    }
  }, [currentAssistant]);

  const saveAssistantMutation = useMutation({
    mutationFn: async (assistantData: InsertAssistant) => {
      if (currentAssistant) {
        const response = await apiRequest('PUT', `/api/assistants/${currentAssistant.id}`, assistantData);
        return response.json();
      } else {
        const response = await apiRequest('POST', '/api/assistants', assistantData);
        return response.json();
      }
    },
    onSuccess: (assistant) => {
      setCurrentAssistant(assistant);
      toast({
        title: currentAssistant ? "Assistant Updated" : "Assistant Created",
        description: `${assistant.name} has been saved successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/assistants'] });
      queryClient.invalidateQueries({ queryKey: ['/api/activities'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to Save Assistant",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deployAssistantMutation = useMutation({
    mutationFn: async () => {
      if (!currentAssistant) {
        throw new Error('No assistant to deploy');
      }
      const response = await apiRequest('PUT', `/api/assistants/${currentAssistant.id}`, {
        ...config,
        isActive: true
      });
      return response.json();
    },
    onSuccess: (assistant) => {
      setCurrentAssistant(assistant);
      toast({
        title: "Assistant Deployed",
        description: `${assistant.name} is now active and ready to assist.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/assistants'] });
      queryClient.invalidateQueries({ queryKey: ['/api/activities'] });
    },
    onError: (error) => {
      toast({
        title: "Deployment Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    saveAssistantMutation.mutate(config);
  };

  const handleDeploy = () => {
    if (currentAssistant) {
      deployAssistantMutation.mutate();
    } else {
      // Save first, then deploy
      saveAssistantMutation.mutate({ ...config, isActive: true });
    }
  };

  const handleCapabilityChange = (capability: string, checked: boolean) => {
    setConfig(prev => ({
      ...prev,
      capabilities: checked 
        ? [...(prev.capabilities || []), capability]
        : (prev.capabilities || []).filter(c => c !== capability)
    }));
  };

  if (!currentAssistant) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Assistant Settings</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">Click "Create Assistant" to get started</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          {currentAssistant.id === 0 ? 'Create New Assistant' : 'Edit Assistant'}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Assistant Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Assistant Name</Label>
          <Input
            id="name"
            value={config.name}
            onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter assistant name"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={config.description || ''}
            onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Brief description of the assistant"
          />
        </div>

        {/* Model Selection */}
        <div className="space-y-2">
          <Label>AI Model</Label>
          <Select 
            value={config.model} 
            onValueChange={(value) => setConfig(prev => ({ ...prev, model: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              {availableModels.map((model) => (
                <SelectItem key={model.value} value={model.value}>
                  {model.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Temperature */}
        <div className="space-y-2">
          <Label>Creativity Level: {config.temperature}%</Label>
          <div className="flex items-center space-x-3">
            <span className="text-xs text-muted-foreground">Factual</span>
            <Slider
              value={[config.temperature || 30]}
              onValueChange={([value]) => setConfig(prev => ({ ...prev, temperature: value }))}
              max={100}
              step={5}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground">Creative</span>
          </div>
        </div>

        {/* Capabilities */}
        <div className="space-y-2">
          <Label>Capabilities</Label>
          <div className="space-y-2">
            {availableCapabilities.map((capability) => (
              <div key={capability} className="flex items-center space-x-2">
                <Checkbox
                  id={capability}
                  checked={(config.capabilities || []).includes(capability)}
                  onCheckedChange={(checked) => 
                    handleCapabilityChange(capability, checked as boolean)
                  }
                />
                <Label 
                  htmlFor={capability} 
                  className="text-sm font-normal cursor-pointer"
                >
                  {capability}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="space-y-2">
          <Label htmlFor="instructions">Instructions</Label>
          <Textarea
            id="instructions"
            value={config.instructions || ''}
            onChange={(e) => setConfig(prev => ({ ...prev, instructions: e.target.value }))}
            placeholder="Provide specific instructions for how the assistant should behave"
            rows={3}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col space-y-2 pt-4">
          <Button 
            onClick={handleSave}
            disabled={saveAssistantMutation.isPending}
            variant="outline"
            className="w-full"
          >
            <Save className="w-4 h-4 mr-2" />
            {saveAssistantMutation.isPending ? 'Saving...' : 'Save Draft'}
          </Button>
          
          <Button 
            onClick={handleDeploy}
            disabled={deployAssistantMutation.isPending || !config.name}
            className="w-full bg-secondary hover:bg-secondary/90"
          >
            <Rocket className="w-4 h-4 mr-2" />
            {deployAssistantMutation.isPending ? 'Deploying...' : 'Deploy Assistant'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
