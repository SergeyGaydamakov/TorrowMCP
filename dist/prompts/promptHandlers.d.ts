/**
 * Prompt handlers for MCP server
 */
import { GetPromptRequest, GetPromptResult, CompleteRequest, CompleteResult } from "@modelcontextprotocol/sdk/types.js";
import { TorrowService } from "../service/torrowService.js";
export declare class PromptHandlers {
    private torrowService;
    constructor(torrowService: TorrowService);
    /**
     * Lists all available archives
     */
    listArchives(request: GetPromptRequest): Promise<GetPromptResult>;
    /**
     * Searches notes in an archive
     */
    searchNotes(request: GetPromptRequest): Promise<GetPromptResult>;
    /**
     * Gets statistics about an archive
     */
    archiveStats(request: GetPromptRequest): Promise<GetPromptResult>;
    /**
     * Handles completion requests for prompt arguments
     */
    handleCompletionRequest(request: CompleteRequest): Promise<CompleteResult>;
    /**
     * Routes prompt requests to appropriate handlers
     */
    handlePromptRequest(request: GetPromptRequest): Promise<GetPromptResult>;
}
//# sourceMappingURL=promptHandlers.d.ts.map