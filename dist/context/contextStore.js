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
    setArchiveId(archiveId) {
        this.context.archiveId = archiveId;
    }
    /**
     * Gets current archive ID
     */
    getArchiveId() {
        return this.context.archiveId;
    }
    /**
     * Sets current note ID
     */
    setNoteId(noteId) {
        this.context.noteId = noteId;
    }
    /**
     * Gets current note ID
     */
    getNoteId() {
        return this.context.noteId;
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