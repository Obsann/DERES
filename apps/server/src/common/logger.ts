import { config } from './config.js';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_ORDER: Record<LogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40 };

const minimumLevel: LogLevel = config.nodeEnv === 'production' ? 'info' : 'debug';

/**
 * Keys whose values are replaced before anything is written.
 *
 * Covers credentials and the conversation content itself: transcripts and
 * location are emergency data and must not end up in application logs
 * (task.md Phase 14 and Phase 16).
 */
const REDACTED_KEYS = new Set([
  'apikey',
  'api_key',
  'authorization',
  'cookie',
  'llmapikey',
  'mongouri',
  'password',
  'secret',
  'token',
  'voxideapikey',
  'transcript',
  'prompt',
  'audio',
  'audiobase64',
  'location',
  'latitude',
  'longitude',
]);

const REDACTED = '[redacted]';

function redact(value: unknown, depth = 0): unknown {
  if (depth > 6 || value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map((item) => redact(item, depth + 1));
  if (value instanceof Error) return { name: value.name, message: value.message };

  const output: Record<string, unknown> = {};
  for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
    output[key] = REDACTED_KEYS.has(key.toLowerCase()) ? REDACTED : redact(nested, depth + 1);
  }
  return output;
}

function write(level: LogLevel, message: string, context?: Record<string, unknown>): void {
  if (LEVEL_ORDER[level] < LEVEL_ORDER[minimumLevel]) return;

  const entry = {
    level,
    time: new Date().toISOString(),
    service: config.serviceName,
    message,
    ...(context ? (redact(context) as Record<string, unknown>) : {}),
  };

  const line = config.isProduction ? JSON.stringify(entry) : formatForHuman(entry);
  if (level === 'error') process.stderr.write(`${line}\n`);
  else process.stdout.write(`${line}\n`);
}

function formatForHuman(entry: Record<string, unknown>): string {
  const { level, time, message, service: _service, ...rest } = entry;
  const detail = Object.keys(rest).length > 0 ? ` ${JSON.stringify(rest)}` : '';
  return `${String(time)} ${String(level).toUpperCase().padEnd(5)} ${String(message)}${detail}`;
}

export const logger = {
  debug: (message: string, context?: Record<string, unknown>) => write('debug', message, context),
  info: (message: string, context?: Record<string, unknown>) => write('info', message, context),
  warn: (message: string, context?: Record<string, unknown>) => write('warn', message, context),
  error: (message: string, context?: Record<string, unknown>) => write('error', message, context),
};
