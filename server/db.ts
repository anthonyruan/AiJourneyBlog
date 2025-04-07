import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@shared/schema';

// Create a connection pool
const connectionString = process.env.DATABASE_URL!;
export const pool = postgres(connectionString, { 
  prepare: false, // Set to false for serverless environments
  max: 10 // Maximum number of connections
});

// Create the drizzle client instance
export const db = drizzle(pool, { schema });