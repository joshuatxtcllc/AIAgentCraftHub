import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const assistants = pgTable("assistants", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  model: text("model").notNull().default("gpt-4"),
  temperature: integer("temperature").default(30), // 0-100 scale
  capabilities: jsonb("capabilities").$type<string[]>().default([]),
  instructions: text("instructions"),
  isActive: boolean("is_active").default(false),
  userId: integer("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const workflows = pgTable("workflows", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  nodes: jsonb("nodes").$type<WorkflowNode[]>().default([]),
  connections: jsonb("connections").$type<WorkflowConnection[]>().default([]),
  assistantId: integer("assistant_id").references(() => assistants.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const templates = pgTable("templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  usageCount: integer("usage_count").default(0),
  isPopular: boolean("is_popular").default(false),
  config: jsonb("config").$type<AssistantConfig>().notNull(),
  workflow: jsonb("workflow").$type<{ nodes: WorkflowNode[], connections: WorkflowConnection[] }>(),
});

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  assistantId: integer("assistant_id").references(() => assistants.id),
  messages: jsonb("messages").$type<ChatMessage[]>().default([]),
  createdAt: timestamp("created_at").defaultNow(),
});

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // "deployment", "workflow_created", "conversation", etc.
  message: text("message").notNull(),
  userId: integer("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Zod schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertAssistantSchema = createInsertSchema(assistants).omit({
  id: true,
  createdAt: true,
});

export const insertWorkflowSchema = createInsertSchema(workflows).omit({
  id: true,
  createdAt: true,
});

export const insertTemplateSchema = createInsertSchema(templates).omit({
  id: true,
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Assistant = typeof assistants.$inferSelect;
export type InsertAssistant = z.infer<typeof insertAssistantSchema>;

export type Workflow = typeof workflows.$inferSelect;
export type InsertWorkflow = z.infer<typeof insertWorkflowSchema>;

export type Template = typeof templates.$inferSelect;
export type InsertTemplate = z.infer<typeof insertTemplateSchema>;

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

// Custom types for complex data structures
export type WorkflowNode = {
  id: string;
  type: "trigger" | "ai_action" | "condition" | "output";
  label: string;
  position: { x: number; y: number };
  data: Record<string, any>;
};

export type WorkflowConnection = {
  id: string;
  source: string;
  target: string;
};

export type AssistantConfig = {
  name: string;
  model: string;
  temperature: number;
  capabilities: string[];
  instructions: string;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};

export type AssistantStats = {
  activeAssistants: number;
  conversations: number;
  successRate: string;
  workflows: number;
};
