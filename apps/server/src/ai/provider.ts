import { config } from '../common/config.js';
import { UpstreamUnavailableError } from '../common/errors.js';
import { logger } from '../common/logger.js';
import { observeProviderCall } from '../common/observe.js';
import { fetchWithRetry, readJson } from '../common/upstream.js';

export interface LlmCompleteInput {
  system: string;
  user: string;
}

export interface LlmProvider {
  complete(input: LlmCompleteInput): Promise<string>;
}

/**
 * OpenAI-compatible Chat Completions client.
 *
 * Works with OpenAI, Groq, and other providers that expose the same path.
 * The model must return a JSON object (response_format=json_object).
 */
export class OpenAiCompatibleProvider implements LlmProvider {
  constructor(
    private readonly options: {
      apiKey: string;
      baseUrl: string;
      model: string;
    },
  ) {}

  async complete(input: LlmCompleteInput): Promise<string> {
    const url = `${this.options.baseUrl.replace(/\/$/, '')}/chat/completions`;
    const startedAt = Date.now();
    const response = await fetchWithRetry({
      dependency: 'LLM',
      url,
      init: {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.options.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': config.clientUrl,
          'X-Title': 'DERES',
        },
        body: JSON.stringify({
          model: this.options.model,
          temperature: 0,
          max_tokens: 500,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: input.system },
            { role: 'user', content: input.user },
          ],
        }),
      },
      timeoutMs: 8_000,
      maxAttempts: 1,
    });

    if (!response.ok) {
      const detail = (await response.text()).slice(0, 300);
      observeProviderCall({
        provider: 'llm',
        operation: 'complete',
        startedAt,
        ok: false,
        status: response.status,
      });
      logger.warn('LLM provider returned an error status', { status: response.status, detail });
      throw new UpstreamUnavailableError('LLM');
    }

    const body = await readJson<{
      choices?: Array<{ message?: { content?: string | null } }>;
    }>(response, 'LLM');
    const content = body.choices?.[0]?.message?.content;
    if (!content) {
      observeProviderCall({ provider: 'llm', operation: 'complete', startedAt, ok: false, failure: 'empty' });
      throw new UpstreamUnavailableError('LLM');
    }
    observeProviderCall({ provider: 'llm', operation: 'complete', startedAt, ok: true, status: response.status });
    return content;
  }
}

/** Null until `LLM_API_KEY` is set. Tests inject {@link ScriptedLlmProvider}. */
export function createLlmProvider(): LlmProvider | null {
  if (config.llmApiKey === null) return null;
  return new OpenAiCompatibleProvider({
    apiKey: config.llmApiKey,
    baseUrl: config.llmBaseUrl,
    model: config.llmModel,
  });
}

/** Test double. Queue JSON payloads in the order turns will consume them. */
export class ScriptedLlmProvider implements LlmProvider {
  private readonly queue: string[];

  constructor(responses: unknown[]) {
    this.queue = responses.map((item) => (typeof item === 'string' ? item : JSON.stringify(item)));
  }

  async complete(): Promise<string> {
    const next = this.queue.shift();
    if (next === undefined) {
      throw new Error('ScriptedLlmProvider has no remaining responses');
    }
    return next;
  }
}
