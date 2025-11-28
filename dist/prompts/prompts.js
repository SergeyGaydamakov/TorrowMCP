import { PROMPT_LIST_ARCHIVES, PROMPT_SEARCH_NOTES, PROMPT_ARCHIVE_STATS } from './promptConstants.js';
export const prompts = [
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
                name: 'query',
                description: 'Search query text (optional)',
                required: false
            },
            {
                name: 'tags',
                description: 'Tags to filter by (comma-separated, optional)',
                required: false
            },
            {
                name: 'limit',
                description: 'Maximum number of results (default: 20)',
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
//# sourceMappingURL=prompts.js.map