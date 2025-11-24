/**
 * MCP error definitions
 */
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';

export class TorrowMcpError extends McpError {
  constructor(code: ErrorCode, message: string, data?: unknown) {
    super(code, message, data);
  }
}

export class ValidationError extends TorrowMcpError {
  constructor(message: string, data?: unknown) {
    super(ErrorCode.InvalidParams, message, data);
  }
}

export class NotFoundError extends TorrowMcpError {
  constructor(message: string, data?: unknown) {
    super(ErrorCode.InvalidRequest, message, data);
  }
}

export class AuthenticationError extends TorrowMcpError {
  constructor(message: string, data?: unknown) {
    super(ErrorCode.InvalidRequest, message, data);
  }
}

export class TorrowApiError extends TorrowMcpError {
  constructor(message: string, statusCode?: number, data?: unknown) {
    const errorData = { statusCode, ...(data && typeof data === 'object' ? data : {}) };
    super(ErrorCode.InternalError, `Torrow API Error: ${message}`, errorData);
  }
}

export class ContextError extends TorrowMcpError {
  constructor(message: string, data?: unknown) {
    super(ErrorCode.InvalidRequest, message, data);
  }
}
