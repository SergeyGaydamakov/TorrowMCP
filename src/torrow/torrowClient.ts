/**
 * Torrow API client wrapper
 */
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { TorrowNote, TorrowContext, SearchParams, SearchResult, ApiError, NoteViewResponse } from '../common/types.js';
import { TorrowApiError, AuthenticationError, ContextError } from '../common/errors.js';
import { NotFoundError } from '../common/errors.js';

// Torrow API base URL
const DEFAULT_TORROW_API_BASE = 'https://torrow.net';

/**
 * Torrow API client
 */
export class TorrowClient {
  private client: AxiosInstance;
  private token: string;
  private apiBase: string;

  constructor(token?: string, apiBase?: string) {
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
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          throw new TorrowApiError(
            error.response.data?.message || error.message,
            error.response.status,
            error.response.data
          );
        }
        throw new TorrowApiError(error.message);
      }
    );
  }

  /**
   * Normalizes token by adding "Bearer " prefix if missing
   */
  private normalizeToken(token: string): string {
    if (!token) return '';
    
    const trimmed = token.trim();
    if (trimmed.startsWith('Bearer ')) {
      return trimmed;
    }
    return `Bearer ${trimmed}`;
  }

  /**
   * Creates a new note
   */
  async createArchive(note: Partial<TorrowNote>, parentId?: string, profileId?: string): Promise<TorrowNote> {
    const params: Record<string, string> = {};
    if (parentId) {
      params.parentId = parentId;
    }
    if (profileId) {
      params.profileId = profileId;
    }
    
    // Build request body, filtering out undefined values
    const requestBody: Record<string, unknown> = {};
    if (note.name !== undefined) {
      requestBody.name = note.name;
    }
    if (note.text !== undefined) {
      requestBody.data = note.text;
    }
    if (note.tags !== undefined) {
      requestBody.tags = note.tags;
    }
    requestBody.noteType = note.noteType || 'Text';
    requestBody.discriminator = 'NoteItem';
    requestBody.publicityType = 'Link';
    requestBody.files = [];
    requestBody.imagePreviewSize = 'Small';
    requestBody.publicityType = 'Link';
    // requestBody.searchMode = 'NoneSearchMode';
    // requestBody.anyoneAccess = 'Read';

    requestBody.groupInfo = {
      rolesToInclude: ["Owner", "Manager"],
      rolesToReadItems: ["Owner", "Editor", "Manager", "Reader", "PublicReader"],
      rolesToReadSubscribers: null,
      rolesToSearchItems: ["Owner", "Editor", "Manager", "Reader", "PublicReader"],
      rolesToSearchSubscribers: null,
      rolesToUpdateItems: ["Owner", "Editor", "Manager"]
    };

    const response: AxiosResponse<TorrowNote> = await this.client.post('/api/v1/notes', requestBody, { params });

    return response.data;
  }

  /**
   * Creates a new note
   */
  async createNote(note: Partial<TorrowNote>, parentId?: string, profileId?: string): Promise<TorrowNote> {
    const params: Record<string, string> = {};
    if (parentId) {
      params.parentId = parentId;
    }
    if (profileId) {
      params.profileId = profileId;
    }
    
    // Build request body, filtering out undefined values
    const requestBody: Record<string, unknown> = {};
    if (note.name !== undefined) {
      requestBody.name = note.name;
    }
    if (note.text !== undefined) {
      requestBody.data = note.text;
    }
    if (note.tags !== undefined) {
      requestBody.tags = note.tags;
    }
    requestBody.noteType = note.noteType || 'Text';
    requestBody.discriminator = 'NoteItem';
    requestBody.publicityType = 'Link';
    requestBody.files = [];
    requestBody.imagePreviewSize = 'Small';
    requestBody.publicityType = 'Link';
    // requestBody.searchMode = 'NoneSearchMode';
    // requestBody.anyoneAccess = 'Read';
    
    const response: AxiosResponse<TorrowNote> = await this.client.post('/api/v1/notes', requestBody, { params });

    return response.data;
  }

  /**
   * Updates an existing note
   */
  async updateNote(torrowId: string, note: Partial<TorrowNote>): Promise<TorrowNote> {
    // Build request body, filtering out undefined values
    const requestBody: Record<string, unknown> = {};
    if (note.name !== undefined) {
      requestBody.name = note.name;
    }
    if (note.text !== undefined) {
      requestBody.data = note.text;
    }
    if (note.tags !== undefined) {
      requestBody.tags = note.tags;
    }
    if (note.noteType !== undefined) {
      requestBody.noteType = note.noteType;
    }
    
    const response: AxiosResponse<TorrowNote> = await this.client.put(`/api/v1/notes/${torrowId}`, requestBody);

    return response.data;
  }

  /**
   * Deletes a note
   */
  async deleteNote(torrowId: string, cascade?: boolean): Promise<void> {
    const params: Record<string, string> = {};
    if (cascade !== undefined) {
      params.cascade = cascade.toString();
    }

    await this.client.delete(`/api/v1/notes/${torrowId}`, { params });
  }

  /**
   * Gets a note by ID
   */
  async getNote(torrowId: string): Promise<TorrowNote> {
    const response: AxiosResponse<TorrowNote> = await this.client.get(`/api/v1/notes/${torrowId}`);
    return response.data;
  }

  /**
   * Maps NoteViewResponse to TorrowNote
   */
  private mapNoteViewToTorrowNote(item: NoteViewResponse): TorrowNote {
    return {
      id: item.itemObject?.id || '',
      name: item.name || '',
      text: item.data,
      tags: item.tags,
      noteType: item.noteType,
      meta: item.itemObject?.meta,
      groupInfo: item.groupInfo
    };
  }

  /**
   * Gets user notes in element with specified parentId
   */
  async getUserNotesByParentId(parentId: string, take?: number, skip?: number): Promise<TorrowNote[]> {
    const params: Record<string, string> = {
      take: take?.toString() || '10',
      skip: skip?.toString() || '0'
    };
    
    const response: AxiosResponse<NoteViewResponse[]> = await this.client.get(`/api/v1/notes/${parentId}/views/user`, { params });
    
    const items = response.data || [];
    return items.map(item => this.mapNoteViewToTorrowNote(item));
  }

  /**
   * Gets pinned notes in element with specified parentId
   */
  async getPinnedNotesByParentId(parentId: string, take?: number, skip?: number): Promise<TorrowNote[]> {
    const params: Record<string, string> = {
      take: take?.toString() || '10',
      skip: skip?.toString() || '0'
    };
    
    const response: AxiosResponse<NoteViewResponse[]> = await this.client.get(`/api/v1/notes/${parentId}/views/pinned`, { params });
    
    const items = response.data || [];
    return items.map(item => this.mapNoteViewToTorrowNote(item));
  }

  /**
   * Sets note as group (archive)
   */
  async setNoteAsGroup(torrowId: string): Promise<void> {
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
   * Adds note to group (includes note in group)
   */
  async addNoteToGroup(noteId: string, parentId: string, tags?: string[]): Promise<void> {
    const params: Record<string, string> = {
      parentId: parentId
    };
    // Second call: update groups
    const updateGroupsBody = [{
      groupId: parentId,
      include: true,
      tags: tags || []
    }];
    await this.client.put(`/api/v1/notes/${noteId}/updategroups`, updateGroupsBody, { params });
  }

  /**
   * Searches notes
   */
  async searchNotes(params: SearchParams): Promise<SearchResult> {
    const queryParams: Record<string, string> = {};
    
    if (params.text) {
      queryParams.text = params.text;
    }
    
    if (params.take !== undefined) {
      queryParams.take = params.take.toString();
    } else {
      queryParams.take = '10'; // Default limit
    }
    
    if (params.skip !== undefined) {
      queryParams.skip = params.skip.toString();
    } else {
      queryParams.skip = '0';
    }

    if (params.distance) {
      queryParams.distance = params.distance.toString();
    }

    // If archiveId is provided, search within that archive
    if (params.archiveId) {
      queryParams.groupIds = params.archiveId;
    }

    const response: AxiosResponse<NoteViewResponse[]> = 
      await this.client.get('/api/v1/search/notes', { params: queryParams });

    const items = response.data || [];
    return {
      items: items.map(item => this.mapNoteViewToTorrowNote(item)),
      totalCount: items.length
    };
  }

  /**
   * Checks if note with name exists in archive
   */
  async noteExistsInArchive(name: string, archiveId?: string): Promise<boolean> {
    try {
      const result = await this.searchNotes({
        text: name,
        archiveId,
        take: 20,    // Так поиск по подстроке, то нужно взять больше заметок, чтобы найти нужную
        distance: undefined
      });
      
      return result.items.some(note => 
        note.name?.toLowerCase() === name.toLowerCase()
      );
    } catch (error) {
      return false;
    }
  }

  /**
   * Gets archives list
   */
  async getArchives(mcpContextId?: string): Promise<TorrowNote[]> {
    if (!mcpContextId) {
      throw new ContextError('В методе getArchives не указан ID служебного раздела "MCP"');
    }
    try {
      const result = await this.getUserNotesByParentId(mcpContextId, 20, 0);
      
      return result;
    } catch (error) {
      throw new TorrowApiError(`Failed to get archives: ${error}`);
    }
  }

  /**
   * Finds archive by name
   */
  async findArchiveByName(name: string, mcpContextId?: string): Promise<TorrowNote | null> {
    if (!mcpContextId) {
      throw new ContextError('В методе findArchiveByName не указан ID служебного раздела "MCP"');
    }
    try {
      const archives = await this.getArchives(mcpContextId);
      return archives.find(archive => 
        archive.name?.toLowerCase() === name.toLowerCase()
      ) || null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Finds note by name in archive
   */
  async findNoteByName(name: string, archiveId?: string): Promise<TorrowNote | null> {
    try {
      const result = await this.searchNotes({
        text: name,
        archiveId,
        take: 50
      });
      
      return result.items.find(note => 
        note.name?.toLowerCase() === name.toLowerCase() &&
        note.groupInfo?.isGroup !== true
      ) || null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Creates a new context (Раздел)
   */
  async createContext(name: string): Promise<TorrowContext> {
    const requestBody: Record<string, unknown> = {};
    requestBody.name = name;
    requestBody.discriminator = 'ContextItem';
    // requestBody.profileId = profileId;
   
    const response: AxiosResponse<TorrowContext> = await this.client.post('/api/v1/contexts', requestBody);

    return response.data;
  }

  /**
   * Gets list of contexts (Разделы)
   */
  async getContexts(): Promise<TorrowContext[]> {
    const params: Record<string, string> = {
      take: '20',
      skip: '0',
      lmfrom: '1970-01-01T00:00:00.000Z',
      includeDeleted: 'false',
      sort: 'OrderDesc'
    };
    
    const response: AxiosResponse<TorrowContext[]> = await this.client.get('/api/v1/contexts/personallist', { params });
    
    return response.data || [];
  }

  /**
   * Поиск или создание служебного раздела "MCP"
   */
  async findOrCreateMCPContext(): Promise<TorrowContext> {
    const contexts = await this.getContexts();
    const mcpContext = contexts.find(context => context.name === 'MCP');
    if (mcpContext) {
      return mcpContext;
    }
    const newContext = await this.createContext('MCP');
    return newContext;
  }
}
