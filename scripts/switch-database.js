import fs from 'fs';
import path from 'path';

const target = process.argv[2] || 'postgres';
const projectRoot = process.cwd();

const postgresFile = path.join(projectRoot, 'prisma', 'schema.postgresql.prisma');
const sqliteFile = path.join(projectRoot, 'prisma', 'schema.sqlite.prisma');
const activeFile = path.join(projectRoot, 'prisma', 'schema.prisma');

if (target === 'postgres' || target === 'postgresql') {
  if (fs.existsSync(postgresFile)) {
    fs.copyFileSync(postgresFile, activeFile);
    console.log('✅ Active Prisma schema switched to PostgreSQL (ready for Vercel / Neon / Supabase).');
  } else {
    console.error('❌ Could not find prisma/schema.postgresql.prisma');
  }
} else if (target === 'sqlite') {
  if (fs.existsSync(sqliteFile)) {
    fs.copyFileSync(sqliteFile, activeFile);
    console.log('✅ Active Prisma schema switched to SQLite (local dev.db).');
  } else {
    console.error('❌ Could not find prisma/schema.sqlite.prisma');
  }
} else {
  console.log('Usage: node scripts/switch-database.js [postgres|sqlite]');
}
