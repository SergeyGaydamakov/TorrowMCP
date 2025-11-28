/**
 * Context store for managing conversation context
 */
import { Context } from '../common/types.js';
/**
 * Manages conversation context (current archive and note IDs)
 */
export declare class ContextStore {
    private context;
    /**
     * Gets current context
     */
    getContext(): Context;
    /**
       * Sets current archive ID
       */
    setMcpContextId(contextId: string | undefined): void;
    /**
     * Gets current archive ID
     */
    getMcpContextId(): string | undefined;
    /**
     * Sets current archive ID
     */
    setArchiveId(archiveId: string | undefined, archiveName: string | undefined): void;
    /**
     * Gets current archive ID
     */
    getArchiveId(): string | undefined;
    getArchiveName(): string | undefined;
    /**
     * Sets current note ID
     */
    setNoteId(noteId: string | undefined, noteName: string | undefined): void;
    /**
     * Gets current note ID
     */
    getNoteId(): string | undefined;
    getNoteName(): string | undefined;
    /**
     * Clears all context
     */
    clear(): void;
    /**
     * Checks if we have a current archive
     */
    hasCurrentArchive(): boolean;
    /**
     * Checks if we have a current note
     */
    hasCurrentNote(): boolean;
}
export declare const contextStore: ContextStore;
//# sourceMappingURL=contextStore.d.ts.map