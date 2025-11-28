import { TorrowNote, TorrowContext, SearchParams, SearchResult } from '../common/types.js';
/**
 * Torrow API client
 */
export declare class TorrowClient {
    private client;
    private token;
    private apiBase;
    constructor(token?: string, apiBase?: string);
    /**
     * Normalizes token by adding "Bearer " prefix if missing
     */
    private normalizeToken;
    /**
     * Creates a new note
     */
    createNote(note: Partial<TorrowNote>, parentId?: string, profileId?: string): Promise<TorrowNote>;
    /**
     * Updates an existing note
     */
    updateNote(torrowId: string, note: Partial<TorrowNote>): Promise<TorrowNote>;
    /**
     * Deletes a note
     */
    deleteNote(torrowId: string, cascade?: boolean): Promise<void>;
    /**
     * Gets a note by ID
     */
    getNote(torrowId: string): Promise<TorrowNote>;
    /**
     * Maps NoteViewResponse to TorrowNote
     */
    private mapNoteViewToTorrowNote;
    /**
     * Gets user notes in element with specified parentId
     */
    getUserNotesByParentId(parentId: string, take?: number, skip?: number): Promise<TorrowNote[]>;
    /**
     * Gets pinned notes in element with specified parentId
     */
    getPinnedNotesByParentId(parentId: string, take?: number, skip?: number): Promise<TorrowNote[]>;
    /**
     * Sets note as group (archive)
     */
    setNoteAsGroup(torrowId: string): Promise<void>;
    /**
     * Adds note to group (includes note in group)
     */
    addNoteToGroup(noteId: string, parentId: string, tags?: string[]): Promise<void>;
    /**
     * Searches notes
     */
    searchNotes(params: SearchParams): Promise<SearchResult>;
    /**
     * Checks if note with name exists in archive
     */
    noteExistsInArchive(name: string, archiveId?: string): Promise<boolean>;
    /**
     * Gets archives list
     */
    getArchives(mcpContextId?: string): Promise<TorrowNote[]>;
    /**
     * Finds archive by name
     */
    findArchiveByName(name: string, mcpContextId?: string): Promise<TorrowNote | null>;
    /**
     * Finds note by name in archive
     */
    findNoteByName(name: string, archiveId?: string): Promise<TorrowNote | null>;
    /**
     * Creates a new context (Раздел)
     */
    createContext(name: string): Promise<TorrowContext>;
    /**
     * Gets list of contexts (Разделы)
     */
    getContexts(): Promise<TorrowContext[]>;
    /**
     * Поиск или создание служебного раздела "MCP"
     */
    findOrCreateMCPContext(): Promise<TorrowContext>;
}
//# sourceMappingURL=torrowClient.d.ts.map