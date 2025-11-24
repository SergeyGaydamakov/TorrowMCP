import { NoteResourceSchema, ArchiveResourceSchema } from './resourceSchemas.js';
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
            const params = NoteResourceSchema.parse(request.params);
            const note = await this.torrowClient.getNote(params.torrowId);
            return {
                contents: [{
                        uri: request.params.uri,
                        mimeType: 'application/json',
                        text: JSON.stringify({
                            id: note.id,
                            name: note.name,
                            text: note.text,
                            tags: note.tags,
                            type: 'note',
                            meta: note.meta
                        }, null, 2)
                    }]
            };
        }
        catch (error) {
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
            const params = ArchiveResourceSchema.parse(request.params);
            const archive = await this.torrowClient.getNote(params.torrowId);
            if (!archive.groupInfo?.isGroup) {
                throw new NotFoundError('Specified ID is not an archive');
            }
            return {
                contents: [{
                        uri: request.params.uri,
                        mimeType: 'application/json',
                        text: JSON.stringify({
                            id: archive.id,
                            name: archive.name,
                            text: archive.text,
                            tags: archive.tags,
                            type: 'archive',
                            meta: archive.meta
                        }, null, 2)
                    }]
            };
        }
        catch (error) {
            if (error instanceof Error) {
                throw new NotFoundError(`Archive not found: ${error.message}`);
            }
            throw error;
        }
    }
    /**
     * Handles archives list resource requests
     */
    async handleArchivesListResource(request) {
        try {
            const archives = await this.torrowClient.getArchives();
            const archivesList = archives.map(archive => ({
                id: archive.id,
                name: archive.name,
                text: archive.text,
                tags: archive.tags,
                meta: archive.meta
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
        const uri = new URL(request.params.uri);
        const resourceType = uri.pathname;
        switch (resourceType) {
            case '/note':
                return this.handleNoteResource(request);
            case '/archive':
                return this.handleArchiveResource(request);
            case '/archives':
                return this.handleArchivesListResource(request);
            default:
                throw new NotFoundError(`Unknown resource type: ${resourceType}`);
        }
    }
}
//# sourceMappingURL=resourceHandlers.js.map