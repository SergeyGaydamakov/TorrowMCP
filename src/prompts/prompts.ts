/**
 * Prompt specifications for MCP server
 */
import { Prompt } from '@modelcontextprotocol/sdk/types.js';
import {
  PROMPT_LIST_ARCHIVES,
  PROMPT_SEARCH_NOTES,
  PROMPT_ARCHIVE_STATS
} from './promptConstants.js';

export const prompts: Prompt[] = [
  {
    name: PROMPT_LIST_ARCHIVES,
    description: 'List all available archives (catalogs) with their details',
    arguments: []
  },
  {
    name: PROMPT_SEARCH_NOTES,
    description: 'Search notes in an archive with optional filters by text and tags',
    arguments: [
      {
        name: 'archiveId',
        description: 'ID of the archive to search in',
        required: true
      },
      {
        name: 'phrase',
        description: 'Search phrase text (optional)',
        required: false
      },
      {
        name: 'tags',
        type: 'array',
        items: { type: 'string' },
        description: 'Tags to filter by. Tags are used to group notes in the archive. Tag is simple string 3 - 100 characters [A-z, А-я, 0-9, /,\,-,_,.] or two strings separated by colon (<tag_value>:<tag_group>).',
        required: false
      },
      {
        name: 'limit',
        description: 'Maximum number of results (default: 20)',
        required: false
      },
      {
        name: 'skip',
        description: 'Skip number of results (default: 0)',
        required: false
      },
      {
        name: 'distance',
        description: 'Distance between results in characters (default: 0). Distance is used to search for notes with similar text.',
        required: false
      }
    ]
  },
  {
    name: PROMPT_ARCHIVE_STATS,
    description: 'Get statistics about an archive: number of notes, tags, and other metadata',
    arguments: [
      {
        name: 'archiveId',
        description: 'ID of the archive to get statistics for',
        required: true
      }
    ]
  }
];
