import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config as loadEnvFile } from 'dotenv';

const currentDir = dirname(fileURLToPath(import.meta.url));

/**
 * Repository root. Four levels up from both `src/common` and the built
 * `dist/common`, so the same path resolution works in dev and in production.
 */
export const repoRoot = resolve(currentDir, '../../../..');

// A local apps/server/.env wins over the shared root .env.
loadEnvFile({ path: resolve(repoRoot, '.env'), quiet: true });
loadEnvFile({ path: resolve(currentDir, '../../.env'), override: true, quiet: true });

export type NodeEnv = 'development' | 'test' | 'production';

export interface AppConfig {
  nodeEnv: NodeEnv;
  isProduction: boolean;
  serviceName: string;
  version: string;
  port: number;
  /** Allowed browser origin for CORS. */
  clientUrl: string;
  /** Null until Task 2 wires up persistence; required in production. */
  mongoUri: string | null;
  /** Null until an LLM provider is chosen (task.md section 46). */
  llmApiKey: string | null;
  /** Null until Voxide credentials are issued. */
  voxideApiKey: string | null;
}

class ConfigError extends Error {}

function readEnum(name: string, allowed: readonly NodeEnv[], fallback: NodeEnv): NodeEnv {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return fallback;
  const match = allowed.find((value) => value === raw);
  if (match === undefined) {
    throw new ConfigError(`${name} must be one of ${allowed.join(', ')}, received "${raw}"`);
  }
  return match;
}

function readPort(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return fallback;
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65535) {
    throw new ConfigError(`${name} must be an integer between 1 and 65535, received "${raw}"`);
  }
  return parsed;
}

function readOptional(name: string): string | null {
  const raw = process.env[name];
  return raw === undefined || raw.trim() === '' ? null : raw.trim();
}

/**
 * Reads and validates the environment once at startup.
 *
 * Fails fast on a bad value rather than surfacing it as a confusing runtime
 * error later. Secrets are optional in development so the server can be
 * started before the database and the AI and voice providers are chosen, but
 * they are mandatory in production.
 */
export function loadConfig(): AppConfig {
  const nodeEnv = readEnum('NODE_ENV', ['development', 'test', 'production'], 'development');
  const isProduction = nodeEnv === 'production';

  const config: AppConfig = {
    nodeEnv,
    isProduction,
    serviceName: 'voicesos-server',
    version: process.env['npm_package_version'] ?? '0.1.0',
    port: readPort('PORT', 4000),
    clientUrl: readOptional('CLIENT_URL') ?? 'http://localhost:5173',
    mongoUri: readOptional('MONGODB_URI'),
    llmApiKey: readOptional('LLM_API_KEY'),
    voxideApiKey: readOptional('VOXIDE_API_KEY'),
  };

  if (isProduction) {
    const missing = (['mongoUri', 'llmApiKey', 'voxideApiKey'] as const)
      .filter((key) => config[key] === null)
      .map((key) => envNameFor(key));
    if (missing.length > 0) {
      throw new ConfigError(`Missing required production environment variables: ${missing.join(', ')}`);
    }
    if (readOptional('CLIENT_URL') === null) {
      throw new ConfigError('CLIENT_URL must be set in production so CORS is not left open to localhost');
    }
  }

  return config;
}

function envNameFor(key: 'mongoUri' | 'llmApiKey' | 'voxideApiKey'): string {
  switch (key) {
    case 'mongoUri':
      return 'MONGODB_URI';
    case 'llmApiKey':
      return 'LLM_API_KEY';
    case 'voxideApiKey':
      return 'VOXIDE_API_KEY';
  }
}

export const config: AppConfig = loadConfig();
