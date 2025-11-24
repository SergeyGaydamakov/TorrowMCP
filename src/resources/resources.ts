/**
 * Resource specifications for MCP server
 */
import { Resource } from '@modelcontextprotocol/sdk/types.js';
import { RESOURCE_NOTE, RESOURCE_ARCHIVE, RESOURCE_ARCHIVES_LIST } from './resourceConstants.js';

export const resources: Resource[] = [
  {
    uri: `${RESOURCE_NOTE}/{torrowId}`,
    name: 'Note',
    description: 'Get information about a specific note by its Torrow ID',
    mimeType: 'application/json'
  },
  {
    uri: `${RESOURCE_ARCHIVE}/{torrowId}`,
    name: 'Archive',
    description: 'Get information about a specific archive by its Torrow ID',
    mimeType: 'application/json'
  },
  {
    uri: RESOURCE_ARCHIVES_LIST,
    name: 'Archives List',
    description: 'Get list of all available archives',
    mimeType: 'application/json'
  }
];
