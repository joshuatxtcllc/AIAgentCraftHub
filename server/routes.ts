import type { Express } from "express";
import { createServer, type Server } from "http";
import { aiService } from "./ai-service";
import { createWorkflowEngine, WorkflowContext } from "./workflow-engine";
import { 
  insertAssistantSchema, insertWorkflowSchema, insertConversationSchema, 
  insertActivitySchema, type ChatMessage 
} from "@shared/schema";
import { z } from "zod";
import { db } from './db';
import * as schema from '@shared/schema';

export async function registerRoutes(app: Express): Promise<Server> {
  // Assistant routes
  app.get("/api/assistants", async (req, res) => {
    try {
      const assistants = await db.select().from(schema.assistants);
      res.json(assistants);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch assistants" });
    }
  });

  app.get("/api/assistants/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const assistant = await storage.getAssistant(id);
      if (!assistant) {
        return res.status(404).json({ message: "Assistant not found" });
      }
      res.json(assistant);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch assistant" });
    }
  });

  app.post("/api/assistants", async (req, res) => {
    try {
      const assistantData = insertAssistantSchema.parse(req.body);
      const assistant = await storage.createAssistant(assistantData);

      // Create activity
      await storage.createActivity({
        type: "deployment",
        message: `${assistant.name} created successfully`,
        userId: 1 // Default user for now
      });

      res.status(201).json(assistant);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid assistant data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create assistant" });
    }
  });

  app.put("/api/assistants/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);

      if (id === 0) {
        return res.status(400).json({ message: "Invalid assistant ID" });
      }

      const assistantData = insertAssistantSchema.partial().parse(req.body);
      const assistant = await storage.updateAssistant(id, assistantData);

      if (!assistant) {
        return res.status(404).json({ message: "Assistant not found" });
      }

      res.json(assistant);
    } catch (error) {
      console.error("Update assistant error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid assistant data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update assistant" });
    }
  });

  app.delete("/api/assistants/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteAssistant(id);
      if (!deleted) {
        return res.status(404).json({ message: "Assistant not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete assistant" });
    }
  });

  // Workflow routes
  app.get("/api/workflows", async (req, res) => {
    try {
      const workflows = await storage.getWorkflows();
      res.json(workflows);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch workflows" });
    }
  });

  app.get("/api/workflows/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const workflow = await storage.getWorkflow(id);
      if (!workflow) {
        return res.status(404).json({ message: "Workflow not found" });
      }
      res.json(workflow);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch workflow" });
    }
  });

  app.post("/api/workflows", async (req, res) => {
    try {
      const workflowData = insertWorkflowSchema.parse(req.body);
      const workflow = await storage.createWorkflow(workflowData);

      // Create activity
      await storage.createActivity({
        type: "workflow_created",
        message: `New workflow created: ${workflow.name}`,
        userId: 1
      });

      res.status(201).json(workflow);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid workflow data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create workflow" });
    }
  });

  app.put("/api/workflows/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const workflowData = insertWorkflowSchema.partial().parse(req.body);
      const workflow = await storage.updateWorkflow(id, workflowData);

      if (!workflow) {
        return res.status(404).json({ message: "Workflow not found" });
      }

      res.json(workflow);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid workflow data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update workflow" });
    }
  });

  app.get('/api/templates', async (req, res) => {
    try {
      const templates = await db.select().from(schema.templates);
      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch templates' });
    }
  });

  app.get("/api/templates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const template = await storage.getTemplate(id);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      res.json(template);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch template" });
    }
  });

  app.post("/api/templates/:id/use", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const template = await storage.getTemplate(id);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }

      // Increment usage count
      await storage.incrementTemplateUsage(id);

      // Create assistant from template
      const assistant = await storage.createAssistant({
        ...template.config,
        userId: 1,
      });

      // Create workflow if template has one
      if (template.workflow) {
        await storage.createWorkflow({
          name: `${template.name} Workflow`,
          description: `Workflow for ${template.name}`,
          nodes: template.workflow.nodes,
          connections: template.workflow.connections,
          assistantId: assistant.id
        });
      }

      // Create activity
      await storage.createActivity({
        type: "template_used",
        message: `Created assistant from template: ${template.name}`,
        userId: 1
      });

      res.json(assistant);
    } catch (error) {
      res.status(500).json({ message: "Failed to use template" });
    }
  });

  // Conversation routes
  app.get("/api/conversations", async (req, res) => {
    try {
      const conversations = await storage.getConversations();
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  app.post("/api/conversations", async (req, res) => {
    try {
      const conversationData = insertConversationSchema.parse(req.body);
      const conversation = await storage.createConversation(conversationData);
      res.status(201).json(conversation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid conversation data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create conversation" });
    }
  });

  // Chat message route
  const chatMessageSchema = z.object({
    conversationId: z.number().optional(),
    assistantId: z.number(),
    message: z.string().min(1),
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const { conversationId, assistantId, message } = chatMessageSchema.parse(req.body);

      let conversation;
      if (conversationId) {
        conversation = await storage.getConversation(conversationId);
        if (!conversation) {
          return res.status(404).json({ message: "Conversation not found" });
        }
      } else {
        // Create new conversation
        conversation = await storage.createConversation({
          assistantId,
          messages: []
        });
      }

      // Get assistant details for AI configuration
      const assistant = await storage.getAssistant(assistantId);
      if (!assistant) {
        return res.status(404).json({ message: "Assistant not found" });
      }

      // Add user message
      const userMessage: ChatMessage = {
        id: `msg_${Date.now()}_user`,
        role: "user",
        content: message,
        timestamp: new Date().toISOString()
      };

      try {
        // Check if assistant has workflows to execute
        const workflows = await storage.getWorkflowsByAssistant(assistantId);
        let finalResponse = "";
        let workflowExecuted = false;

        if (workflows.length > 0) {
          // Execute workflows with message triggers
          for (const workflow of workflows) {
            if (workflow.nodes && workflow.connections) {
              const engine = createWorkflowEngine(workflow.nodes, workflow.connections);

              // Find trigger nodes that respond to messages
              const triggerNodes = workflow.nodes.filter(node => 
                node.type === 'trigger' && 
                (node.data.triggerType === 'message' || node.data.triggerType === 'manual')
              );

              for (const triggerNode of triggerNodes) {
                const context: WorkflowContext = {
                  variables: {},
                  messages: [...(conversation.messages || []), userMessage],
                  userId: 1,
                  assistantId: assistantId
                };

                try {
                  const resultContext = await engine.executeWorkflow(triggerNode.id, context);

                  // Check if workflow produced any assistant messages
                  const workflowMessages = resultContext.messages.filter(msg => 
                    msg.role === 'assistant' && 
                    msg.timestamp > userMessage.timestamp
                  );

                  if (workflowMessages.length > 0) {
                    finalResponse = workflowMessages[workflowMessages.length - 1].content;
                    workflowExecuted = true;
                    break;
                  }
                } catch (workflowError) {
                  console.error(`Workflow execution error:`, workflowError);
                }
              }

              if (workflowExecuted) break;
            }
          }
        }

        // If no workflow produced a response, use direct AI service
        if (!workflowExecuted) {
          finalResponse = await aiService.generateResponse(
            [...(conversation.messages || []), userMessage],
            assistant.model,
            assistant.temperature || 30,
            assistant.instructions || undefined
          );
        }

        const aiMessage: ChatMessage = {
          id: `msg_${Date.now()}_ai`,
          role: "assistant", 
          content: finalResponse,
          timestamp: new Date().toISOString()
        };

        const updatedMessages = [...(conversation.messages || []), userMessage, aiMessage];

        // Update conversation
        const updatedConversation = await storage.updateConversation(conversation.id, {
          messages: updatedMessages
        });

        // Create activity
        await storage.createActivity({
          type: "conversation",
          message: `${workflowExecuted ? 'Workflow-driven' : 'Direct'} conversation with ${assistant.name}`,
          userId: 1
        });

        res.json({
          conversation: updatedConversation,
          response: aiMessage,
          workflowExecuted
        });

      } catch (aiError) {
        console.error("AI Service Error:", aiError);

        // Fallback to a helpful error message
        const errorMessage: ChatMessage = {
          id: `msg_${Date.now()}_error`,
          role: "assistant",
          content: `I apologize, but I'm having trouble connecting to the AI service right now. ${aiError instanceof Error ? aiError.message : 'Please try again in a moment.'}`,
          timestamp: new Date().toISOString()
        };

        const updatedMessages = [...(conversation.messages || []), userMessage, errorMessage];

        const updatedConversation = await storage.updateConversation(conversation.id, {
          messages: updatedMessages
        });

        res.json({
          conversation: updatedConversation,
          response: errorMessage
        });
      }

    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid chat data", errors: error.errors });
      }
      console.error("Chat route error:", error);
      res.status(500).json({ message: "Failed to process chat message" });
    }
  });

  // Activity routes
  app.get("/api/activities", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const activities = await storage.getActivities(limit);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  // Stats route
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getAssistantStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Workflow execution routes
  app.post("/api/workflows/:id/execute", async (req, res) => {
    try {
      const workflowId = parseInt(req.params.id);
      const { trigger, variables = {} } = req.body;

      const workflow = await storage.getWorkflow(workflowId);
      if (!workflow) {
        return res.status(404).json({ error: "Workflow not found" });
      }

      if (!workflow.nodes || !workflow.connections) {
        return res.status(400).json({ error: "Workflow has no nodes or connections" });
      }

      const engine = createWorkflowEngine(workflow.nodes, workflow.connections);

      // Find trigger node
      const triggerNode = workflow.nodes.find(node => 
        node.type === 'trigger' && 
        (trigger ? node.id === trigger : true)
      );

      if (!triggerNode) {
        return res.status(400).json({ error: "No trigger node found" });
      }

      const context: WorkflowContext = {
        variables,
        messages: [],
        userId: 1,
        assistantId: workflow.assistantId || undefined
      };

      const result = await engine.executeWorkflow(triggerNode.id, context);

      // Create activity
      await storage.createActivity({
        type: "workflow_execution",
        message: `Executed workflow: ${workflow.name}`,
        userId: 1
      });

      res.json({
        success: true,
        context: result,
        executedNodes: Object.keys(result.variables).length > 0 ? "Variables updated" : "No variables updated",
        messages: result.messages
      });

    } catch (error) {
      console.error("Workflow execution error:", error);
      res.status(500).json({ 
        error: "Failed to execute workflow",
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

function generateMockResponse(userMessage: string): string {
  const responses = [
    "I understand you'd like help with that. Let me analyze your request and provide a detailed solution...",
    "That's a great question! Based on your inquiry, I recommend the following approach:",
    "I can definitely help you with that. Here are some suggestions:",
    "Let me walk you through the process step by step:",
    "I'll help you create a workflow for that. Here's what I recommend:",
  ];

  const randomResponse = responses[Math.floor(Math.random() * responses.length)];

  if (userMessage.toLowerCase().includes("workflow") || userMessage.toLowerCase().includes("refund")) {
    return `I'll help you create a refund processing workflow! Here's what I recommend:

📋 **Step 1:** Validate refund request
💳 **Step 2:** Check payment method  
⚖️ **Step 3:** Apply refund policy rules
✅ **Step 4:** Process or escalate

Would you like me to create this workflow for you?`;
  }

  return randomResponse;
}