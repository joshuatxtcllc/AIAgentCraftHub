import { useCallback, useRef } from 'react';
import { type WorkflowNode } from '@shared/schema';
import { useAssistantStore } from '@/store/assistant-store';

export interface DragItem {
  type: string;
  nodeType: 'trigger' | 'ai_action' | 'condition' | 'output';
  label: string;
}

export function useDragDrop() {
  const { addWorkflowNode, setIsDragging } = useAssistantStore();
  const dragCounter = useRef(0);

  const handleDragStart = useCallback((e: React.DragEvent, item: DragItem) => {
    e.dataTransfer.setData('application/json', JSON.stringify(item));
    e.dataTransfer.effectAllowed = 'copy';
    setIsDragging(true);
  }, [setIsDragging]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    dragCounter.current = 0;
  }, [setIsDragging]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current++;
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current--;
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current = 0;
    setIsDragging(false);

    try {
      const itemData = e.dataTransfer.getData('application/json');
      const item: DragItem = JSON.parse(itemData);
      
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const newNode: WorkflowNode = {
        id: `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: item.nodeType,
        label: item.label,
        position: { x: Math.max(0, x - 100), y: Math.max(0, y - 25) },
        data: {}
      };

      console.log('Adding workflow node:', newNode);
      addWorkflowNode(newNode);
    } catch (error) {
      console.error('Failed to parse drop data:', error);
    }
  }, [addWorkflowNode, setIsDragging]);

  return {
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
  };
}
