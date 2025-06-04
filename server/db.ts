import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const connectionString = process.env.DATABASE_URL || "postgresql://localhost:5432/assistant_builder";

// Configure postgres client with connection pooling and timeouts
const client = postgres(connectionString, {
  max: 10, // Maximum connections in pool
  idle_timeout: 20, // Close idle connections after 20 seconds
  connect_timeout: 10, // Timeout connection attempts after 10 seconds
  max_lifetime: 60 * 30, // Close connections after 30 minutes
  onnotice: () => {}, // Suppress notices
});

export const db = drizzle(client);

// Test database connection on startup
client`SELECT 1`.catch((error) => {
  console.warn('Database connection failed on startup:', error.message);
  console.log('Falling back to memory storage for all operations');
});