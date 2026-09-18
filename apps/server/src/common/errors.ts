import { ApiErrorCode, type ApiFieldError } from '@voicesos/shared';

/**
 * An error the server raised deliberately and can describe to a client.
 *
 * Anything thrown that is not an `AppError` is treated as a bug: it is logged
 * in full and reported to the client as a generic `INTERNAL_ERROR`, so an
 * unexpected failure can never leak internals.
 */
export class AppError extends Error {
  readonly code: ApiErrorCode;
  readonly statusCode: number;
  readonly fieldErrors?: ApiFieldError[];
  /** Extra detail for the log only. Never sent to the client. */
  readonly logContext?: Record<string, unknown>;

  constructor(
    code: ApiErrorCode,
    statusCode: number,
    message: string,
    options: {
      fieldErrors?: ApiFieldError[];
      logContext?: Record<string, unknown>;
      cause?: unknown;
    } = {},
  ) {
    super(message, options.cause === undefined ? undefined : { cause: options.cause });
    this.name = new.target.name;
    this.code = code;
    this.statusCode = statusCode;
    if (options.fieldErrors) this.fieldErrors = options.fieldErrors;
    if (options.logContext) this.logContext = options.logContext;
  }
}

export class ValidationError extends AppError {
  constructor(message: string, fieldErrors: ApiFieldError[] = []) {
    super(ApiErrorCode.VALIDATION_ERROR, 400, message, { fieldErrors });
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(ApiErrorCode.NOT_FOUND, 404, `${resource} not found`);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required') {
    super(ApiErrorCode.UNAUTHORIZED, 401, message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Not permitted') {
    super(ApiErrorCode.FORBIDDEN, 403, message);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(ApiErrorCode.CONFLICT, 409, message);
  }
}

/** The requested change is not legal for the incident's current state. */
export class InvalidStateTransitionError extends AppError {
  constructor(message: string, logContext?: Record<string, unknown>) {
    super(ApiErrorCode.INVALID_STATE_TRANSITION, 409, message, { ...(logContext ? { logContext } : {}) });
  }
}

/**
 * The active protocol does not permit what was requested.
 *
 * This is the safety boundary refusing, not a bug. It must stay distinct from
 * a generic error so that blocked guidance is visible in logs and metrics.
 */
export class ProtocolViolationError extends AppError {
  constructor(message: string, logContext?: Record<string, unknown>) {
    super(ApiErrorCode.PROTOCOL_VIOLATION, 422, message, { ...(logContext ? { logContext } : {}) });
  }
}

/** Model output failed schema, state, protocol or safety validation. */
export class AiValidationError extends AppError {
  constructor(message: string, logContext?: Record<string, unknown>) {
    super(ApiErrorCode.AI_VALIDATION_FAILED, 422, message, { ...(logContext ? { logContext } : {}) });
  }
}

/** An external dependency such as the LLM, Voxide or the database is down. */
export class UpstreamUnavailableError extends AppError {
  constructor(dependency: string, options: { cause?: unknown } = {}) {
    super(ApiErrorCode.UPSTREAM_UNAVAILABLE, 503, `${dependency} is unavailable`, options);
  }
}
