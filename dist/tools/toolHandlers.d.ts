/**
 * Tool handlers for MCP server
 */
import { CallToolRequest, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { TorrowClient } from '../torrow/torrowClient.js';
export declare class ToolHandlers {
    private torrowClient;
    constructor(torrowClient: TorrowClient);
    /**
     * Creates a new note
     */
    createNote(request: CallToolRequest): Promise<CallToolResult>;
    /**
     * Updates note by ID
     */
    updateNote(request: CallToolRequest): Promise<CallToolResult>;
    /**
     * Deletes note by ID
     */
    deleteNote(request: CallToolRequest): Promise<CallToolResult>;
    /**
     * Searches notes in specified archive
     */
    searchNotes(request: CallToolRequest): Promise<CallToolResult>;
    /**
     * Creates a new archive
     */
    createArchive(request: CallToolRequest): Promise<CallToolResult>;
    /**
     * Updates archive by ID
     */
    updateArchive(request: CallToolRequest): Promise<CallToolResult>;
    /**
     * Deletes archive by ID
     */
    deleteArchive(request: CallToolRequest): Promise<CallToolResult>;
    /**
     * Routes tool requests to appropriate handlers
     */
    handleToolRequest(request: CallToolRequest): Promise<CallToolResult>;
}
//# sourceMappingURL=toolHandlers.d.ts.map