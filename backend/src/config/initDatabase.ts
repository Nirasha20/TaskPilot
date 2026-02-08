import { pool } from './database';
import fs from 'fs';
import path from 'path';

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
