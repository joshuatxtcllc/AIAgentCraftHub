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
        name: "HR Assistant",
        description: "Manage employee onboarding, answer policy questions, and schedule meetings",
        category: "Human Resources",
        usageCount: 340,
        isPopular: false,
        config: {
          name: "HR Assistant",
          model: "gpt-4",
          temperature: 15,
          capabilities: ["File Analysis", "Data Analysis"],
          instructions: "You are an HR assistant. Help employees with policies, procedures, and general HR inquiries. Maintain confidentiality and professionalism."
        }
      },
      {
        name: "Sales Lead Qualifier",
        description: "Qualify leads, gather requirements, and schedule sales calls automatically",
        category: "Sales & Marketing",
        usageCount: 890,
        isPopular: false,
        config: {
          name: "Sales Lead Qualifier",
          model: "gpt-4",
          temperature: 25,
          capabilities: ["Web Search", "Data Analysis"],
          instructions: "You are a sales assistant focused on qualifying leads. Ask relevant questions to understand prospect needs and budget."
        }
      },
      {
        name: "Content Writer",
        description: "Generate blog posts, social media content, and marketing copy with brand voice",
        category: "Content & Marketing",
        usageCount: 2100,
        isPopular: false,
        config: {
          name: "Content Writer",
          model: "gpt-4",
          temperature: 70,
          capabilities: ["Web Search"],
          instructions: "You are a creative content writer. Generate engaging, brand-appropriate content across various formats and platforms."
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

export const storage = new DatabaseStorage();
