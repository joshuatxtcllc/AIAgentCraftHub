
import { db } from './db';
import * as schema from '@shared/schema';

const sampleTemplates = [
  {
    name: "Customer Support Bot",
    description: "Handle customer inquiries, provide product information, and escalate complex issues",
    category: "Customer Service",
    usageCount: 1250,
    isPopular: true,
    config: {
      name: "Customer Support Bot",
      model: "gpt-4",
      temperature: 20,
      capabilities: ["Web Search", "File Analysis"],
      instructions: "You are a helpful customer support assistant. Provide accurate information about products and services, and escalate complex issues to human agents when necessary."
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
    name: "Content Writer",
    description: "Generate blog posts, social media content, and marketing copy with brand voice",
    category: "Content & Marketing", 
    usageCount: 2100,
    isPopular: true,
    config: {
      name: "Content Writer",
      model: "gpt-4",
      temperature: 70,
      capabilities: ["Web Search", "Image Analysis"],
      instructions: "You are a creative content writer. Generate engaging, SEO-friendly content that matches the brand voice and target audience."
    }
  }
];

export async function seedDatabase() {
  try {
    console.log('Seeding database...');
    
    // Insert templates
    await db.insert(schema.templates).values(sampleTemplates);
    
    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

if (require.main === module) {
  seedDatabase().then(() => process.exit(0));
}
