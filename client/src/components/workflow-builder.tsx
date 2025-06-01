import { useEffect, useRef } from 'react';
import { useAssistantStore } from '@/store/assistant-store';
import { useDragDrop, type DragItem } from '@/hooks/use-drag-drop';
import { WorkflowNodeComponent } from './workflow-node';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Bot, GitBranch, CheckCircle, Plus, Save, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

const workflowComponents: DragItem[] = [
  { type: 'trigger', nodeType: 'trigger', label: 'Trigger' },
  { type: 'ai_action', nodeType: 'ai_action', label: 'AI Action' },
  { type: 'condition', nodeType: 'condition', label: 'Condition' },
  { type: 'output', nodeType: 'output', label: 'Output' },
];

const componentIcons = {
  trigger: Play,
  ai_action: Bot,
  condition: GitBranch,
  output: CheckCircle,
};

const componentColors = {
  trigger: 'bg-blue-500',
  ai_action: 'bg-primary',
  condition: 'bg-accent',
  output: 'bg-secondary',
};

export function WorkflowBuilder() {
  const { 
    workflowNodes, 
    workflowConnections, 
    selectedNodeId, 
    setSelectedNodeId, 
    removeWorkflowNode,
    isDragging 
  } = useAssistantStore();
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  
  const {
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
  } = useDragDrop();

  // Update SVG connections when nodes change
  useEffect(() => {
    updateConnections();
  }, [workflowNodes, workflowConnections]);

  const updateConnections = () => {
    if (!svgRef.current) return;
    
    const svg = svgRef.current;
    svg.innerHTML = '';
    
    // Create arrow marker
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    marker.setAttribute('id', 'arrowhead');
    marker.setAttribute('markerWidth', '10');
    marker.setAttribute('markerHeight', '7');
    marker.setAttribute('refX', '9');
    marker.setAttribute('refY', '3.5');
    marker.setAttribute('orient', 'auto');
    
    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    polygon.setAttribute('points', '0 0, 10 3.5, 0 7');
    polygon.setAttribute('fill', '#6366F1');
    
    marker.appendChild(polygon);
    defs.appendChild(marker);
    svg.appendChild(defs);
    
    // Draw connections
    workflowConnections.forEach(connection => {
      const sourceNode = workflowNodes.find(n => n.id === connection.source);
      const targetNode = workflowNodes.find(n => n.id === connection.target);
      
      if (sourceNode && targetNode) {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const sourceX = sourceNode.position.x + 100; // Half node width
        const sourceY = sourceNode.position.y + 25; // Half node height
        const targetX = targetNode.position.x - 100;
        const targetY = targetNode.position.y + 25;
        
        const controlX = sourceX + (targetX - sourceX) / 2;
        const d = `M ${sourceX} ${sourceY} Q ${controlX} ${sourceY} ${targetX} ${targetY}`;
        
        path.setAttribute('d', d);
        path.setAttribute('stroke', '#6366F1');
        path.setAttribute('stroke-width', '2');
        path.setAttribute('fill', 'none');
        path.setAttribute('marker-end', 'url(#arrowhead)');
        
        svg.appendChild(path);
      }
    });
  };

  const handleNodeSelect = (nodeId: string) => {
    setSelectedNodeId(selectedNodeId === nodeId ? null : nodeId);
  };

  const handleNodeDelete = (nodeId: string) => {
    removeWorkflowNode(nodeId);
    if (selectedNodeId === nodeId) {
      setSelectedNodeId(null);
    }
  };

  const handleSaveWorkflow = () => {
    // TODO: Implement workflow saving
    console.log('Saving workflow:', { workflowNodes, workflowConnections });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold">Workflow Builder</CardTitle>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">
              <Layers className="w-4 h-4 mr-2" />
              Templates
            </Button>
            <Button size="sm" onClick={handleSaveWorkflow}>
              <Save className="w-4 h-4 mr-2" />
              Save Workflow
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Workflow Canvas */}
        <div className="relative">
          <div
            ref={canvasRef}
            className={cn(
              "bg-muted/30 rounded-lg p-6 min-h-96 border-2 border-dashed relative overflow-hidden",
              isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25"
            )}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {/* SVG for connections */}
            <svg
              ref={svgRef}
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ zIndex: 1 }}
            />
            
            {/* Workflow Nodes */}
            <div className="relative" style={{ zIndex: 2 }}>
              {workflowNodes.map(node => (
                <WorkflowNodeComponent
                  key={node.id}
                  node={node}
                  isSelected={selectedNodeId === node.id}
                  onSelect={handleNodeSelect}
                  onDelete={handleNodeDelete}
                />
              ))}
            </div>
            
            {/* Empty State */}
            {workflowNodes.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">
                    Drag components here to build your workflow
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Workflow Components Palette */}
        <div>
          <h3 className="text-sm font-medium text-foreground mb-3">Workflow Components</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {workflowComponents.map((component) => {
              const Icon = componentIcons[component.nodeType as keyof typeof componentIcons];
              const colorClass = componentColors[component.nodeType as keyof typeof componentColors];
              
              return (
                <div
                  key={component.type}
                  className="bg-muted/50 rounded-lg p-3 border border-border hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer drag-handle"
                  draggable
                  onDragStart={(e) => handleDragStart(e, component)}
                  onDragEnd={handleDragEnd}
                >
                  <div className="flex items-center space-x-2">
                    <div className={cn("w-4 h-4 rounded", colorClass)}>
                      <Icon className="w-3 h-3 text-white m-0.5" />
                    </div>
                    <span className="text-xs font-medium">{component.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
