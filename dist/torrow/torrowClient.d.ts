import { TorrowNote, SearchParams, SearchResult } from '../common/types.js';
export declare const TORROW_API_BASE = "https://torrow.net";
/**
 * Torrow API client
 */
export declare class TorrowClient {
    private client;
    private token;
    constructor(token?: string);
    /**
     * Normalizes token by adding "Bearer " prefix if missing
     */
    private normalizeToken;
    /**
     * Creates a new note
     */
    createNote(note: Partial<TorrowNote>, parentId?: string): Promise<TorrowNote>;
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
     * Sets note as group (archive)
     */
    setNoteAsGroup(torrowId: string): Promise<void>;
    /**
     * Searches notes
     */
    searchNotes(params: SearchParams): Promise<SearchResult>;
    /**
     * Checks if note with name exists in archive
     */
    noteExistsInArchive(name: string, archiveId?: string): Promise<boolean>;
    /**
     * Checks if archive with name exists
     */
    archiveExists(name: string): Promise<boolean>;
    /**
     * Gets archives list
     */
    getArchives(): Promise<TorrowNote[]>;
    /**
     * Finds archive by name
     */
    findArchiveByName(name: string): Promise<TorrowNote | null>;
    /**
     * Finds note by name in archive
     */
    findNoteByName(name: string, archiveId?: string): Promise<TorrowNote | null>;
}
//# sourceMappingURL=torrowClient.d.ts.map