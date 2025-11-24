import { TOOL_CREATE_NOTE, TOOL_UPDATE_NOTE, TOOL_DELETE_NOTE, TOOL_SEARCH_NOTES, TOOL_CREATE_ARCHIVE, TOOL_UPDATE_ARCHIVE, TOOL_DELETE_ARCHIVE } from './toolConstants.js';
export const tools = [
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
        description: 'Update the current archive',
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
        description: 'Delete the current archive with optional cascade deletion',
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
    }
];
//# sourceMappingURL=tools.js.map