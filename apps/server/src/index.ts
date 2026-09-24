import { createServer, type Server } from 'node:http';
import { createApp } from './app.js';
import { config } from './common/config.js';
import { logger } from './common/logger.js';
import { connectDatabase, disconnectDatabase } from './database/connection.js';
import { attachRealtime, closeRealtime, type IncidentIo } from './realtime/index.js';

let server: Server | undefined;
let io: IncidentIo | undefined;

async function start(): Promise<void> {
  if (config.mongoUri) {
    try {
      await connectDatabase(config.mongoUri);
    } catch (error) {
      logger.error('database connection failed', {
        message: error instanceof Error ? error.message : String(error),
      });
      process.exit(1);
    }
  } else {
    logger.warn('MONGODB_URI not set; persistence is disabled');
  }

  const app = createApp();
  const httpServer = createServer(app);
  io = attachRealtime(httpServer);

  server = httpServer.listen(config.port, () => {
    logger.info('server listening', {
      port: config.port,
      nodeEnv: config.nodeEnv,
      clientUrl: config.clientUrl,
      database: config.mongoUri === null ? 'not configured' : 'configured',
      llm: config.llmApiKey === null ? 'not configured' : 'configured',
      voice: config.voxideApiKey === null ? 'not configured' : 'configured',
      realtime: 'socket.io',
    });
  });

  server.on('error', (error: NodeJS.ErrnoException) => {
    if (error.code === 'EADDRINUSE') {
      logger.error('port already in use', { port: config.port });
    } else {
      logger.error('server error', { message: error.message });
    }
    process.exit(1);
  });
}

void start();

/**
 * Stops accepting connections and lets in-flight requests finish.
 *
 * An incident may be mid-conversation during a deploy, so the process is not
 * killed instantly. The timer is a backstop for a connection that never ends.
 */
function shutdown(signal: string): void {
  logger.info('shutting down', { signal });

  const forceExit = setTimeout(() => {
    logger.error('shutdown timed out, forcing exit');
    process.exit(1);
  }, 10_000);
  forceExit.unref();

  const finish = (error?: Error): void => {
    void disconnectDatabase()
      .catch((disconnectError: unknown) => {
        logger.error('error while closing database', {
          message: disconnectError instanceof Error ? disconnectError.message : String(disconnectError),
        });
      })
      .finally(() => {
        if (error) {
          logger.error('error while closing server', { message: error.message });
          process.exit(1);
        }
        logger.info('shutdown complete');
        process.exit(0);
      });
  };

  if (io) {
    void closeRealtime(io)
      .then(() => {
        io = undefined;
        server = undefined;
        finish();
      })
      .catch((error: unknown) => {
        logger.error('error while closing realtime', {
          message: error instanceof Error ? error.message : String(error),
        });
        io = undefined;
        if (server) {
          server.close((closeError) => finish(closeError ?? undefined));
          return;
        }
        finish(error instanceof Error ? error : undefined);
      });
    return;
  }

  if (!server) {
    finish();
    return;
  }

  server.close((error) => {
    finish(error ?? undefined);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

process.on('unhandledRejection', (reason) => {
  logger.error('unhandled promise rejection', {
    message: reason instanceof Error ? reason.message : String(reason),
    stack: reason instanceof Error ? reason.stack : undefined,
  });
});

process.on('uncaughtException', (error) => {
  logger.error('uncaught exception', { message: error.message, stack: error.stack });
  process.exit(1);
});
