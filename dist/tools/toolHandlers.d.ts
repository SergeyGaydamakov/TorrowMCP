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
     * Updates current note
     */
    updateNote(request: CallToolRequest): Promise<CallToolResult>;
    /**
     * Deletes current note
     */
    deleteNote(request: CallToolRequest): Promise<CallToolResult>;
    /**
     * Searches notes in current archive
     */
    searchNotes(request: CallToolRequest): Promise<CallToolResult>;
    /**
     * Creates a new archive
     */
    createArchive(request: CallToolRequest): Promise<CallToolResult>;
    /**
     * Updates current archive
     */
    updateArchive(request: CallToolRequest): Promise<CallToolResult>;
    /**
     * Deletes current archive
     */
    deleteArchive(request: CallToolRequest): Promise<CallToolResult>;
    /**
     * Selects an archive by ID and makes it current
     */
    selectArchiveById(request: CallToolRequest): Promise<CallToolResult>;
    /**
     * Selects an archive by name and makes it current
     */
    selectArchiveByName(request: CallToolRequest): Promise<CallToolResult>;
    /**
     * Selects a note by ID and makes it current
     */
    selectNoteById(request: CallToolRequest): Promise<CallToolResult>;
    /**
     * Selects a note by name and makes it current
     */
    selectNoteByName(request: CallToolRequest): Promise<CallToolResult>;
    /**
     * Routes tool requests to appropriate handlers
     */
    handleToolRequest(request: CallToolRequest): Promise<CallToolResult>;
}
//# sourceMappingURL=toolHandlers.d.ts.map