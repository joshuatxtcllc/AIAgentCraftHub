import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAssistantStore } from '@/store/assistant-store';
import { type WorkflowNode } from '@shared/schema';
import { Save, X } from 'lucide-react';

interface NodeConfigProps {
  nodeId: string | null;
}

export function NodeConfig({ nodeId }: NodeConfigProps) {
  const { workflowNodes, updateWorkflowNode, setSelectedNodeId } = useAssistantStore();
  const [config, setConfig] = useState<Partial<WorkflowNode['data']>>({});
  
  const selectedNode = nodeId ? workflowNodes.find(n => n.id === nodeId) : null;

  useEffect(() => {
    if (selectedNode) {
      setConfig(selectedNode.data || {});
    }
  }, [selectedNode]);

  if (!selectedNode) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Node Configuration</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">Click on a workflow node to configure it</p>
        </CardContent>
      </Card>
    );
  }

  const handleSave = () => {
    updateWorkflowNode(selectedNode.id, { data: config });
    setSelectedNodeId(null);
  };

  const handleClose = () => {
    setSelectedNodeId(null);
  };

  const renderNodeSpecificConfig = () => {
    switch (selectedNode.type) {
      case 'trigger':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="trigger-type">Trigger Type</Label>
              <Select 
                value={config.triggerType || 'manual'} 
                onValueChange={(value) => setConfig(prev => ({ ...prev, triggerType: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select trigger type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="webhook">Webhook</SelectItem>
                  <SelectItem value="schedule">Schedule</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {config.triggerType === 'schedule' && (
              <div className="space-y-2">
                <Label htmlFor="schedule">Schedule (Cron)</Label>
                <Input
                  id="schedule"
                  value={config.schedule || ''}
                  onChange={(e) => setConfig(prev => ({ ...prev, schedule: e.target.value }))}
                  placeholder="0 9 * * 1-5"
                />
              </div>
            )}
          </>
        );

      case 'ai_action':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="prompt">AI Prompt</Label>
              <Textarea
                id="prompt"
                value={config.prompt || ''}
                onChange={(e) => setConfig(prev => ({ ...prev, prompt: e.target.value }))}
                placeholder="Enter the prompt for the AI to process..."
                rows={4}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="model">AI Model</Label>
              <Select 
                value={config.model || 'gpt-4'} 
                onValueChange={(value) => setConfig(prev => ({ ...prev, model: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select AI model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4">GPT-4</SelectItem>
                  <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                  <SelectItem value="claude-3">Claude 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="temperature">Temperature: {config.temperature || 30}%</Label>
              <input
                type="range"
                id="temperature"
                min="0"
                max="100"
                step="5"
                value={config.temperature || 30}
                onChange={(e) => setConfig(prev => ({ ...prev, temperature: parseInt(e.target.value) }))}
                className="w-full"
              />
            </div>
          </>
        );

      case 'condition':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="condition-type">Condition Type</Label>
              <Select 
                value={config.conditionType || 'if'} 
                onValueChange={(value) => setConfig(prev => ({ ...prev, conditionType: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select condition type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="if">If/Then</SelectItem>
                  <SelectItem value="switch">Switch</SelectItem>
                  <SelectItem value="filter">Filter</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="condition">Condition Logic</Label>
              <Textarea
                id="condition"
                value={config.condition || ''}
                onChange={(e) => setConfig(prev => ({ ...prev, condition: e.target.value }))}
                placeholder="Enter condition logic (e.g., result.confidence > 0.8)"
                rows={3}
              />
            </div>
          </>
        );

      case 'output':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="output-type">Output Type</Label>
              <Select 
                value={config.outputType || 'message'} 
                onValueChange={(value) => setConfig(prev => ({ ...prev, outputType: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select output type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="message">Message</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="webhook">Webhook</SelectItem>
                  <SelectItem value="file">File</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="output-template">Output Template</Label>
              <Textarea
                id="output-template"
                value={config.outputTemplate || ''}
                onChange={(e) => setConfig(prev => ({ ...prev, outputTemplate: e.target.value }))}
                placeholder="Enter output template..."
                rows={4}
              />
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Configure {selectedNode.label}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Basic Node Settings */}
        <div className="space-y-2">
          <Label htmlFor="node-label">Node Label</Label>
          <Input
            id="node-label"
            value={selectedNode.label}
            onChange={(e) => updateWorkflowNode(selectedNode.id, { label: e.target.value })}
            placeholder="Enter node label"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={config.description || ''}
            onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Enter node description..."
            rows={2}
          />
        </div>

        {/* Node-specific configuration */}
        {renderNodeSpecificConfig()}

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-4">
          <Button onClick={handleSave} className="flex-1">
            <Save className="w-4 h-4 mr-2" />
            Save Configuration
          </Button>
          <Button variant="outline" onClick={handleClose} className="flex-1">
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}