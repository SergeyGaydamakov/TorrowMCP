/**
 * Resource handlers for MCP server
 */
import { ReadResourceRequest, ReadResourceResult } from "@modelcontextprotocol/sdk/types.js";
import { TorrowService } from "../service/torrowService.js";
export declare class ResourceHandlers {
    private torrowService;
    constructor(torrowService: TorrowService);
    /**
     * Handles note resource requests
     */
    handleNoteResource(request: ReadResourceRequest): Promise<ReadResourceResult>;
    /**
     * Handles archive resource requests
     */
    handleArchiveResource(request: ReadResourceRequest): Promise<ReadResourceResult>;
    /**
     * Handles archives list resource requests
     */
    handleArchivesListResource(request: ReadResourceRequest): Promise<ReadResourceResult>;
    /**
     * Routes resource requests to appropriate handlers
     */
    handleResourceRequest(request: ReadResourceRequest): Promise<ReadResourceResult>;
}
//# sourceMappingURL=resourceHandlers.d.ts.map