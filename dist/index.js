#!/usr/bin/env node
/**
 * Torrow MCP Server - Main entry point
 */
import 'dotenv/config';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListResourcesRequestSchema, ListToolsRequestSchema, ReadResourceRequestSchema, ListPromptsRequestSchema, GetPromptRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { TorrowClient } from './torrow/torrowClient.js';
import { ResourceHandlers } from './resources/resourceHandlers.js';
import { ToolHandlers } from './tools/toolHandlers.js';
import { PromptHandlers } from './prompts/promptHandlers.js';
import { resources } from './resources/resources.js';
import { tools } from './tools/tools.js';
import { prompts } from './prompts/prompts.js';
/**
 * Main MCP Server class
 */
class TorrowMcpServer {
    server;
    torrowClient;
    resourceHandlers;
    toolHandlers;
    promptHandlers;
    constructor() {
        this.server = new Server({
            name: 'torrow-mcp-service',
            version: '1.0.0'
        }, {
            capabilities: {
                resources: {},
                tools: {},
                prompts: {}
            }
        });
        // Initialize Torrow client
        this.torrowClient = new TorrowClient();
        // Initialize handlers
        this.resourceHandlers = new ResourceHandlers(this.torrowClient);
        this.toolHandlers = new ToolHandlers(this.torrowClient);
        this.promptHandlers = new PromptHandlers(this.torrowClient);
        this.setupHandlers();
    }
    /**
     * Sets up MCP request handlers
     */
    setupHandlers() {
        // Resources
        this.server.setRequestHandler(ListResourcesRequestSchema, async () => ({
            resources
        }));
        this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
            return this.resourceHandlers.handleResourceRequest(request);
        });
        // Tools
        this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
            tools
        }));
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            return this.toolHandlers.handleToolRequest(request);
        });
        // Prompts
        this.server.setRequestHandler(ListPromptsRequestSchema, async () => ({
            prompts
        }));
        this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
            return this.promptHandlers.handlePromptRequest(request);
        });
    }
    /**
     * Starts the MCP server
     */
    async start() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('Torrow MCP Server started successfully');
    }
}
/**
 * Main function
 */
async function main() {
    try {
        const server = new TorrowMcpServer();
        await server.start();
    }
    catch (error) {
        console.error('Failed to start Torrow MCP Server:', error);
        process.exit(1);
    }
}
// Start the server
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}
//# sourceMappingURL=index.js.map