import { drizzle } from "drizzle-orm/neon-serverless";
import { neon } from "@neondatabase/serverless";

const connectionString = process.env.DATABASE_URL || "postgresql://localhost:5432/assistant_builder";

// Configure neon client 
const sql = neon(connectionString);
export const db = drizzle(sql);

// Test database connection on startup
sql`SELECT 1`.catch((error) => {
  console.warn('Database connection failed on startup:', error.message);
  console.log('Falling back to memory storage for all operations');
});