/**
 * Tool specifications for MCP server
 */
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import {
  TOOL_CREATE_NOTE,
  TOOL_UPDATE_NOTE,
  TOOL_DELETE_NOTE,
  TOOL_SEARCH_NOTES,
  TOOL_CREATE_ARCHIVE,
  TOOL_UPDATE_ARCHIVE,
  TOOL_DELETE_ARCHIVE,
  TOOL_SELECT_ARCHIVE_BY_ID,
  TOOL_SELECT_ARCHIVE_BY_NAME,
  TOOL_SELECT_NOTE_BY_ID,
  TOOL_SELECT_NOTE_BY_NAME
} from './toolConstants.js';

export const tools: Tool[] = [
  {
    name: TOOL_CREATE_NOTE,
    description: 'Create a new note in the current archive',
    inputSchema: {
      type: 'object',
      properties: {
        phrase: {
          type: 'string',
          description: 'Phrase in format: <name>.<text>#tag#tag'
        }
      },
      required: ['phrase']
    }
  },
  {
    name: TOOL_UPDATE_NOTE,
    description: 'Update the current note',
    inputSchema: {
      type: 'object',
      properties: {
        phrase: {
          type: 'string',
          description: 'New phrase in format: <name>.<text>#tag#tag'
        }
      },
      required: ['phrase']
    }
  },
  {
    name: TOOL_DELETE_NOTE,
    description: 'Delete the current note',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: TOOL_SEARCH_NOTES,
    description: 'Search notes in the current archive by phrase and tags',
    inputSchema: {
      type: 'object',
      properties: {
        phrase: {
          type: 'string',
          description: 'Search phrase'
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Tags to filter by'
        },
        limit: {
          type: 'number',
          default: 10,
          description: 'Maximum number of results (default: 10)'
        }
      }
    }
  },
  {
    name: TOOL_CREATE_ARCHIVE,
    description: 'Create a new archive (catalog)',
    inputSchema: {
      type: 'object',
      properties: {
        phrase: {
          type: 'string',
          description: 'Phrase in format: <name>.<text>#tag#tag'
        }
      },
      required: ['phrase']
    }
  },
  {
    name: TOOL_UPDATE_ARCHIVE,
    description: 'Update the current archive (catalog)',
    inputSchema: {
      type: 'object',
      properties: {
        phrase: {
          type: 'string',
          description: 'New phrase in format: <name>.<text>#tag#tag'
        }
      },
      required: ['phrase']
    }
  },
  {
    name: TOOL_DELETE_ARCHIVE,
    description: 'Delete the current archive (catalog) with optional cascade deletion',
    inputSchema: {
      type: 'object',
      properties: {
        cascade: {
          type: 'boolean',
          default: false,
          description: 'Delete all notes in archive (default: false)'
        }
      }
    }
  },
  {
    name: TOOL_SELECT_ARCHIVE_BY_ID,
    description: 'Select an archive (catalog) by ID and make it current',
    inputSchema: {
      type: 'object',
      properties: {
        archiveId: {
          type: 'string',
          description: 'ID of the archive to select'
        }
      },
      required: ['archiveId']
    }
  },
  {
    name: TOOL_SELECT_ARCHIVE_BY_NAME,
    description: 'Select an archive (catalog) by name and make it current',
    inputSchema: {
      type: 'object',
      properties: {
        archiveName: {
          type: 'string',
          description: 'Name of the archive to select'
        }
      },
      required: ['archiveName']
    }
  },
  {
    name: TOOL_SELECT_NOTE_BY_ID,
    description: 'Select a note by ID and make it current',
    inputSchema: {
      type: 'object',
      properties: {
        noteId: {
          type: 'string',
          description: 'ID of the note to select'
        }
      },
      required: ['noteId']
    }
  },
  {
    name: TOOL_SELECT_NOTE_BY_NAME,
    description: 'Select a note by name and make it current',
    inputSchema: {
      type: 'object',
      properties: {
        noteName: {
          type: 'string',
          description: 'Name of the note to select'
        }
      },
      required: ['noteName']
    }
  }
];
