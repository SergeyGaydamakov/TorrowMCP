#!/usr/bin/env node

/**
 * Torrow MCP Server - Main entry point
 */
import { config } from 'dotenv';
// Load dotenv silently to avoid stdout pollution
config({ debug: false });
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import { createServer } from './serverFactory.js';

/**
 * Main MCP Server class (stdio mode)
 */
class TorrowMcpServer {
  private server: Server;
  private serverName: string;

  constructor() {
    // NOTE: The server name here is used for identification in logs, metadata, and resource listing.
    // The actual server identifier used by MCP clients (like Cursor) is configured
    // in the client's MCP configuration file (mcp.json). 
    // 
    // IMPORTANT: The server name MUST match the key in mcpServers configuration!
    // If Cursor shows "user-torrow-mcp-service" in list_mcp_resources(), then either:
    // 1. Change the key in mcp.json to "user-torrow-mcp-service", OR
    // 2. Set MCP_SERVER_NAME environment variable to match the key in mcp.json
    // 
    // Mismatched names will cause GPT to fail when trying to use resources.
    // Common server identifier names: "torrow", "user-torrow", "torrow-mcp-service"
    // The server name can be configured via MCP_SERVER_NAME or TORROW_MCP_SERVER_NAME
    // environment variable or command line argument (e.g., MCP_SERVER_NAME=torrow).
    const serverConfig = createServer();
    this.server = serverConfig.server;
    this.serverName = serverConfig.serverName;
  }

  /**
   * Starts the MCP server in stdio mode
   */
  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    
    console.error(`Torrow MCP Server (stdio mode) started successfully with name: "${this.serverName}"`);
    console.error(`IMPORTANT: Make sure the server name "${this.serverName}" matches the key in your MCP client configuration (mcp.json)`);
    console.error(`If list_mcp_resources() shows a different server name, set MCP_SERVER_NAME environment variable to match it.`);
  }
}

/**
 * Main function
 */
async function main(): Promise<void> {
  try {
    const server = new TorrowMcpServer();
    await server.start();
  } catch (error) {
    console.error('Failed to start Torrow MCP Server:', error);
    process.exit(1);
  }
}

// Start the server
// if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
// }
