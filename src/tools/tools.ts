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
  TOOL_DELETE_ARCHIVE
} from './toolConstants.js';
import { RESOURCE_ARCHIVES_LIST } from '../resources/resourceConstants.js';

export const tools: Tool[] = [
  {
    name: TOOL_CREATE_NOTE,
    description: 'Create a new note in the specified archive',
    inputSchema: {
      type: 'object',
      properties: {
        archiveId: {
          type: 'string',
          description: `ID of the archive (catalog) in which to create the note. List all available archives in resources ${RESOURCE_ARCHIVES_LIST}`
        },
        name: {
          type: 'string',
          description: 'Name of the note'
        },
        text: {
          type: 'string',
          description: 'Text content of the note. Light html formatted text of the note including <img> and <a> tags.'
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Tags for the note. Tags are used to group notes in the archive. Tag is simple string 3 - 100 characters [A-z, А-я, 0-9, /,\,-,_,.] or two strings separated by colon (<tag_value>:<tag_group>).'
        }
      },
      required: ['archiveId', 'name', 'text', 'tags']
    }
  },
  {
    name: TOOL_UPDATE_NOTE,
    description: 'Update a note by ID',
    inputSchema: {
      type: 'object',
      properties: {
        noteId: {
          type: 'string',
          description: 'ID of the note to update'
        },
        name: {
          type: 'string',
          description: 'Name of the note'
        },
        text: {
          type: 'string',
          description: 'Text content of the note. Light html formatted text of the note including <img> and <a> tags.'
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Tags for the note. Tags are used to group notes in the archive. Tag is simple string 3 - 100 characters [A-z, А-я, 0-9, /,\,-,_,.] or two strings separated by colon (<tag_value>:<tag_group>).'
        }
      },
      required: ['noteId', 'name', 'text', 'tags']
    }
  },
  {
    name: TOOL_DELETE_NOTE,
    description: 'Delete a note by ID',
    inputSchema: {
      type: 'object',
      properties: {
        noteId: {
          type: 'string',
          description: 'ID of the note to delete'
        }
      },
      required: ['noteId']
    }
  },
  {
    name: TOOL_SEARCH_NOTES,
    description: 'Search notes in the specified archive by phrase and tags',
    inputSchema: {
      type: 'object',
      properties: {
        archiveId: {
          type: 'string',
          description: `ID of the archive (catalog) in which to search notes. List all available archives in resources ${RESOURCE_ARCHIVES_LIST}`
        },
        phrase: {
          type: 'string',
          description: 'Search phrase'
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Tags to filter by. Tags are used to group notes in the archive. Tag is simple string 3 - 100 characters [A-z, А-я, 0-9, /,\,-,_,.] or two strings separated by colon (<tag_value>:<tag_group>).'
        },
        limit: {
          type: 'number',
          default: 10,
          description: 'Maximum number of results (default: 10)'
        },
        skip: {
          type: 'number',
          default: 0,
          description: 'Skip number of results (default: 0)'
        },
        distance: {
          type: 'number',
          default: 0,
          description: 'Distance between results in characters (default: 0). Distance is used to search for notes with similar text.'
        }
      },
      required: ['archiveId']
    }
  },
  {
    name: TOOL_CREATE_ARCHIVE,
    description: 'Create a new archive (catalog)',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Name of the archive'
        },
        text: {
          type: 'string',
          description: 'Text content of the archive. Light html formatted text of the archive including <img> and <a> tags.'
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Tags for the archive. Tags are used to group notes in the archive. Tag is simple string 3 - 100 characters [A-z, А-я, 0-9, /,\,-,_,.] or two strings separated by colon (<tag_value>:<tag_group>).'
        }
      },
      required: ['name', 'text', 'tags']
    }
  },
  {
    name: TOOL_UPDATE_ARCHIVE,
    description: 'Update an archive (catalog) by ID',
    inputSchema: {
      type: 'object',
      properties: {
        archiveId: {
          type: 'string',
          description: 'ID of the archive to update'
        },
        name: {
          type: 'string',
          description: 'Name of the archive'
        },
        text: {
          type: 'string',
          description: 'Text content of the archive. Light html formatted text of the archive.'
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Tags for the archive. Tags are used to group notes in the archive. Tag is simple string 3 - 100 characters [A-z, А-я, 0-9, /,\,-,_,.] or two strings separated by colon (<tag_value>:<tag_group>).'
        }
      },
      required: ['archiveId', 'name', 'text', 'tags']
    }
  },
  {
    name: TOOL_DELETE_ARCHIVE,
    description: 'Delete an archive (catalog) by ID with optional cascade deletion',
    inputSchema: {
      type: 'object',
      properties: {
        archiveId: {
          type: 'string',
          description: 'ID of the archive to delete'
        },
        cascade: {
          type: 'boolean',
          default: false,
          description: 'Delete all notes in archive (default: false)'
        }
      },
      required: ['archiveId']
    }
  }
];
