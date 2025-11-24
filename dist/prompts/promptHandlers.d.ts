/**
 * Prompt handlers for MCP server
 */
import { GetPromptRequest, GetPromptResult } from '@modelcontextprotocol/sdk/types.js';
import { TorrowClient } from '../torrow/torrowClient.js';
export declare class PromptHandlers {
    private torrowClient;
    constructor(torrowClient: TorrowClient);
    /**
     * Selects an archive by name and makes it current
     */
    selectArchive(request: GetPromptRequest): Promise<GetPromptResult>;
    /**
     * Selects a note by name or index and makes it current
     */
    selectNote(request: GetPromptRequest): Promise<GetPromptResult>;
    /**
     * Shows current context status
     */
    contextStatus(request: GetPromptRequest): Promise<GetPromptResult>;
    /**
     * Routes prompt requests to appropriate handlers
     */
    handlePromptRequest(request: GetPromptRequest): Promise<GetPromptResult>;
}
//# sourceMappingURL=promptHandlers.d.ts.map