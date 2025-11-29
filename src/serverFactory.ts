/**
 * Server factory for creating and configuring MCP server instances
 * Used by both stdio and HTTP modes
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
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

export interface ServerConfig {
  serverName?: string;
  token?: string;
  apiBase?: string;
}

/**
 * Creates and configures an MCP server instance
 */
export function createServer(config?: ServerConfig): {
  server: Server;
  resourceHandlers: ResourceHandlers;
  toolHandlers: ToolHandlers;
  promptHandlers: PromptHandlers;
  serverName: string;
} {
  // Get configuration from environment or provided config
  const getArgsValue = (name: string): string[] => {
    return process.argv.slice(2).filter(arg => arg.startsWith(`${name}=`)).map(arg => arg.split('=')[1]);
  };

  const serverName = config?.serverName ||
    process.env.MCP_SERVER_NAME ||
    process.env.TORROW_MCP_SERVER_NAME ||
    getArgsValue('MCP_SERVER_NAME')[0] ||
    getArgsValue('TORROW_MCP_SERVER_NAME')[0] ||
    'torrow-mcp-service';

  const token = config?.token ||
    process.env.TORROW_TOKEN ||
    getArgsValue('TORROW_TOKEN')[0] ||
    '';

  const apiBase = config?.apiBase ||
    process.env.TORROW_API_BASE ||
    getArgsValue('TORROW_API_BASE')[0] ||
    '';

  // Create server
  const server = new Server(
    {
      name: serverName,
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
  const torrowClient = new TorrowClient(token, apiBase);
  const torrowService = new TorrowService(torrowClient);

  // Initialize handlers
  const resourceHandlers = new ResourceHandlers(torrowService);
  const toolHandlers = new ToolHandlers(torrowService);
  const promptHandlers = new PromptHandlers(torrowService);

  // Setup handlers
  const getResourcesWithServerHint = (): Resource[] => {
    const serverHint = `\n\n⚠️ SERVER NAME HINT: This server is registered as "${serverName}". If resources are not found when using list_mcp_resources(server="..."), make sure to use server="${serverName}". The server name must match the key in your MCP client configuration (mcp.json). To fix: either change the key in mcp.json to "${serverName}", or set MCP_SERVER_NAME="${serverName}" in the env section of your mcp.json configuration.`;

    return resources.map(resource => ({
      ...resource,
      description: resource.description + serverHint
    }));
  };

  // Resources
  const resourcesWithServerHint = getResourcesWithServerHint();
  server.setRequestHandler(ListResourcesRequestSchema, async () => ({
    resources: resourcesWithServerHint
  }));

  server.setRequestHandler(ReadResourceRequestSchema, async (request: ReadResourceRequest) => {
    return resourceHandlers.handleResourceRequest(request);
  });

  // Tools
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
    return toolHandlers.handleToolRequest(request);
  });

  // Prompts
  server.setRequestHandler(ListPromptsRequestSchema, async () => ({
    prompts
  }));

  server.setRequestHandler(GetPromptRequestSchema, async (request: GetPromptRequest) => {
    return promptHandlers.handlePromptRequest(request);
  });

  // Completions
  server.setRequestHandler(CompleteRequestSchema, async (request: CompleteRequest) => {
    return promptHandlers.handleCompletionRequest(request);
  });

  return {
    server,
    resourceHandlers,
    toolHandlers,
    promptHandlers,
    serverName
  };
}

