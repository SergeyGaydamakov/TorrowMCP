/**
 * Prompt specifications for MCP server
 */
import { Prompt } from '@modelcontextprotocol/sdk/types.js';
import {
  PROMPT_SELECT_ARCHIVE,
  PROMPT_SELECT_NOTE,
  PROMPT_CONTEXT_STATUS
} from './promptConstants.js';

export const prompts: Prompt[] = [
  {
    name: PROMPT_SELECT_ARCHIVE,
    description: 'Select an archive by name and make it current',
    arguments: [
      {
        name: 'archiveName',
        description: 'Name of the archive to select (completion suggestions available from getArchives)',
        required: true
      }
    ]
  },
  {
    name: PROMPT_SELECT_NOTE,
    description: 'Select a note by name or index and make it current',
    arguments: [
      {
        name: 'noteName',
        description: 'Name of the note to select',
        required: false
      },
      {
        name: 'noteIndex',
        description: 'Index of the note from search results (1-based)',
        required: false
      }
    ]
  },
  {
    name: PROMPT_CONTEXT_STATUS,
    description: 'Show current context status (current archive and note)',
    arguments: []
  }
];
