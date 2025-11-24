/**
 * Context store for managing conversation context
 */
import { Context } from '../common/types.js';

/**
 * Manages conversation context (current archive and note IDs)
 */
export class ContextStore {
  private context: Context = {};

  /**
   * Gets current context
   */
  getContext(): Context {
    return { ...this.context };
  }

  /**
   * Sets current archive ID
   */
  setArchiveId(archiveId: string | undefined): void {
    this.context.archiveId = archiveId;
  }

  /**
   * Gets current archive ID
   */
  getArchiveId(): string | undefined {
    return this.context.archiveId;
  }

  /**
   * Sets current note ID
   */
  setNoteId(noteId: string | undefined): void {
    this.context.noteId = noteId;
  }

  /**
   * Gets current note ID
   */
  getNoteId(): string | undefined {
    return this.context.noteId;
  }

  /**
   * Clears all context
   */
  clear(): void {
    this.context = {};
  }

  /**
   * Checks if we have a current archive
   */
  hasCurrentArchive(): boolean {
    return Boolean(this.context.archiveId);
  }

  /**
   * Checks if we have a current note
   */
  hasCurrentNote(): boolean {
    return Boolean(this.context.noteId);
  }
}

// Global context store instance
export const contextStore = new ContextStore();
