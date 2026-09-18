import mongoose from 'mongoose';
import { config } from '../common/config.js';
import { logger } from '../common/logger.js';
import { syncIndexes } from './models/index.js';

export async function connectDatabase(uri: string): Promise<void> {
  if (mongoose.connection.readyState === 1) return;

  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8_000 });
  await syncIndexes();
  logger.info('database connected', { name: mongoose.connection.name });
}

export async function disconnectDatabase(): Promise<void> {
  if (mongoose.connection.readyState === 0) return;
  await mongoose.disconnect();
  logger.info('database disconnected');
}

export function isDatabaseConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

export async function pingDatabase(): Promise<boolean> {
  const db = mongoose.connection.db;
  if (!db) return false;
  try {
    await db.admin().command({ ping: 1 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Health-check value for `GET /api/health`.
 *
 * `unknown` means no URI is configured (local scaffold without Atlas).
 * `down` means a URI is configured but the ping failed.
 */
export async function getDatabaseHealth(): Promise<'up' | 'down' | 'unknown'> {
  if (isDatabaseConnected() && (await pingDatabase())) return 'up';
  if (config.mongoUri) return 'down';
  return 'unknown';
}
