import { TorrowCreateNoteInfo, TorrowNote, TorrowNoteInArchive, TorrowContext, SearchResult } from "../common/types.js";
import { TorrowClient } from "../torrow/torrowClient.js";
export declare class TorrowService {
    private torrowClient;
    private mcpContext;
    constructor(torrowClient: TorrowClient);
    /**
     * Creates a note in an archive (group, catalog)
     * @param createNoteInfo - information to create a note
     * @param archiveId - ID of the archive to create the note in
     * @returns created note
     */
    createNoteInArchive(createNoteInfo: TorrowCreateNoteInfo, archiveId: string): Promise<TorrowNoteInArchive>;
    /**
     * Updates a note by ID
     * @param noteId - ID of the note to update
     * @param noteName - new name of the note
     * @param noteText - new text of the note
     * @param noteTags - new tags of the note
     * @returns updated note
     */
    updateNote(noteId: string, noteName?: string, noteText?: string, noteTags?: string[]): Promise<TorrowNote>;
    /**
     * Deletes a note by ID
     * @param noteId - ID of the note to delete
     * @returns deleted note
     */
    deleteNote(noteId: string): Promise<TorrowNote>;
    /**
     * Gets a note by ID
     * @param noteId - ID of the note to get
     * @returns note
     */
    getNote(noteId: string): Promise<TorrowNote>;
    /**
     * Maps NoteViewResponse to TorrowNote
     */
    private mapNoteViewToTorrowNote;
    /**
     * Searches notes in archive (group, catalog)
     * @param text - text to search
     * @param take - number of notes to take
     * @param skip - number of notes to skip
     * @param archiveId - ID of the archive to search in
     * @param tags - tags to search
     * @param distance - distance to search
     * @returns list of notes
     */
    searchNotes(text?: string, take?: number, skip?: number, archiveId?: string, tags?: string[], distance?: number): Promise<SearchResult>;
    /**
     * Gets notes with user link to parent element
     * @param parentId - ID of the parent element to get notes from
     * @param take - number of notes to take
     * @param skip - number of notes to skip
     * @returns list of notes
     */
    getUserNotes(parentId: string, take?: number, skip?: number): Promise<TorrowNote[]>;
    /**
     * Gets pinned notes from parent element
     * @param parentId - ID of the parent element to get pinned notes from
     * @param take - number of notes to take
     * @param skip - number of notes to skip
     * @returns list of notes
     */
    getPinnedNotes(parentId: string, take?: number, skip?: number): Promise<TorrowNote[]>;
    /**
     * Checks if note is an archive
     * @param note - note to check
     * @returns true if note is an archive, false otherwise
     */
    NoteIsArchive(note: TorrowNote): boolean;
    /**
     * Creates an archive (catalog)
     * @param createNoteInfo - information to create an archive
     * @returns created archive
     */
    createArchive(createNoteInfo: TorrowCreateNoteInfo): Promise<TorrowNote>;
    /**
     * Updates an archive (catalog)
     * @param archiveId - ID of the archive to update
     * @param archiveName - new name of the archive
     * @param archiveText - new text of the archive
     * @param archiveTags - new tags of the archive
     * @returns updated archive
     */
    updateArchive(archiveId: string, archiveName?: string, archiveText?: string, archiveTags?: string[]): Promise<TorrowNote>;
    /**
     * Deletes an archive (catalog)
     * @param archiveId - ID of the archive to delete
     * @param cascade - whether to delete notes in the archive
     * @returns deleted archive
     */
    deleteArchive(archiveId: string, cascade?: boolean): Promise<TorrowNote>;
    /**
     * Gets archive (catalog) by ID
     * @param archiveId - ID of the archive to get
     * @returns archive
     */
    getArchive(archiveId: string): Promise<TorrowNote>;
    /**
     * Gets list of archives (catalogs)
     * @returns list of archives
     */
    getArchives(): Promise<TorrowNote[]>;
    /**
     * Finds archive by name
     */
    findArchiveByName(name: string): Promise<TorrowNote | null>;
    /**
     * Finds note by name in archive
     */
    findNoteByName(name: string, archiveId: string): Promise<TorrowNote | null>;
    /**
     * Поиск или создание служебного раздела "MCP"
     */
    findOrCreateMCPContext(): Promise<TorrowContext>;
    /**
     * Checks if note with name exists in archive
     * @param name - name of the note to check
     * @param archiveId - ID of the archive to check in
     * @returns true if note exists, false otherwise
     */
    noteExistsInArchive(name: string, archiveId?: string): Promise<boolean>;
}
//# sourceMappingURL=torrowService.d.ts.map