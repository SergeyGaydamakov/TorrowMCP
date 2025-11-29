/**
 * Torrow API client wrapper
 */
import axios from 'axios';
import { TorrowApiError, AuthenticationError } from '../common/errors.js';
// Torrow API base URL
const DEFAULT_TORROW_API_BASE = 'https://torrow.net';
/**
 * Torrow API client
 */
export class TorrowClient {
    client;
    token;
    apiBase;
    constructor(token, apiBase) {
        this.apiBase = apiBase || DEFAULT_TORROW_API_BASE;
        this.token = this.normalizeToken(token || '');
        if (!this.token) {
            throw new AuthenticationError('TORROW_TOKEN is required');
        }
        this.client = axios.create({
            baseURL: this.apiBase,
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
    async createNote(createNoteInfo, parentId, profileId) {
        const params = {};
        if (parentId) {
            params.parentId = parentId;
        }
        if (profileId) {
            params.profileId = profileId;
        }
        // Build request body, filtering out undefined values
        const requestBody = {};
        if (createNoteInfo.name !== undefined) {
            requestBody.name = createNoteInfo.name;
        }
        if (createNoteInfo.data !== undefined) {
            requestBody.data = createNoteInfo.data;
        }
        if (createNoteInfo.tags !== undefined) {
            requestBody.tags = createNoteInfo.tags;
        }
        requestBody.noteType = createNoteInfo.noteType || 'Text';
        requestBody.discriminator = 'NoteItem';
        requestBody.files = [];
        requestBody.imagePreviewSize = 'Small';
        requestBody.publicityType = 'Link';
        // requestBody.searchMode = 'NoneSearchMode';
        // requestBody.anyoneAccess = 'Read';
        const response = await this.client.post('/api/v1/notes', requestBody, { params });
        return response.data;
    }
    /**
     * Updates an existing note
     */
    async updateNote(note) {
        const response = await this.client.put(`/api/v1/notes/${note.id}`, note);
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
     * Gets user notes in element with specified parentId
     */
    async getUserNotesByParentId(parentId, take, skip) {
        const params = {
            take: take?.toString() || '10',
            skip: skip?.toString() || '0'
        };
        const response = await this.client.get(`/api/v1/notes/${parentId}/views/user`, { params });
        return response.data || [];
    }
    /**
     * Gets pinned notes in element with specified parentId
     */
    async getPinnedNotesByParentId(parentId, take, skip) {
        const params = {
            take: take?.toString() || '10',
            skip: skip?.toString() || '0'
        };
        const response = await this.client.get(`/api/v1/notes/${parentId}/views/pinned`, { params });
        return response.data || [];
    }
    /**
     * Sets note as group (archive)
     */
    async setNoteAsGroup(torrowId) {
        const groupBody = {
            rolesToInclude: ["Owner", "Manager"],
            rolesToReadItems: ["Owner", "Editor", "Manager", "Reader", "PublicReader"],
            rolesToReadSubscribers: null,
            rolesToSearchItems: ["Owner", "Editor", "Manager", "Reader", "PublicReader"],
            rolesToSearchSubscribers: null,
            rolesToUpdateItems: ["Owner", "Manager"]
        };
        await this.client.put(`/api/v1/notes/${torrowId}/group/set`, groupBody);
    }
    /**
     * Adds note to group (includes note in group)
     */
    async addNoteToGroup(noteId, parentId, groupTags) {
        const params = {
            parentId: parentId
        };
        // Second call: update groups
        const updateGroupsBody = [{
                groupId: parentId,
                include: true,
                tags: groupTags || []
            }];
        await this.client.put(`/api/v1/notes/${noteId}/updategroups`, updateGroupsBody, { params });
    }
    /**
     * Searches notes
     */
    async searchNotes(text, take, skip, archiveId, tags, distance) {
        const queryParams = {};
        if (text) {
            queryParams.text = text;
        }
        if (take !== undefined) {
            queryParams.take = take.toString();
        }
        else {
            queryParams.take = '10'; // Default limit
        }
        if (skip !== undefined) {
            queryParams.skip = skip.toString();
        }
        else {
            queryParams.skip = '0';
        }
        // If archiveId is provided, search within that archive
        if (archiveId) {
            queryParams.groupIds = archiveId;
        }
        if (tags && tags.length > 0) {
            queryParams.tags = tags.join(',');
        }
        if (distance) {
            queryParams.distance = distance.toString();
        }
        const response = await this.client.get('/api/v1/search/notes', { params: queryParams });
        return response.data || [];
    }
    /**
     * Creates a new context (Раздел)
     */
    async createContext(name) {
        const requestBody = {};
        requestBody.name = name;
        requestBody.discriminator = 'ContextItem';
        // requestBody.profileId = profileId;
        const response = await this.client.post('/api/v1/contexts', requestBody);
        return response.data;
    }
    /**
     * Gets list of contexts (Разделы)
     */
    async getContexts() {
        const params = {
            take: '20',
            skip: '0',
            lmfrom: '1970-01-01T00:00:00.000Z',
            includeDeleted: 'false',
            sort: 'OrderDesc'
        };
        const response = await this.client.get('/api/v1/contexts/personallist', { params });
        return response.data || [];
    }
}
//# sourceMappingURL=torrowClient.js.map