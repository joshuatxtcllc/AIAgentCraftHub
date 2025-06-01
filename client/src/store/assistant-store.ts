import { create } from 'zustand';
import { type Assistant, type Workflow, type ChatMessage, type WorkflowNode, type WorkflowConnection } from '@shared/schema';

interface AssistantStore {
  // Current assistant being edited
  currentAssistant: Assistant | null;
  setCurrentAssistant: (assistant: Assistant | null) => void;
  
  // Current workflow being edited
  currentWorkflow: Workflow | null;
  setCurrentWorkflow: (workflow: Workflow | null) => void;
  
  // Workflow builder state
  workflowNodes: WorkflowNode[];
  workflowConnections: WorkflowConnection[];
  addWorkflowNode: (node: WorkflowNode) => void;
  updateWorkflowNode: (id: string, updates: Partial<WorkflowNode>) => void;
  removeWorkflowNode: (id: string) => void;
  addWorkflowConnection: (connection: WorkflowConnection) => void;
  removeWorkflowConnection: (id: string) => void;
  clearWorkflow: () => void;
  
  // Chat state
  currentConversationId: number | null;
  chatMessages: ChatMessage[];
  setChatMessages: (messages: ChatMessage[]) => void;
  addChatMessage: (message: ChatMessage) => void;
  clearChat: () => void;
  
  // UI state
  selectedNodeId: string | null;
  setSelectedNodeId: (id: string | null) => void;
  
  isDragging: boolean;
  setIsDragging: (dragging: boolean) => void;
}

export const useAssistantStore = create<AssistantStore>((set, get) => ({
  // Current assistant
  currentAssistant: null,
  setCurrentAssistant: (assistant) => set({ currentAssistant: assistant }),
  
  // Current workflow
  currentWorkflow: null,
  setCurrentWorkflow: (workflow) => set({ currentWorkflow: workflow }),
  
  // Workflow builder
  workflowNodes: [],
  workflowConnections: [],
  
  addWorkflowNode: (node) => set((state) => ({
    workflowNodes: [...state.workflowNodes, node]
  })),
  
  updateWorkflowNode: (id, updates) => set((state) => ({
    workflowNodes: state.workflowNodes.map(node => 
      node.id === id ? { ...node, ...updates } : node
    )
  })),
  
  removeWorkflowNode: (id) => set((state) => ({
    workflowNodes: state.workflowNodes.filter(node => node.id !== id),
    workflowConnections: state.workflowConnections.filter(
      conn => conn.source !== id && conn.target !== id
    )
  })),
  
  addWorkflowConnection: (connection) => set((state) => ({
    workflowConnections: [...state.workflowConnections, connection]
  })),
  
  removeWorkflowConnection: (id) => set((state) => ({
    workflowConnections: state.workflowConnections.filter(conn => conn.id !== id)
  })),
  
  clearWorkflow: () => set({
    workflowNodes: [],
    workflowConnections: []
  }),
  
  // Chat
  currentConversationId: null,
  chatMessages: [],
  
  setChatMessages: (messages) => set({ chatMessages: messages }),
  
  addChatMessage: (message) => set((state) => ({
    chatMessages: [...state.chatMessages, message]
  })),
  
  clearChat: () => set({
    chatMessages: [],
    currentConversationId: null
  }),
  
  // UI state
  selectedNodeId: null,
  setSelectedNodeId: (id) => set({ selectedNodeId: id }),
  
  isDragging: false,
  setIsDragging: (dragging) => set({ isDragging: dragging }),
}));
