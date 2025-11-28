import { contextStore } from '../context/contextStore.js';
import { NoteResourceSchema, ArchiveResourceSchema, ArchiveNoteResourceSchema } from './resourceSchemas.js';
import { NotFoundError, ValidationError } from '../common/errors.js';
export class ResourceHandlers {
    torrowClient;
    constructor(torrowClient) {
        this.torrowClient = torrowClient;
    }
    /**
     * Handles note resource requests
     */
    async handleNoteResource(request) {
        try {
            // Parse URI to extract noteId
            const uri = request.params.uri.toString();
            // Try multiple URI patterns
            let noteId;
            // Pattern 1: torrow://note/{noteId}
            const uriMatch1 = uri.match(/torrow:\/\/note\/(.+)$/);
            if (uriMatch1 && uriMatch1[1]) {
                noteId = decodeURIComponent(uriMatch1[1]);
            }
            // Pattern 2: torrow://note/{noteId} with query params or fragments
            if (!noteId) {
                const uriMatch2 = uri.match(/torrow:\/\/note\/([^?#]+)/);
                if (uriMatch2 && uriMatch2[1]) {
                    noteId = decodeURIComponent(uriMatch2[1]);
                }
            }
            if (!noteId || noteId === 'undefined' || noteId === '{noteId}' || noteId.trim() === '') {
                throw new ValidationError(`Invalid note URI format. Expected: torrow://note/{noteId} where {noteId} should be replaced with actual note ID (e.g., torrow://note/aae6203eb30ec9f2624061bd89b595f57). Got: ${uri}`);
            }
            const params = NoteResourceSchema.parse({ noteId });
            const note = await this.torrowClient.getNote(params.noteId);
            return {
                contents: [{
                        uri: request.params.uri,
                        mimeType: 'application/json',
                        text: JSON.stringify({
                            id: note.id,
                            name: note.name,
                            text: note.data,
                            tags: note.tags,
                            type: 'note',
                            meta: note.meta
                        }, null, 2)
                    }]
            };
        }
        catch (error) {
            if (error instanceof ValidationError) {
                throw error;
            }
            if (error instanceof Error) {
                throw new NotFoundError(`Note not found: ${error.message}`);
            }
            throw error;
        }
    }
    /**
     * Handles archive resource requests
     */
    async handleArchiveResource(request) {
        try {
            // Parse URI to extract archiveId
            const uri = request.params.uri.toString();
            // Try multiple URI patterns
            let archiveId;
            // Pattern 1: torrow://archive/{archiveId}
            const uriMatch1 = uri.match(/torrow:\/\/archive\/(.+)$/);
            if (uriMatch1 && uriMatch1[1]) {
                archiveId = decodeURIComponent(uriMatch1[1]);
            }
            // Pattern 2: torrow://archive/{archiveId} with query params or fragments
            if (!archiveId) {
                const uriMatch2 = uri.match(/torrow:\/\/archive\/([^?#]+)/);
                if (uriMatch2 && uriMatch2[1]) {
                    archiveId = decodeURIComponent(uriMatch2[1]);
                }
            }
            if (!archiveId || archiveId === 'undefined' || archiveId === '{archiveId}' || archiveId.trim() === '') {
                throw new ValidationError(`Invalid archive URI format. Expected: torrow://archive/{archiveId} where {archiveId} should be replaced with actual archive ID. Got: ${uri}`);
            }
            const params = ArchiveResourceSchema.parse({ archiveId });
            const archive = await this.torrowClient.getNote(params.archiveId);
            if (!archive.groupInfo?.rolesToSearchItems?.includes("PublicReader")) {
                throw new NotFoundError('Specified ID is not an archive');
            }
            return {
                contents: [{
                        uri: request.params.uri,
                        mimeType: 'application/json',
                        text: JSON.stringify({
                            id: archive.id,
                            name: archive.name,
                            text: archive.data,
                            tags: archive.tags,
                            type: 'archive',
                            meta: archive.meta
                        }, null, 2)
                    }]
            };
        }
        catch (error) {
            if (error instanceof ValidationError || error instanceof NotFoundError) {
                throw error;
            }
            if (error instanceof Error) {
                throw new NotFoundError(`Archive not found: ${error.message}`);
            }
            throw error;
        }
    }
    /**
     * Handles archive note resource requests
     */
    async handleArchiveNoteResource(request) {
        try {
            // Parse URI to extract archiveName and noteName
            const uri = request.params.uri.toString();
            const uriMatch = uri.match(/torrow:\/\/archiveNote\/([^/]+)\/(.+)$/);
            if (!uriMatch) {
                throw new ValidationError('Invalid archive note URI format. Expected: torrow://archiveNote/{archiveName}/{noteName}');
            }
            const archiveName = decodeURIComponent(uriMatch[1]);
            const noteName = decodeURIComponent(uriMatch[2]);
            const params = ArchiveNoteResourceSchema.parse({ archiveName, noteName });
            // Find or create MCP context
            let mcpContextId = contextStore.getMcpContextId();
            if (!mcpContextId) {
                const mcpContext = await this.torrowClient.findOrCreateMCPContext();
                mcpContextId = mcpContext.id;
                contextStore.setMcpContextId(mcpContextId);
            }
            // Find archive by name
            const archive = await this.torrowClient.findArchiveByName(params.archiveName, mcpContextId);
            if (!archive) {
                throw new NotFoundError(`Archive "${params.archiveName}" not found`);
            }
            // Find note by name in archive
            const note = await this.torrowClient.findNoteByName(params.noteName, archive.id);
            if (!note) {
                throw new NotFoundError(`Note "${params.noteName}" not found in archive "${params.archiveName}"`);
            }
            return {
                contents: [{
                        uri: request.params.uri,
                        mimeType: 'application/json',
                        text: JSON.stringify({
                            id: note.id,
                            name: note.name,
                            text: note.data,
                            tags: note.tags,
                            type: 'note',
                            archive: {
                                id: archive.id,
                                name: archive.name
                            },
                            meta: note.meta
                        }, null, 2)
                    }]
            };
        }
        catch (error) {
            if (error instanceof NotFoundError || error instanceof ValidationError) {
                throw error;
            }
            if (error instanceof Error) {
                throw new NotFoundError(`Failed to get archive note: ${error.message}`);
            }
            throw error;
        }
    }
    /**
     * Handles archives list resource requests
     */
    async handleArchivesListResource(request) {
        try {
            // Find or create MCP context
            let mcpContextId = contextStore.getMcpContextId();
            if (!mcpContextId) {
                const mcpContext = await this.torrowClient.findOrCreateMCPContext();
                mcpContextId = mcpContext.id;
                contextStore.setMcpContextId(mcpContextId);
            }
            const archives = await this.torrowClient.getArchives(mcpContextId);
            const currentArchiveId = contextStore.getArchiveId();
            const archivesList = archives.map(archive => ({
                id: archive.id,
                name: archive.name,
                text: archive.data,
                tags: archive.tags,
                meta: archive.meta,
                isCurrent: archive.id === currentArchiveId
            }));
            return {
                contents: [{
                        uri: request.params.uri,
                        mimeType: 'application/json',
                        text: JSON.stringify({
                            archives: archivesList,
                            count: archivesList.length
                        }, null, 2)
                    }]
            };
        }
        catch (error) {
            if (error instanceof Error) {
                throw new ValidationError(`Failed to get archives list: ${error.message}`);
            }
            throw error;
        }
    }
    /**
     * Routes resource requests to appropriate handlers
     */
    async handleResourceRequest(request) {
        try {
            const uri = request.params.uri.toString();
            const uriParts = uri.split("://");
            if (uriParts.length < 2) {
                throw new ValidationError(`Invalid URI format: ${uri}`);
            }
            const resourceType = uriParts[1].split("/")[0];
            switch (resourceType) {
                case 'note':
                    return this.handleNoteResource(request);
                case 'archive':
                    return this.handleArchiveResource(request);
                case 'archives':
                    return this.handleArchivesListResource(request);
                case 'archiveNote':
                    return this.handleArchiveNoteResource(request);
                default:
                    throw new NotFoundError(`Unknown resource type: ${resourceType}. Full request: ${JSON.stringify(request, null, 2)}`);
            }
        }
        catch (error) {
            throw error;
        }
    }
}
//# sourceMappingURL=resourceHandlers.js.map