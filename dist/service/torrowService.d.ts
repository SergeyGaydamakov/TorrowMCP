import { TorrowCreateNoteInfo, TorrowNote, TorrowNoteInArchive, TorrowContext, SearchResult } from "../common/types.js";
import { TorrowClient } from "../torrow/torrowClient.js";
export declare class TorrowService {
    private torrowClient;
    constructor(torrowClient: TorrowClient);
    createNoteInArchive(createNoteInfo: TorrowCreateNoteInfo, archiveId: string): Promise<TorrowNoteInArchive>;
    updateNote(noteId: string, noteName?: string, noteText?: string, noteTags?: string[]): Promise<TorrowNote>;
    deleteNote(noteId: string): Promise<TorrowNote>;
    getNote(noteId: string): Promise<TorrowNote>;
    getNotes(archiveId: string, take?: number, skip?: number): Promise<TorrowNote[]>;
    /**
     * Maps NoteViewResponse to TorrowNote
     */
    private mapNoteViewToTorrowNote;
    searchNotes(text?: string, take?: number, skip?: number, archiveId?: string, tags?: string[], distance?: number): Promise<SearchResult>;
    getPinnedNotes(archiveId: string, take?: number, skip?: number): Promise<TorrowNote[]>;
    NoteIsArchive(note: TorrowNote): boolean;
    createArchive(createNoteInfo: TorrowCreateNoteInfo): Promise<TorrowNote>;
    updateArchive(archiveId: string, archiveName?: string, archiveText?: string, archiveTags?: string[]): Promise<TorrowNote>;
    deleteArchive(archiveId: string, cascade?: boolean): Promise<TorrowNote>;
    /**
     * Gets archives list
     */
    getArchive(archiveId: string): Promise<TorrowNote>;
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
     */
    noteExistsInArchive(name: string, archiveId?: string): Promise<boolean>;
}
//# sourceMappingURL=torrowService.d.ts.map