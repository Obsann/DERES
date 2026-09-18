/**
 * `@voicesos/shared` - the canonical VoiceSOS contracts.
 *
 * Anything both the server and the web client need to agree on lives here:
 * types, enums and real-time event names. Do not redefine these shapes
 * locally in an app (git-workflow.md section 30); import them instead, so the
 * two sides cannot drift apart.
 */
export * from './enums/index.js';
export * from './types/index.js';
export * from './events/index.js';
