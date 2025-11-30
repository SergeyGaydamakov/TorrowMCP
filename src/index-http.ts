#!/usr/bin/env node

/**
 * Torrow MCP Server - HTTP mode entry point
 * 
 * This server runs as an HTTP service and can be accessed via HTTP requests.
 * Use this mode when you want to run the server as a standalone service.
 * 
 * Usage:
 *   npm run start:http
 *   PORT=3000 npm run start:http
 */
import { config } from 'dotenv';
// Load dotenv silently to avoid stdout pollution
config({ debug: false });

import express, { Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';

import { createServer } from './serverFactory.js';

const app = express();
app.use(express.json());

// Map to store transports by session ID
const transports: { [sessionId: string]: StreamableHTTPServerTransport } = {};

// Map to store session configurations (token, apiBase, etc.)
interface SessionConfig {
  token: string;
  apiBase?: string;
  serverName?: string;
}
const sessionConfigs: { [sessionId: string]: SessionConfig } = {};

// Get port and host configuration
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const HOST = process.env.HOST || '127.0.0.1';

// Build allowed hosts list including port variations
const getAllowedHosts = (): string[] => {
  const hosts: string[] = ['127.0.0.1', 'localhost'];
  // Add host:port combinations
  hosts.push(`127.0.0.1:${PORT}`, `localhost:${PORT}`);
  // If HOST is different from default, add it too
  if (HOST !== '127.0.0.1') {
    hosts.push(HOST, `${HOST}:${PORT}`);
  }
  return hosts;
};

/**
 * Extract Bearer token from Authorization header
 * According to MCP standard: Authorization: Bearer <access-token>
 */
const extractTokenFromRequest = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return null;
  }

  // Check for Bearer token format
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1] || null;
};

/**
 * Validate token and return error response if invalid
 * Returns null if token is valid, otherwise returns error response
 */
const validateToken = (token: string | null, res: Response): boolean => {
  if (!token || token.trim() === '') {
    res.status(401).json({
      jsonrpc: '2.0',
      error: {
        code: -32001,
        message: 'Unauthorized: Authorization token required',
      },
      id: null,
    });
    res.setHeader('WWW-Authenticate', 'Bearer');
    return false;
  }
  return true;
};

// Handle POST requests for client-to-server communication
app.post('/mcp', async (req: Request, res: Response) => {
  const sessionId = req.headers['mcp-session-id'] as string | undefined;
  let transport: StreamableHTTPServerTransport;

  if (sessionId && transports[sessionId]) {
    // Reuse existing transport - verify token matches session
    const sessionConfig = sessionConfigs[sessionId];
    const clientToken = extractTokenFromRequest(req);
    
    if (!clientToken || !sessionConfig || clientToken !== sessionConfig.token) {
      res.status(401).json({
        jsonrpc: '2.0',
        error: {
          code: -32001,
          message: 'Unauthorized: Invalid or missing authorization token',
        },
        id: (req.body as { id?: unknown }).id ?? null,
      });
      res.setHeader('WWW-Authenticate', 'Bearer');
      return;
    }
    
    transport = transports[sessionId];
  } else if (!sessionId && isInitializeRequest(req.body)) {
    // New initialization request - extract token from Authorization header
    // In HTTP mode, always use client token (MCP standard)
    // Fallback to environment variable only if DANGEROUSLY_OMIT_AUTH is set (for development/testing)
    const clientToken = extractTokenFromRequest(req);
    
    let token: string;
    if (process.env.DANGEROUSLY_OMIT_AUTH === '1') {
      // Development mode: allow fallback to environment variable
      token = clientToken || process.env.TORROW_TOKEN || '';
    } else {
      // Production mode: require client token
      token = clientToken || '';
    }
    
    // Validate token presence
    if (!validateToken(token, res)) {
      return;
    }
    
    const apiBase = process.env.TORROW_API_BASE || '';
    const serverName = process.env.MCP_SERVER_NAME || process.env.TORROW_MCP_SERVER_NAME || 'torrow-mcp-service';

    // New initialization request
    transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
      onsessioninitialized: (sessionId) => {
        transports[sessionId] = transport;
        // Store session configuration with client token
        sessionConfigs[sessionId] = {
          token,
          apiBase: apiBase || undefined,
          serverName: serverName || undefined
        };
      },
      enableDnsRebindingProtection: true,
      allowedHosts: getAllowedHosts(),
    });

    // Clean up transport when closed
    transport.onclose = () => {
      if (transport.sessionId) {
        delete transports[transport.sessionId];
        delete sessionConfigs[transport.sessionId];
      }
    };

    // Create and setup server with token from client
    // In HTTP mode, the client token is used for all Torrow API calls
    // This is different from STDIO mode, which uses token from environment variable
    try {
      const { server } = createServer({
        token, // Client token from Authorization header - used for Torrow API calls
        apiBase: apiBase || undefined,
        serverName: serverName || undefined
      });
      await server.connect(transport);
    } catch (error) {
      console.error('[HTTP] Error creating server:', error);
      const requestId = (req.body as { id?: unknown }).id ?? null;
      res.status(500).json({
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: `Failed to initialize server: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
        id: requestId,
      });
      return;
    }
  } else {
    // Invalid request
    res.status(400).json({
      jsonrpc: '2.0',
      error: {
        code: -32000,
        message: 'Bad Request: No valid session ID provided',
      },
      id: null,
    });
    return;
  }

  // Handle the request
  await transport.handleRequest(req, res, req.body);
});

// Handle GET requests for server-to-client notifications via SSE
app.get('/mcp', async (req: Request, res: Response) => {
  const sessionId = req.headers['mcp-session-id'] as string | undefined;
  if (!sessionId || !transports[sessionId]) {
    res.status(400).send('Invalid or missing session ID');
    return;
  }

  // Verify token for existing session
  const sessionConfig = sessionConfigs[sessionId];
  const clientToken = extractTokenFromRequest(req);
  
  if (!clientToken || !sessionConfig || clientToken !== sessionConfig.token) {
    res.status(401).json({
      jsonrpc: '2.0',
      error: {
        code: -32001,
        message: 'Unauthorized: Invalid or missing authorization token',
      },
      id: null,
    });
    res.setHeader('WWW-Authenticate', 'Bearer');
    return;
  }

  const transport = transports[sessionId];
  await transport.handleRequest(req, res);
});

// Handle DELETE requests for session termination
app.delete('/mcp', async (req: Request, res: Response) => {
  const sessionId = req.headers['mcp-session-id'] as string | undefined;
  if (!sessionId || !transports[sessionId]) {
    res.status(400).send('Invalid or missing session ID');
    return;
  }

  // Verify token for existing session
  const sessionConfig = sessionConfigs[sessionId];
  const clientToken = extractTokenFromRequest(req);
  
  if (!clientToken || !sessionConfig || clientToken !== sessionConfig.token) {
    res.status(401).json({
      jsonrpc: '2.0',
      error: {
        code: -32001,
        message: 'Unauthorized: Invalid or missing authorization token',
      },
      id: null,
    });
    res.setHeader('WWW-Authenticate', 'Bearer');
    return;
  }

  const transport = transports[sessionId];
  await transport.handleRequest(req, res);
  
  // Clean up transport
  if (transport.sessionId) {
    delete transports[transport.sessionId];
    delete sessionConfigs[transport.sessionId];
  }
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    mode: 'http',
    activeSessions: Object.keys(transports).length
  });
});


app.listen(PORT, HOST, () => {
  const { serverName } = createServer();
  console.log(`Torrow MCP HTTP Server started successfully`);
  console.log(`  Server name: "${serverName}"`);
  console.log(`  Listening on: http://${HOST}:${PORT}/mcp`);
  console.log(`  Health check: http://${HOST}:${PORT}/health`);
  console.log(`  Allowed hosts: ${getAllowedHosts().join(', ')}`);
  console.log(`  IMPORTANT: Make sure the server name "${serverName}" matches the key in your MCP client configuration`);
});

