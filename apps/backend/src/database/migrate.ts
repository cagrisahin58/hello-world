import { db } from './db';
import * as fs from 'fs';
import * as path from 'path';

async function runMigrations() {
  try {
    console.log('🚀 Starting database migrations...');

    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    await db.query(schema);

    console.log('✅ Database migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
