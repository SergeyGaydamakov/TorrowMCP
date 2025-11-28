import { RESOURCE_NOTE, RESOURCE_ARCHIVE, RESOURCE_ARCHIVES_LIST, RESOURCE_ARCHIVE_NOTE } from './resourceConstants.js';
export const resources = [
    {
        uri: RESOURCE_ARCHIVES_LIST,
        name: 'Archives List (catalogs list)',
        description: 'Get list of all available archives (catalogs)',
        mimeType: 'application/json'
    },
    {
        uri: `${RESOURCE_NOTE}/{noteId}`,
        name: 'Note',
        description: 'Get information about a specific note by its ID. Use format: torrow://note/{noteId} where {noteId} is the actual note ID (e.g., torrow://note/aae6203eb30ec9f2624061bd89b595f57)',
        mimeType: 'application/json'
    },
    {
        uri: `${RESOURCE_ARCHIVE}/{archiveId}`,
        name: 'Archive (catalog)',
        description: 'Get information about a specific archive (catalog) by its ID. Use format: torrow://archive/{archiveId} where {archiveId} is the actual archive ID',
        mimeType: 'application/json'
    },
    {
        uri: RESOURCE_ARCHIVE_NOTE,
        name: 'Archive Note (note in archive (catalog))',
        description: 'Get information about a specific note in an archive (catalog). Parameters: {archiveName} - the name of the archive (catalog), {noteName} - the name of the note',
        mimeType: 'application/json'
    }
];
//# sourceMappingURL=resources.js.map