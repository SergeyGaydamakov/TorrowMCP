/**
 * Torrow API client wrapper
 */
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { TorrowNote, SearchParams, SearchResult, ApiError } from '../common/types.js';
import { TorrowApiError, AuthenticationError } from '../common/errors.js';
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
    }

    // If archiveId is provided, search within that archive
    if (params.archiveId) {
      queryParams.groupIds = params.archiveId;
    }

    const response: AxiosResponse<{ items: TorrowNote[]; totalCount: number }> = 
      await this.client.get('/api/v1/search/notes', { params: queryParams });

    return {
      items: response.data.items || [],
      totalCount: response.data.totalCount || 0
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
        take: 1
      });
      
      return result.items.some(note => 
        note.name?.toLowerCase() === name.toLowerCase()
      );
    } catch (error) {
      return false;
    }
  }

  /**
   * Checks if archive with name exists
   */
  async archiveExists(name: string): Promise<boolean> {
    try {
      const result = await this.searchNotes({
        text: name,
        take: 50 // Search more items to find archives
      });
      
      return result.items.some(note => 
        note.name?.toLowerCase() === name.toLowerCase() && 
        note.groupInfo?.isGroup === true
      );
    } catch (error) {
      return false;
    }
  }

  /**
   * Gets archives list
   */
  async getArchives(): Promise<TorrowNote[]> {
    try {
      const result = await this.searchNotes({ take: 50 });
      
      return result.items.filter(note => note.groupInfo?.isGroup === true);
    } catch (error) {
      throw new TorrowApiError(`Failed to get archives: ${error}`);
    }
  }

  /**
   * Finds archive by name
   */
  async findArchiveByName(name: string): Promise<TorrowNote | null> {
    try {
      const archives = await this.getArchives();
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
}
