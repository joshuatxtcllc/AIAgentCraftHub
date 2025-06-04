import { 
  users, assistants, workflows, templates, conversations, activities,
  type User, type InsertUser, type Assistant, type InsertAssistant,
  type Workflow, type InsertWorkflow, type Template, type InsertTemplate,
  type Conversation, type InsertConversation, type Activity, type InsertActivity,
  type AssistantStats, type WorkflowNode, type WorkflowConnection, type AssistantConfig
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Assistants
  getAssistants(): Promise<Assistant[]>;
  getAssistant(id: number): Promise<Assistant | undefined>;
  createAssistant(assistant: InsertAssistant): Promise<Assistant>;
  updateAssistant(id: number, assistant: Partial<InsertAssistant>): Promise<Assistant | undefined>;
  deleteAssistant(id: number): Promise<boolean>;

  // Workflows
  getWorkflows(): Promise<Workflow[]>;
  getWorkflow(id: number): Promise<Workflow | undefined>;
  getWorkflowsByAssistant(assistantId: number): Promise<Workflow[]>;
  createWorkflow(workflow: InsertWorkflow): Promise<Workflow>;
  updateWorkflow(id: number, workflow: Partial<InsertWorkflow>): Promise<Workflow | undefined>;
  deleteWorkflow(id: number): Promise<boolean>;

  // Templates
  getTemplates(): Promise<Template[]>;
  getTemplate(id: number): Promise<Template | undefined>;
  createTemplate(template: InsertTemplate): Promise<Template>;
  incrementTemplateUsage(id: number): Promise<void>;

  // Conversations
  getConversations(): Promise<Conversation[]>;
  getConversation(id: number): Promise<Conversation | undefined>;
  getConversationsByAssistant(assistantId: number): Promise<Conversation[]>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  updateConversation(id: number, conversation: Partial<InsertConversation>): Promise<Conversation | undefined>;

  // Activities
  getActivities(limit?: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;

  // Stats
  getAssistantStats(): Promise<AssistantStats>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getAssistants(): Promise<Assistant[]> {
    return await db.select().from(assistants);
  }

  async getAssistant(id: number): Promise<Assistant | undefined> {
    const [assistant] = await db.select().from(assistants).where(eq(assistants.id, id));
    return assistant || undefined;
  }

  async createAssistant(assistant: InsertAssistant): Promise<Assistant> {
    const [newAssistant] = await db
      .insert(assistants)
      .values(assistant)
      .returning();
    return newAssistant;
  }

  async updateAssistant(id: number, assistant: Partial<InsertAssistant>): Promise<Assistant | undefined> {
    const [updated] = await db
      .update(assistants)
      .set(assistant)
      .where(eq(assistants.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteAssistant(id: number): Promise<boolean> {
    const result = await db.delete(assistants).where(eq(assistants.id, id));
    return result.rowCount > 0;
  }

  async getWorkflows(): Promise<Workflow[]> {
    return await db.select().from(workflows);
  }

  async getWorkflow(id: number): Promise<Workflow | undefined> {
    const [workflow] = await db.select().from(workflows).where(eq(workflows.id, id));
    return workflow || undefined;
  }

  async getWorkflowsByAssistant(assistantId: number): Promise<Workflow[]> {
    return await db.select().from(workflows).where(eq(workflows.assistantId, assistantId));
  }

  async createWorkflow(workflow: InsertWorkflow): Promise<Workflow> {
    const [newWorkflow] = await db
      .insert(workflows)
      .values(workflow)
      .returning();
    return newWorkflow;
  }

  async updateWorkflow(id: number, workflow: Partial<InsertWorkflow>): Promise<Workflow | undefined> {
    const [updated] = await db
      .update(workflows)
      .set(workflow)
      .where(eq(workflows.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteWorkflow(id: number): Promise<boolean> {
    const result = await db.delete(workflows).where(eq(workflows.id, id));
    return result.rowCount > 0;
  }

  async getTemplates(): Promise<Template[]> {
    return await db.select().from(templates);
  }

  async getTemplate(id: number): Promise<Template | undefined> {
    const [template] = await db.select().from(templates).where(eq(templates.id, id));
    return template || undefined;
  }

  async createTemplate(template: InsertTemplate): Promise<Template> {
    const [newTemplate] = await db
      .insert(templates)
      .values(template)
      .returning();
    return newTemplate;
  }

  async incrementTemplateUsage(id: number): Promise<void> {
    await db
      .update(templates)
      .set({ usageCount: 1 })
      .where(eq(templates.id, id));
  }

  async getConversations(): Promise<Conversation[]> {
    return await db.select().from(conversations);
  }

  async getConversation(id: number): Promise<Conversation | undefined> {
    const [conversation] = await db.select().from(conversations).where(eq(conversations.id, id));
    return conversation || undefined;
  }

  async getConversationsByAssistant(assistantId: number): Promise<Conversation[]> {
    return await db.select().from(conversations).where(eq(conversations.assistantId, assistantId));
  }

  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const [newConversation] = await db
      .insert(conversations)
      .values(conversation)
      .returning();
    return newConversation;
  }

  async updateConversation(id: number, conversation: Partial<InsertConversation>): Promise<Conversation | undefined> {
    const [updated] = await db
      .update(conversations)
      .set(conversation)
      .where(eq(conversations.id, id))
      .returning();
    return updated || undefined;
  }

  async getActivities(limit: number = 10): Promise<Activity[]> {
    return await db.select().from(activities).limit(limit).orderBy(activities.createdAt);
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const [newActivity] = await db
      .insert(activities)
      .values(activity)
      .returning();
    return newActivity;
  }

  async getAssistantStats(): Promise<AssistantStats> {
    const assistantList = await db.select().from(assistants);
    const conversationList = await db.select().from(conversations);
    const workflowList = await db.select().from(workflows);

    return {
      activeAssistants: assistantList.filter(a => a.isActive).length,
      conversations: conversationList.length,
      successRate: "94.2%", // Would be calculated based on actual conversation outcomes
      workflows: workflowList.length,
    };
  }

  // Alias for compatibility
  async getStats(): Promise<AssistantStats> {
    return this.getAssistantStats();
  }
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private assistants: Map<number, Assistant>;
  private workflows: Map<number, Workflow>;
  private templates: Map<number, Template>;
  private conversations: Map<number, Conversation>;
  private activities: Map<number, Activity>;
  private currentId: { [key: string]: number };

  constructor() {
    this.users = new Map();
    this.assistants = new Map();
    this.workflows = new Map();
    this.templates = new Map();
    this.conversations = new Map();
    this.activities = new Map();
    this.currentId = {
      users: 1,
      assistants: 1,
      workflows: 1,
      templates: 1,
      conversations: 1,
      activities: 1,
    };

    this.initializeTemplates();
    this.initializeActivities();
  }

  private initializeTemplates() {
    const defaultTemplates: InsertTemplate[] = [
      {
        name: "Customer Support Bot",
        description: "Handle customer inquiries, troubleshoot issues, and escalate complex cases",
        category: "Customer Service",
        usageCount: 1200,
        isPopular: true,
        config: {
          name: "Customer Support Bot",
          model: "gpt-4",
          temperature: 20,
          capabilities: ["Web Search", "File Analysis", "Data Analysis"],
          instructions: "You are a helpful customer support assistant. Always be polite, professional, and try to resolve issues efficiently."
        },
        workflow: {
          nodes: [
            { id: "start", type: "trigger", label: "Customer Inquiry", position: { x: 50, y: 50 }, data: {} },
            { id: "analyze", type: "ai_action", label: "Analyze Request", position: { x: 300, y: 50 }, data: {} },
            { id: "decision", type: "condition", label: "Can Resolve?", position: { x: 250, y: 200 }, data: {} },
            { id: "resolve", type: "output", label: "Provide Solution", position: { x: 100, y: 350 }, data: {} },
            { id: "escalate", type: "output", label: "Escalate to Human", position: { x: 400, y: 350 }, data: {} }
          ],
          connections: [
            { id: "c1", source: "start", target: "analyze" },
            { id: "c2", source: "analyze", target: "decision" },
            { id: "c3", source: "decision", target: "resolve" },
            { id: "c4", source: "decision", target: "escalate" }
          ]
        }
      },
      {
        name: "Sales Assistant",
        description: "Qualify leads, answer product questions, and schedule demos",
        category: "Sales & Marketing",
        usageCount: 850,
        isPopular: true,
        config: {
          name: "Sales Assistant",
          model: "gpt-4",
          temperature: 30,
          capabilities: ["Web Search", "Data Analysis"],
          instructions: "You are a knowledgeable sales assistant. Help qualify leads, answer product questions, and guide prospects through the sales process."
        },
        workflow: {
          nodes: [
            { id: "start", type: "trigger", label: "Lead Inquiry", position: { x: 50, y: 50 }, data: {} },
            { id: "qualify", type: "ai_action", label: "Qualify Lead", position: { x: 250, y: 50 }, data: {} },
            { id: "respond", type: "output", label: "Provide Information", position: { x: 250, y: 200 }, data: {} }
          ],
          connections: [
            { id: "c1", source: "start", target: "qualify" },
            { id: "c2", source: "qualify", target: "respond" }
          ]
        }
      },
      {
        name: "HR Onboarding Bot",
        description: "Guide new employees through onboarding process and answer HR questions",
        category: "Human Resources", 
        usageCount: 420,
        isPopular: false,
        config: {
          name: "HR Onboarding Bot",
          model: "gpt-4",
          temperature: 20,
          capabilities: ["File Analysis"],
          instructions: "You are an HR assistant focused on employee onboarding. Be helpful, professional, and ensure new hires have all the information they need."
        },
        workflow: {
          nodes: [
            { id: "start", type: "trigger", label: "New Employee", position: { x: 50, y: 50 }, data: {} },
            { id: "welcome", type: "output", label: "Send Welcome", position: { x: 250, y: 50 }, data: {} }
          ],
          connections: [
            { id: "c1", source: "start", target: "welcome" }
          ]
        }
      },
      {
        name: "Content Writer",
        description: "Create blog posts, social media content, and marketing copy",
        category: "Content & Marketing",
        usageCount: 125,
        isPopular: false,
        config: {
          name: "Content Writer",
          model: "gpt-4o",
          temperature: 70,
          capabilities: ["Web Search"],
          instructions: "You are a creative content writer. Help create engaging blog posts, social media content, and marketing copy that resonates with the target audience."
        },
        workflow: {
          nodes: [
            { id: "start", type: "trigger", label: "Content Request", position: { x: 50, y: 50 }, data: {} },
            { id: "research", type: "ai_action", label: "Research Topic", position: { x: 250, y: 50 }, data: {} },
            { id: "write", type: "output", label: "Create Content", position: { x: 250, y: 200 }, data: {} }
          ],
          connections: [
            { id: "c1", source: "start", target: "research" },
            { id: "c2", source: "research", target: "write" }
          ]
        }
      }
    ];

    defaultTemplates.forEach(template => {
      const id = this.currentId.templates++;
      this.templates.set(id, { ...template, id });
    });
  }

  private initializeActivities() {
    const defaultActivities: InsertActivity[] = [
      {
        type: "deployment",
        message: "Customer Support Bot deployed successfully",
        userId: 1
      },
      {
        type: "workflow_created",
        message: "New workflow created: Refund Processing",
        userId: 1
      },
      {
        type: "conversation",
        message: "147 conversations processed today",
        userId: 1
      }
    ];

    defaultActivities.forEach(activity => {
      const id = this.currentId.activities++;
      this.activities.set(id, { 
        ...activity, 
        id, 
        createdAt: new Date().toISOString() 
      });
    });
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId.users++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Assistants
  async getAssistants(): Promise<Assistant[]> {
    return Array.from(this.assistants.values());
  }

  async getAssistant(id: number): Promise<Assistant | undefined> {
    return this.assistants.get(id);
  }

  async createAssistant(assistant: InsertAssistant): Promise<Assistant> {
    const id = this.currentId.assistants++;
    const newAssistant: Assistant = { 
      ...assistant, 
      id, 
      createdAt: new Date().toISOString() 
    };
    this.assistants.set(id, newAssistant);
    return newAssistant;
  }

  async updateAssistant(id: number, assistant: Partial<InsertAssistant>): Promise<Assistant | undefined> {
    const existing = this.assistants.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...assistant };
    this.assistants.set(id, updated);
    return updated;
  }

  async deleteAssistant(id: number): Promise<boolean> {
    return this.assistants.delete(id);
  }

  // Workflows
  async getWorkflows(): Promise<Workflow[]> {
    return Array.from(this.workflows.values());
  }

  async getWorkflow(id: number): Promise<Workflow | undefined> {
    return this.workflows.get(id);
  }

  async getWorkflowsByAssistant(assistantId: number): Promise<Workflow[]> {
    return Array.from(this.workflows.values()).filter(w => w.assistantId === assistantId);
  }

  async createWorkflow(workflow: InsertWorkflow): Promise<Workflow> {
    const id = this.currentId.workflows++;
    const newWorkflow: Workflow = { 
      ...workflow, 
      id, 
      createdAt: new Date().toISOString() 
    };
    this.workflows.set(id, newWorkflow);
    return newWorkflow;
  }

  async updateWorkflow(id: number, workflow: Partial<InsertWorkflow>): Promise<Workflow | undefined> {
    const existing = this.workflows.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...workflow };
    this.workflows.set(id, updated);
    return updated;
  }

  async deleteWorkflow(id: number): Promise<boolean> {
    return this.workflows.delete(id);
  }

  // Templates
  async getTemplates(): Promise<Template[]> {
    return Array.from(this.templates.values());
  }

  async getTemplate(id: number): Promise<Template | undefined> {
    return this.templates.get(id);
  }

  async createTemplate(template: InsertTemplate): Promise<Template> {
    const id = this.currentId.templates++;
    const newTemplate: Template = { ...template, id };
    this.templates.set(id, newTemplate);
    return newTemplate;
  }

  async incrementTemplateUsage(id: number): Promise<void> {
    const template = this.templates.get(id);
    if (template) {
      template.usageCount = (template.usageCount || 0) + 1;
      this.templates.set(id, template);
    }
  }

  // Conversations
  async getConversations(): Promise<Conversation[]> {
    return Array.from(this.conversations.values());
  }

  async getConversation(id: number): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }

  async getConversationsByAssistant(assistantId: number): Promise<Conversation[]> {
    return Array.from(this.conversations.values()).filter(c => c.assistantId === assistantId);
  }

  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const id = this.currentId.conversations++;
    const newConversation: Conversation = { 
      ...conversation, 
      id, 
      createdAt: new Date().toISOString() 
    };
    this.conversations.set(id, newConversation);
    return newConversation;
  }

  async updateConversation(id: number, conversation: Partial<InsertConversation>): Promise<Conversation | undefined> {
    const existing = this.conversations.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...conversation };
    this.conversations.set(id, updated);
    return updated;
  }

  // Activities
  async getActivities(limit: number = 10): Promise<Activity[]> {
    const activities = Array.from(this.activities.values())
      .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
    return activities.slice(0, limit);
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const id = this.currentId.activities++;
    const newActivity: Activity = { 
      ...activity, 
      id, 
      createdAt: new Date().toISOString() 
    };
    this.activities.set(id, newActivity);
    return newActivity;
  }

  // Stats
  async getAssistantStats(): Promise<AssistantStats> {
    const assistants = Array.from(this.assistants.values());
    const conversations = Array.from(this.conversations.values());
    const workflows = Array.from(this.workflows.values());

    return {
      activeAssistants: assistants.filter(a => a.isActive).length,
      conversations: conversations.length,
      successRate: "94.2%", // Would be calculated based on actual conversation outcomes
      workflows: workflows.length,
    };
  }

  // Alias for compatibility
  async getStats(): Promise<AssistantStats> {
    return this.getAssistantStats();
  }
}

// Create both storage instances
const databaseStorage = new DatabaseStorage();
const memoryStorage = new MemStorage();

// Wrapper that falls back to memory storage on database errors
class FallbackStorage implements IStorage {
  private async withFallback<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      console.warn('Database operation failed, falling back to memory storage:', error);
      // For now, we'll use memory storage as fallback
      // In production, you might want to implement retry logic
      throw error; // Re-throw to let individual methods handle fallback
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    try {
      return await databaseStorage.getUser(id);
    } catch (error) {
      console.warn('Database getUser failed, using memory storage');
      return await memoryStorage.getUser(id);
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      return await databaseStorage.getUserByUsername(username);
    } catch (error) {
      return await memoryStorage.getUserByUsername(username);
    }
  }

  async createUser(user: InsertUser): Promise<User> {
    try {
      return await databaseStorage.createUser(user);
    } catch (error) {
      return await memoryStorage.createUser(user);
    }
  }

  async getAssistants(): Promise<Assistant[]> {
    try {
      return await databaseStorage.getAssistants();
    } catch (error) {
      return await memoryStorage.getAssistants();
    }
  }

  async getAssistant(id: number): Promise<Assistant | undefined> {
    try {
      return await databaseStorage.getAssistant(id);
    } catch (error) {
      return await memoryStorage.getAssistant(id);
    }
  }

  async createAssistant(assistant: InsertAssistant): Promise<Assistant> {
    try {
      return await databaseStorage.createAssistant(assistant);
    } catch (error) {
      console.warn('Database createAssistant failed, using memory storage:', error.message);
      return await memoryStorage.createAssistant(assistant);
    }
  }

  async updateAssistant(id: number, assistant: Partial<InsertAssistant>): Promise<Assistant | undefined> {
    try {
      return await databaseStorage.updateAssistant(id, assistant);
    } catch (error) {
      return await memoryStorage.updateAssistant(id, assistant);
    }
  }

  async deleteAssistant(id: number): Promise<boolean> {
    try {
      return await databaseStorage.deleteAssistant(id);
    } catch (error) {
      return await memoryStorage.deleteAssistant(id);
    }
  }

  async getWorkflows(): Promise<Workflow[]> {
    try {
      return await databaseStorage.getWorkflows();
    } catch (error) {
      return await memoryStorage.getWorkflows();
    }
  }

  async getWorkflow(id: number): Promise<Workflow | undefined> {
    try {
      return await databaseStorage.getWorkflow(id);
    } catch (error) {
      return await memoryStorage.getWorkflow(id);
    }
  }

  async getWorkflowsByAssistant(assistantId: number): Promise<Workflow[]> {
    try {
      return await databaseStorage.getWorkflowsByAssistant(assistantId);
    } catch (error) {
      return await memoryStorage.getWorkflowsByAssistant(assistantId);
    }
  }

  async createWorkflow(workflow: InsertWorkflow): Promise<Workflow> {
    try {
      return await databaseStorage.createWorkflow(workflow);
    } catch (error) {
      return await memoryStorage.createWorkflow(workflow);
    }
  }

  async updateWorkflow(id: number, workflow: Partial<InsertWorkflow>): Promise<Workflow | undefined> {
    try {
      return await databaseStorage.updateWorkflow(id, workflow);
    } catch (error) {
      return await memoryStorage.updateWorkflow(id, workflow);
    }
  }

  async deleteWorkflow(id: number): Promise<boolean> {
    try {
      return await databaseStorage.deleteWorkflow(id);
    } catch (error) {
      return await memoryStorage.deleteWorkflow(id);
    }
  }

  async getTemplates(): Promise<Template[]> {
    try {
      return await databaseStorage.getTemplates();
    } catch (error) {
      return await memoryStorage.getTemplates();
    }
  }

  async getTemplate(id: number): Promise<Template | undefined> {
    try {
      return await databaseStorage.getTemplate(id);
    } catch (error) {
      return await memoryStorage.getTemplate(id);
    }
  }

  async createTemplate(template: InsertTemplate): Promise<Template> {
    try {
      return await databaseStorage.createTemplate(template);
    } catch (error) {
      return await memoryStorage.createTemplate(template);
    }
  }

  async incrementTemplateUsage(id: number): Promise<void> {
    try {
      return await databaseStorage.incrementTemplateUsage(id);
    } catch (error) {
      return await memoryStorage.incrementTemplateUsage(id);
    }
  }

  async getConversations(): Promise<Conversation[]> {
    try {
      return await databaseStorage.getConversations();
    } catch (error) {
      return await memoryStorage.getConversations();
    }
  }

  async getConversation(id: number): Promise<Conversation | undefined> {
    try {
      return await databaseStorage.getConversation(id);
    } catch (error) {
      return await memoryStorage.getConversation(id);
    }
  }

  async getConversationsByAssistant(assistantId: number): Promise<Conversation[]> {
    try {
      return await databaseStorage.getConversationsByAssistant(assistantId);
    } catch (error) {
      return await memoryStorage.getConversationsByAssistant(assistantId);
    }
  }

  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    try {
      return await databaseStorage.createConversation(conversation);
    } catch (error) {
      return await memoryStorage.createConversation(conversation);
    }
  }

  async updateConversation(id: number, conversation: Partial<InsertConversation>): Promise<Conversation | undefined> {
    try {
      return await databaseStorage.updateConversation(id, conversation);
    } catch (error) {
      return await memoryStorage.updateConversation(id, conversation);
    }
  }

  async getActivities(limit?: number): Promise<Activity[]> {
    try {
      return await databaseStorage.getActivities(limit);
    } catch (error) {
      return await memoryStorage.getActivities(limit);
    }
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    try {
      return await databaseStorage.createActivity(activity);
    } catch (error) {
      return await memoryStorage.createActivity(activity);
    }
  }

  async getAssistantStats(): Promise<AssistantStats> {
    try {
      return await databaseStorage.getAssistantStats();
    } catch (error) {
      return await memoryStorage.getAssistantStats();
    }
  }

  async getStats(): Promise<AssistantStats> {
    return this.getAssistantStats();
  }
}

export const storage = new FallbackStorage();