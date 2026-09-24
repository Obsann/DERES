import { config } from '../common/config.js';
import { UpstreamUnavailableError } from '../common/errors.js';
import { logger } from '../common/logger.js';

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
    let response: Response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.options.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.options.model,
          temperature: 0,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: input.system },
            { role: 'user', content: input.user },
          ],
        }),
      });
    } catch (error) {
      throw new UpstreamUnavailableError('LLM', { cause: error });
    }

    if (!response.ok) {
      logger.warn('LLM provider returned an error status', { status: response.status });
      throw new UpstreamUnavailableError('LLM');
    }

    const body = (await response.json()) as {
      choices?: Array<{ message?: { content?: string | null } }>;
    };
    const content = body.choices?.[0]?.message?.content;
    if (!content) {
      throw new UpstreamUnavailableError('LLM');
    }
    return content;
  }
}

export function createLlmProvider(): LlmProvider {
  if (config.llmApiKey === null) {
    throw new UpstreamUnavailableError('LLM');
  }
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
