/**
 * MCP error definitions
 */
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
export declare class TorrowMcpError extends McpError {
    constructor(code: ErrorCode, message: string, data?: unknown);
}
export declare class ValidationError extends TorrowMcpError {
    constructor(message: string, data?: unknown);
}
export declare class NotFoundError extends TorrowMcpError {
    constructor(message: string, data?: unknown);
}
export declare class AuthenticationError extends TorrowMcpError {
    constructor(message: string, data?: unknown);
}
export declare class TorrowApiError extends TorrowMcpError {
    constructor(message: string, statusCode?: number, data?: unknown);
}
export declare class ContextError extends TorrowMcpError {
    constructor(message: string, data?: unknown);
}
//# sourceMappingURL=errors.d.ts.map