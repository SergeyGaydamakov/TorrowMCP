/**
 * Manages conversation context (current archive and note IDs)
 */
export class ContextStore {
    context = {};
    /**
     * Gets current context
     */
    getContext() {
        return { ...this.context };
    }
    /**
       * Sets current archive ID
       */
    setMcpContextId(contextId) {
        this.context.contextId = contextId;
    }
    /**
     * Gets current archive ID
     */
    getMcpContextId() {
        return this.context.contextId;
    }
    /**
     * Sets current archive ID
     */
    setArchiveId(archiveId, archiveName) {
        this.context.archiveId = archiveId;
        this.context.archiveName = archiveName;
        this.setNoteId(undefined, undefined);
    }
    /**
     * Gets current archive ID
     */
    getArchiveId() {
        return this.context.archiveId;
    }
    getArchiveName() {
        return this.context.archiveName;
    }
    /**
     * Sets current note ID
     */
    setNoteId(noteId, noteName) {
        this.context.noteId = noteId;
        this.context.noteName = noteName;
    }
    /**
     * Gets current note ID
     */
    getNoteId() {
        return this.context.noteId;
    }
    getNoteName() {
        return this.context.noteName;
    }
    /**
     * Clears all context
     */
    clear() {
        this.context = {};
    }
    /**
     * Checks if we have a current archive
     */
    hasCurrentArchive() {
        return Boolean(this.context.archiveId);
    }
    /**
     * Checks if we have a current note
     */
    hasCurrentNote() {
        return Boolean(this.context.noteId);
    }
}
// Global context store instance
export const contextStore = new ContextStore();
//# sourceMappingURL=contextStore.js.map