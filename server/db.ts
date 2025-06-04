import { drizzle } from "drizzle-orm/neon-serverless";
import { neon } from "@neondatabase/serverless";

const connectionString = process.env.DATABASE_URL || "postgresql://localhost:5432/assistant_builder";

// Configure neon client with error handling
let sql;
try {
  sql = neon(connectionString);
} catch (error) {
  console.error('Failed to initialize database connection:', error);
  // Create a fallback that will trigger memory storage
  sql = () => Promise.reject(new Error('Database unavailable'));
}

export const db = drizzle(sql);

// Test database connection on startup
if (typeof sql === 'function') {
  sql`SELECT 1`.catch((error) => {
    console.warn('Database connection failed on startup:', error.message);
    console.log('Falling back to memory storage for all operations');
  });
}