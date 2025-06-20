import { type WorkflowNode } from '@shared/schema';
import { cn } from '@/lib/utils';
import { useAssistantStore } from '@/store/assistant-store';
import { Play, Bot, GitBranch, CheckCircle, X } from 'lucide-react';

interface WorkflowNodeComponentProps {
  node: WorkflowNode;
  isSelected?: boolean;
  onSelect?: (nodeId: string) => void;
  onDelete?: (nodeId: string) => void;
}

const nodeTypeConfig = {
  trigger: {
    icon: Play,
    color: 'bg-secondary',
    textColor: 'text-white',
    borderColor: 'border-secondary'
  },
  ai_action: {
    icon: Bot,
    color: 'bg-primary',
    textColor: 'text-white', 
    borderColor: 'border-primary'
  },
  condition: {
    icon: GitBranch,
    color: 'bg-accent',
    textColor: 'text-accent-foreground',
    borderColor: 'border-accent'
  },
  output: {
    icon: CheckCircle,
    color: 'bg-secondary',
    textColor: 'text-white',
    borderColor: 'border-secondary'
  }
};

export function WorkflowNodeComponent({ 
  node, 
  isSelected = false, 
  onSelect, 
  onDelete 
}: WorkflowNodeComponentProps) {
  const { updateWorkflowNode } = useAssistantStore();
  const config = nodeTypeConfig[node.type];
  const Icon = config.icon;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect?.(node.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(node.id);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', node.id);
  };

  return (
    <div
      className={cn(
        "absolute bg-card rounded-xl p-4 shadow-lg border-2 max-w-48 cursor-pointer transition-all hover:shadow-xl group",
        isSelected ? config.borderColor : "border-border",
        "drag-handle"
      )}
      style={{
        left: node.position.x,
        top: node.position.y,
        transform: 'translate(-50%, -50%)'
      }}
      onClick={handleClick}
      draggable
      onDragStart={handleDrag}
    >
      {/* Delete button */}
      <button
        onClick={handleDelete}
        className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-destructive/80"
      >
        <X className="w-3 h-3" />
      </button>

      <div className="flex items-center space-x-2 mb-2">
        <div className={cn("w-3 h-3 rounded-full", config.color)}></div>
        <span className="text-sm font-medium text-foreground">{node.label}</span>
      </div>

      <p className="text-xs text-muted-foreground">
        {getNodeDescription(node.type)}
      </p>

      <div className="flex items-center space-x-2 mt-3">
        <span className={cn(
          "text-xs px-2 py-1 rounded font-medium",
          config.color.replace('bg-', 'bg-') + '/10',
          config.textColor.replace('text-white', 'text-') + config.color.replace('bg-', '')
        )}>
          <Icon className="w-3 h-3 inline mr-1" />
          {node.type.replace('_', ' ').toUpperCase()}
        </span>
      </div>
    </div>
  );
}

function getNodeDescription(type: WorkflowNode['type']): string {
  switch (type) {
    case 'trigger':
      return 'Workflow begins when triggered';
    case 'ai_action':
      return 'AI processes and analyzes data';
    case 'condition':
      return 'Routes based on conditions';
    case 'output':
      return 'Final action or response';
    default:
      return 'Workflow component';
  }
}