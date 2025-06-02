import { WorkflowNode, WorkflowConnection, ChatMessage } from "@shared/schema";
import { aiService } from "./ai-service";

export interface WorkflowContext {
  variables: Record<string, any>;
  messages: ChatMessage[];
  currentNodeId?: string;
  userId: number;
  assistantId?: number;
}

export interface ExecutionResult {
  success: boolean;
  data?: any;
  error?: string;
  nextNodeId?: string;
}

export class WorkflowExecutionEngine {
  private nodes: Map<string, WorkflowNode> = new Map();
  private connections: Map<string, WorkflowConnection[]> = new Map();

  constructor(nodes: WorkflowNode[], connections: WorkflowConnection[]) {
    // Build node map
    nodes.forEach(node => {
      this.nodes.set(node.id, node);
    });

    // Build connection map (outgoing connections from each node)
    connections.forEach(connection => {
      const existing = this.connections.get(connection.source) || [];
      existing.push(connection);
      this.connections.set(connection.source, existing);
    });
  }

  async executeWorkflow(
    startNodeId: string, 
    context: WorkflowContext
  ): Promise<WorkflowContext> {
    let currentNodeId = startNodeId;
    let executionCount = 0;
    const maxExecutions = 50; // Prevent infinite loops

    while (currentNodeId && executionCount < maxExecutions) {
      const node = this.nodes.get(currentNodeId);
      if (!node) {
        console.error(`Node ${currentNodeId} not found`);
        break;
      }

      context.currentNodeId = currentNodeId;
      
      try {
        const result = await this.executeNode(node, context);
        
        if (!result.success) {
          console.error(`Node ${currentNodeId} execution failed:`, result.error);
          break;
        }

        // Update context with result data
        if (result.data) {
          context.variables = { ...context.variables, ...result.data };
        }

        // Determine next node
        currentNodeId = await this.getNextNode(node, result, context);
        
      } catch (error) {
        console.error(`Error executing node ${currentNodeId}:`, error);
        break;
      }

      executionCount++;
    }

    if (executionCount >= maxExecutions) {
      console.warn('Workflow execution stopped: maximum executions reached');
    }

    return context;
  }

  private async executeNode(
    node: WorkflowNode, 
    context: WorkflowContext
  ): Promise<ExecutionResult> {
    switch (node.type) {
      case 'trigger':
        return this.executeTrigger(node, context);
      
      case 'ai_action':
        return this.executeAIAction(node, context);
      
      case 'condition':
        return this.executeCondition(node, context);
      
      case 'output':
        return this.executeOutput(node, context);
      
      default:
        return {
          success: false,
          error: `Unknown node type: ${node.type}`
        };
    }
  }

  private async executeTrigger(
    node: WorkflowNode, 
    context: WorkflowContext
  ): Promise<ExecutionResult> {
    const { triggerType, eventData } = node.data;
    
    switch (triggerType) {
      case 'manual':
        // Manual triggers are always successful
        return { success: true, data: { triggered: true } };
      
      case 'message':
        // Message triggers activate when a message is received
        const lastMessage = context.messages[context.messages.length - 1];
        if (lastMessage && lastMessage.role === 'user') {
          return { 
            success: true, 
            data: { 
              message: lastMessage.content,
              timestamp: lastMessage.timestamp
            }
          };
        }
        return { success: false, error: 'No user message found' };
      
      case 'schedule':
        // For now, always trigger (real scheduling would need external system)
        return { success: true, data: { scheduledTime: new Date().toISOString() } };
      
      default:
        return { success: false, error: `Unknown trigger type: ${triggerType}` };
    }
  }

  private async executeAIAction(
    node: WorkflowNode, 
    context: WorkflowContext
  ): Promise<ExecutionResult> {
    const { prompt, model, temperature } = node.data;
    
    if (!prompt) {
      return { success: false, error: 'No prompt specified for AI action' };
    }

    try {
      // Replace variables in prompt
      const processedPrompt = this.replaceVariables(prompt, context);
      
      // Build conversation history for context
      const messages = context.messages.map(msg => ({
        role: msg.role as "user" | "assistant",
        content: msg.content
      }));

      // Add the current prompt
      messages.push({
        role: "user" as const,
        content: processedPrompt
      });

      // Get AI response
      const response = await aiService.generateResponse(
        messages,
        model || 'gpt-4o',
        (temperature || 50) / 100 // Convert from 0-100 to 0-1
      );

      return {
        success: true,
        data: {
          aiResponse: response,
          prompt: processedPrompt
        }
      };

    } catch (error) {
      return {
        success: false,
        error: `AI action failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async executeCondition(
    node: WorkflowNode, 
    context: WorkflowContext
  ): Promise<ExecutionResult> {
    const { condition, variable, operator, value } = node.data;
    
    if (!condition && !variable) {
      return { success: false, error: 'No condition specified' };
    }

    try {
      let result = false;

      if (condition) {
        // Simple condition evaluation
        result = this.evaluateCondition(condition, context);
      } else if (variable && operator && value !== undefined) {
        // Variable-based condition
        const varValue = context.variables[variable];
        result = this.evaluateComparison(varValue, operator, value);
      }

      return {
        success: true,
        data: {
          conditionResult: result,
          conditionMet: result
        }
      };

    } catch (error) {
      return {
        success: false,
        error: `Condition evaluation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async executeOutput(
    node: WorkflowNode, 
    context: WorkflowContext
  ): Promise<ExecutionResult> {
    const { outputType, content, channel } = node.data;
    
    try {
      const processedContent = this.replaceVariables(content || '', context);
      
      switch (outputType) {
        case 'message':
          // Add to messages in context
          const message: ChatMessage = {
            id: `output_${Date.now()}`,
            role: 'assistant',
            content: processedContent,
            timestamp: new Date().toISOString()
          };
          context.messages.push(message);
          break;
        
        case 'variable':
          // Store in variables
          const variableName = node.data.variableName || 'output';
          context.variables[variableName] = processedContent;
          break;
        
        case 'webhook':
          // For now, just log (real implementation would make HTTP request)
          console.log('Webhook output:', processedContent);
          break;
        
        default:
          console.log('Output:', processedContent);
      }

      return {
        success: true,
        data: {
          output: processedContent,
          outputType
        }
      };

    } catch (error) {
      return {
        success: false,
        error: `Output execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async getNextNode(
    currentNode: WorkflowNode,
    result: ExecutionResult,
    context: WorkflowContext
  ): Promise<string | null> {
    const connections = this.connections.get(currentNode.id) || [];
    
    if (connections.length === 0) {
      return null; // End of workflow
    }

    // For condition nodes, choose path based on result
    if (currentNode.type === 'condition') {
      const conditionMet = result.data?.conditionMet || false;
      
      // Look for connections with specific conditions
      const trueConnection = connections.find(conn => 
        (conn as any).condition === 'true' || (conn as any).condition === true
      );
      const falseConnection = connections.find(conn => 
        (conn as any).condition === 'false' || (conn as any).condition === false
      );
      
      if (conditionMet && trueConnection) {
        return trueConnection.target;
      } else if (!conditionMet && falseConnection) {
        return falseConnection.target;
      }
    }

    // Default: take first connection
    return connections[0]?.target || null;
  }

  private replaceVariables(text: string, context: WorkflowContext): string {
    let result = text;
    
    // Replace context variables
    Object.entries(context.variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      result = result.replace(regex, String(value));
    });
    
    // Replace built-in variables
    result = result.replace(/{{user_id}}/g, String(context.userId));
    result = result.replace(/{{timestamp}}/g, new Date().toISOString());
    
    // Replace message content
    const lastMessage = context.messages[context.messages.length - 1];
    if (lastMessage) {
      result = result.replace(/{{last_message}}/g, lastMessage.content);
      result = result.replace(/{{message}}/g, lastMessage.content);
    }
    
    return result;
  }

  private evaluateCondition(condition: string, context: WorkflowContext): boolean {
    // Simple condition evaluation
    // In a real implementation, you might use a proper expression parser
    
    if (condition.includes('contains')) {
      const [variable, searchTerm] = condition.split('contains').map(s => s.trim());
      const value = context.variables[variable.replace(/[{}]/g, '')] || '';
      return String(value).toLowerCase().includes(searchTerm.replace(/['"]/g, '').toLowerCase());
    }
    
    if (condition.includes('equals')) {
      const [variable, expectedValue] = condition.split('equals').map(s => s.trim());
      const value = context.variables[variable.replace(/[{}]/g, '')] || '';
      return String(value) === expectedValue.replace(/['"]/g, '');
    }
    
    return false;
  }

  private evaluateComparison(value1: any, operator: string, value2: any): boolean {
    switch (operator) {
      case 'equals':
      case '==':
        return value1 == value2;
      case 'not_equals':
      case '!=':
        return value1 != value2;
      case 'greater_than':
      case '>':
        return Number(value1) > Number(value2);
      case 'less_than':
      case '<':
        return Number(value1) < Number(value2);
      case 'contains':
        return String(value1).toLowerCase().includes(String(value2).toLowerCase());
      default:
        return false;
    }
  }
}

// Utility function to create a workflow engine from workflow data
export function createWorkflowEngine(
  nodes: WorkflowNode[],
  connections: WorkflowConnection[]
): WorkflowExecutionEngine {
  return new WorkflowExecutionEngine(nodes, connections);
}