/**
 * Torrow API client wrapper
 */
import axios from 'axios';
import { TorrowApiError, AuthenticationError } from '../common/errors.js';
// Torrow API base URL
export const TORROW_API_BASE = 'https://torrow.net';
/**
 * Torrow API client
 */
export class TorrowClient {
    client;
    token;
    constructor(token) {
        this.token = this.normalizeToken(token || process.env.TORROW_TOKEN || '');
        if (!this.token) {
            throw new AuthenticationError('TORROW_TOKEN is required');
        }
        this.client = axios.create({
            baseURL: TORROW_API_BASE,
            headers: {
                'Authorization': this.token,
                'Content-Type': 'application/json'
            }
        });
        // Add response interceptor for error handling
        this.client.interceptors.response.use((response) => response, (error) => {
            if (error.response) {
                throw new TorrowApiError(error.response.data?.message || error.message, error.response.status, error.response.data);
            }
            throw new TorrowApiError(error.message);
        });
    }
    /**
     * Normalizes token by adding "Bearer " prefix if missing
     */
    normalizeToken(token) {
        if (!token)
            return '';
        const trimmed = token.trim();
        if (trimmed.startsWith('Bearer ')) {
            return trimmed;
        }
        return `Bearer ${trimmed}`;
    }
    /**
     * Creates a new note
     */
    async createNote(note, parentId) {
        const params = {};
        if (parentId) {
            params.parentId = parentId;
        }
        const response = await this.client.post('/api/v1/notes', {
            name: note.name,
            data: note.text,
            tags: note.tags,
            noteType: 'Text'
        }, { params });
        return response.data;
    }
    /**
     * Updates an existing note
     */
    async updateNote(torrowId, note) {
        const response = await this.client.put(`/api/v1/notes/${torrowId}`, {
            name: note.name,
            data: note.text,
            tags: note.tags,
            noteType: 'Text'
        });
        return response.data;
    }
    /**
     * Deletes a note
     */
    async deleteNote(torrowId, cascade) {
        const params = {};
        if (cascade !== undefined) {
            params.cascade = cascade.toString();
        }
        await this.client.delete(`/api/v1/notes/${torrowId}`, { params });
    }
    /**
     * Gets a note by ID
     */
    async getNote(torrowId) {
        const response = await this.client.get(`/api/v1/notes/${torrowId}`);
        return response.data;
    }
    /**
     * Sets note as group (archive)
     */
    async setNoteAsGroup(torrowId) {
        await this.client.put(`/api/v1/notes/${torrowId}/group/set`, {
            rolesToInclude: ["Owner", "Manager"],
            rolesToReadItems: [],
            rolesToReadSubscribers: [],
            rolesToSearchItems: ["Owner", "Editor", "Manager", "Reader"],
            rolesToSearchSubscribers: [],
            rolesToUpdateItems: []
        });
    }
    /**
     * Searches notes
     */
    async searchNotes(params) {
        const queryParams = {};
        if (params.text) {
            queryParams.text = params.text;
        }
        if (params.take !== undefined) {
            queryParams.take = params.take.toString();
        }
        else {
            queryParams.take = '10'; // Default limit
        }
        if (params.skip !== undefined) {
            queryParams.skip = params.skip.toString();
        }
        // If archiveId is provided, search within that archive
        if (params.archiveId) {
            queryParams.groupIds = params.archiveId;
        }
        const response = await this.client.get('/api/v1/search/notes', { params: queryParams });
        return {
            items: response.data.items || [],
            totalCount: response.data.totalCount || 0
        };
    }
    /**
     * Checks if note with name exists in archive
     */
    async noteExistsInArchive(name, archiveId) {
        try {
            const result = await this.searchNotes({
                text: name,
                archiveId,
                take: 1
            });
            return result.items.some(note => note.name?.toLowerCase() === name.toLowerCase());
        }
        catch (error) {
            return false;
        }
    }
    /**
     * Checks if archive with name exists
     */
    async archiveExists(name) {
        try {
            const result = await this.searchNotes({
                text: name,
                take: 50 // Search more items to find archives
            });
            return result.items.some(note => note.name?.toLowerCase() === name.toLowerCase() &&
                note.groupInfo?.isGroup === true);
        }
        catch (error) {
            return false;
        }
    }
    /**
     * Gets archives list
     */
    async getArchives() {
        try {
            const result = await this.searchNotes({ take: 50 });
            return result.items.filter(note => note.groupInfo?.isGroup === true);
        }
        catch (error) {
            throw new TorrowApiError(`Failed to get archives: ${error}`);
        }
    }
    /**
     * Finds archive by name
     */
    async findArchiveByName(name) {
        try {
            const archives = await this.getArchives();
            return archives.find(archive => archive.name?.toLowerCase() === name.toLowerCase()) || null;
        }
        catch (error) {
            return null;
        }
    }
    /**
     * Finds note by name in archive
     */
    async findNoteByName(name, archiveId) {
        try {
            const result = await this.searchNotes({
                text: name,
                archiveId,
                take: 50
            });
            return result.items.find(note => note.name?.toLowerCase() === name.toLowerCase() &&
                note.groupInfo?.isGroup !== true) || null;
        }
        catch (error) {
            return null;
        }
    }
}
//# sourceMappingURL=torrowClient.js.map