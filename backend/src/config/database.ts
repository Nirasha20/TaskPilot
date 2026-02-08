import { Pool } from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

export const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'taskpilot_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test database connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err: Error) => {
  console.error('❌ Unexpected error on idle client', err);
  process.exit(-1);
});

// Initialize database tables
export async function initializeDatabase() {
  try {
    console.log('🔧 Initializing database...');
    
    // Read and execute schema.sql
    const schemaPath = path.join(__dirname, '../../database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    
    // Execute the entire schema as one statement to handle functions/triggers correctly
    try {
      await pool.query(schema);
      console.log('✅ Database initialized successfully');
      return true;
    } catch (err: any) {
      // If there's an error, it might be because tables already exist
      if (err.message.includes('already exists')) {
        console.log('✅ Database tables already exist');
        return true;
      }
      throw err;
    }
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    return false;
  }
}

// Test database connection
export async function testConnection() {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}
