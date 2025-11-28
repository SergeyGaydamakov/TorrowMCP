/**
 * Resource specifications for MCP server
 */
import { Resource } from '@modelcontextprotocol/sdk/types.js';
/**
 * MCP Resources available from Torrow server.
 *
 * IMPORTANT: When accessing these resources from an MCP client (like Cursor),
 * use list_mcp_resources() without a server parameter first to discover
 * the correct server identifier, or ensure the server identifier in your
 * client configuration matches the expected name.
 *
 * Resource URIs use the "torrow://" scheme and are server-agnostic.
 */
export declare const resources: Resource[];
//# sourceMappingURL=resources.d.ts.map