#!/usr/bin/env node

/**
 * Torrow MCP Server - Main entry point
 */
import { config } from 'dotenv';
// Load dotenv silently to avoid stdout pollution
config({ debug: false });
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
  CompleteRequestSchema,
  CallToolRequest,
  ReadResourceRequest,
  GetPromptRequest,
  CompleteRequest,
  Resource
} from '@modelcontextprotocol/sdk/types.js';

import { TorrowClient } from './torrow/torrowClient.js';
import { ResourceHandlers } from './resources/resourceHandlers.js';
import { ToolHandlers } from './tools/toolHandlers.js';
import { PromptHandlers } from './prompts/promptHandlers.js';
import { resources } from './resources/resources.js';
import { tools } from './tools/tools.js';
import { prompts } from './prompts/prompts.js';
import { TorrowService } from './service/torrowService.js';

/**
 * Main MCP Server class
 */
class TorrowMcpServer {
  private server: Server;
  private torrowClient: TorrowClient;
  private torrowService: TorrowService;
  private resourceHandlers: ResourceHandlers;
  private toolHandlers: ToolHandlers;
  private promptHandlers: PromptHandlers;
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
    this.serverName = this.getServerName();
    this.server = new Server(
      {
        name: this.serverName,
        version: '1.0.0'
      },
      {
        capabilities: {
          resources: {},
          tools: {},
          prompts: {},
          completions: {}
        }
      }
    );

    // Initialize Torrow client
    const token = this.getToken();
    const apiBase = this.getApiBase();
    this.torrowClient = new TorrowClient(token, apiBase);
    this.torrowService = new TorrowService(this.torrowClient);
    
    // Initialize handlers
    this.resourceHandlers = new ResourceHandlers(this.torrowService);
    this.toolHandlers = new ToolHandlers(this.torrowService);
    this.promptHandlers = new PromptHandlers(this.torrowService);

    this.setupHandlers();
  }

  // Получение значения аргумента из командной строки
  private getArgsValue(name: string): string[] {
    return process.argv.slice(2).filter(arg => arg.startsWith(`${name}=`)).map(arg => arg.split('=')[1]);
  }

  // Получение токена из аргументов или переменных окружения
  private getToken(): string {
    return process.env.TORROW_TOKEN || this.getArgsValue('TORROW_TOKEN')[0] || '';
  }

  private getApiBase(): string {
    return process.env.TORROW_API_BASE || this.getArgsValue('TORROW_API_BASE')[0] || '';
  }

  // Получение имени сервера из аргументов или переменных окружения
  // Поддерживает MCP_SERVER_NAME и TORROW_MCP_SERVER_NAME для универсальности
  // ВАЖНО: Имя сервера должно совпадать с ключом в конфигурации MCP клиента (mcp.json)
  // Если Cursor показывает "user-torrow-mcp-service", убедитесь, что в конфигурации
  // указан ключ "torrow-mcp-service" (без префикса "user-"), или установите переменную
  // окружения MCP_SERVER_NAME=torrow-mcp-service
  private getServerName(): string {
    return process.env.MCP_SERVER_NAME || 
           process.env.TORROW_MCP_SERVER_NAME || 
           this.getArgsValue('MCP_SERVER_NAME')[0] || 
           this.getArgsValue('TORROW_MCP_SERVER_NAME')[0] || 
           'torrow-mcp-service';
  }

  /**
   * Returns resources with server name hints in descriptions
   * This helps users identify the correct server name when resources are not found
   */
  private getResourcesWithServerHint(): Resource[] {
    const serverHint = `\n\n⚠️ SERVER NAME HINT: This server is registered as "${this.serverName}". If resources are not found when using list_mcp_resources(server="..."), make sure to use server="${this.serverName}". The server name must match the key in your MCP client configuration (mcp.json). To fix: either change the key in mcp.json to "${this.serverName}", or set MCP_SERVER_NAME="${this.serverName}" in the env section of your mcp.json configuration.`;
    
    return resources.map(resource => ({
      ...resource,
      description: resource.description + serverHint
    }));
  }

  /**
   * Sets up MCP request handlers
   */
  private setupHandlers(): void {
    // Resources - include server name hint in descriptions
    const resourcesWithServerHint = this.getResourcesWithServerHint();
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => ({
      resources: resourcesWithServerHint
    }));

    this.server.setRequestHandler(ReadResourceRequestSchema, async (request: ReadResourceRequest) => {
      return this.resourceHandlers.handleResourceRequest(request);
    });

    // Tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
      return this.toolHandlers.handleToolRequest(request);
    });

    // Prompts
    this.server.setRequestHandler(ListPromptsRequestSchema, async () => ({
      prompts
    }));

    this.server.setRequestHandler(GetPromptRequestSchema, async (request: GetPromptRequest) => {
      return this.promptHandlers.handlePromptRequest(request);
    });

    // Completions
    this.server.setRequestHandler(CompleteRequestSchema, async (request: CompleteRequest) => {
      return this.promptHandlers.handleCompletionRequest(request);
    });
  }

  /**
   * Starts the MCP server
   */
  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    
    const serverName = this.getServerName();
    console.error(`Torrow MCP Server started successfully with name: "${serverName}"`);
    console.error(`IMPORTANT: Make sure the server name "${serverName}" matches the key in your MCP client configuration (mcp.json)`);
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
