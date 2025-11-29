import { TorrowCreateNoteInfo, TorrowNote, TorrowContext, NoteViewResponse } from '../common/types.js';
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
    createNote(createNoteInfo: TorrowCreateNoteInfo, parentId?: string, profileId?: string): Promise<TorrowNote>;
    /**
     * Updates an existing note
     */
    updateNote(note: Partial<TorrowNote>): Promise<TorrowNote>;
    /**
     * Deletes a note
     */
    deleteNote(torrowId: string, cascade?: boolean): Promise<void>;
    /**
     * Gets a note by ID
     */
    getNote(torrowId: string): Promise<TorrowNote>;
    /**
     * Gets user notes in element with specified parentId
     */
    getUserNotesByParentId(parentId: string, take?: number, skip?: number): Promise<NoteViewResponse[]>;
    /**
     * Gets pinned notes in element with specified parentId
     */
    getPinnedNotesByParentId(parentId: string, take?: number, skip?: number): Promise<NoteViewResponse[]>;
    /**
     * Sets note as group (archive)
     */
    setNoteAsGroup(torrowId: string): Promise<void>;
    /**
     * Adds note to group (includes note in group)
     */
    addNoteToGroup(noteId: string, parentId: string, groupTags?: string[]): Promise<void>;
    /**
     * Searches notes
     */
    searchNotes(text?: string, take?: number, skip?: number, archiveId?: string, tags?: string[], distance?: number): Promise<NoteViewResponse[]>;
    /**
     * Creates a new context (Раздел)
     */
    createContext(name: string): Promise<TorrowContext>;
    /**
     * Gets list of contexts (Разделы)
     */
    getContexts(): Promise<TorrowContext[]>;
}
//# sourceMappingURL=torrowClient.d.ts.map