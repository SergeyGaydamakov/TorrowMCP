/**
 * Resource specifications for MCP server
 */
import { Resource } from '@modelcontextprotocol/sdk/types.js';
import { RESOURCE_NOTE, RESOURCE_ARCHIVE, RESOURCE_ARCHIVES_LIST } from './resourceConstants.js';

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
export const resources: Resource[] = [
  {
    uri: RESOURCE_ARCHIVES_LIST,
    name: 'Archives List (Catalogs List)',
    description: 'Get list of all available archives or catalogs. Use this resource to discover all note catalogs. URI: torrow://archives/list',
    mimeType: 'application/json'
  },
  {
    uri: `${RESOURCE_NOTE}/{noteId}`,
    name: 'Note',
    description: 'Get information about a specific note by its ID. Use format: torrow://notes/{noteId} where {noteId} is the actual note ID (e.g., torrow://notes/aae6203eb30ec9f2624061bd89b595f57). The {noteId} placeholder must be replaced with an actual note ID.',
    mimeType: 'application/json'
  },
  {
    uri: `${RESOURCE_ARCHIVE}/{archiveId}`,
    name: 'Archive (Catalog)',
    description: 'Get information about a specific archive (catalog) by its ID. Use format: torrow://archives/{archiveId} where {archiveId} is the actual archive ID (e.g., torrow://archives/aae6203eb30ec9f2624061bd89b595f57). The {archiveId} placeholder must be replaced with an actual archive ID.',
    mimeType: 'application/json'
  },
  {
    uri: `${RESOURCE_ARCHIVE}/{archiveId}/notes`,
    name: 'Archive Notes',
    description: 'Get list of notes in a specific archive (catalog) by its ID. Use format: torrow://archives/{archiveId}/notes?limit={limit}&skip={skip} where {archiveId} is the actual archive ID (e.g., torrow://archives/aae6203eb30ec9f2624061bd89b595f57/notes?limit=10&skip=0). The {archiveId} placeholder must be replaced with an actual archive ID. Optional query parameters: limit (number of notes to return) and skip (number of notes to skip).',
    mimeType: 'application/json'
  }
];
