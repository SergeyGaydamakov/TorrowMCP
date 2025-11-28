/**
 * Tests for context store
 */
import { ContextStore } from '../context/contextStore.js';

describe('ContextStore', () => {
  let contextStore: ContextStore;

  beforeEach(() => {
    contextStore = new ContextStore();
  });

  describe('archive operations', () => {
    test('should set and get archive ID', () => {
      const archiveId = 'archive-123';
      contextStore.setArchiveId(archiveId, 'archive-123');
      expect(contextStore.getArchiveId()).toBe(archiveId);
    });

    test('should handle undefined archive ID', () => {
      contextStore.setArchiveId(undefined, undefined);
      expect(contextStore.getArchiveId()).toBeUndefined();
    });

    test('should check if has current archive', () => {
      expect(contextStore.hasCurrentArchive()).toBe(false);
      
      contextStore.setArchiveId('archive-123', 'archive-123');
      expect(contextStore.hasCurrentArchive()).toBe(true);
      
      contextStore.setArchiveId(undefined, undefined);
      expect(contextStore.hasCurrentArchive()).toBe(false);
    });
  });

  describe('note operations', () => {
    test('should set and get note ID', () => {
      const noteId = 'note-456';
      contextStore.setNoteId(noteId, 'note-456');
      expect(contextStore.getNoteId()).toBe(noteId);
    });

    test('should handle undefined note ID', () => {
      contextStore.setNoteId(undefined, undefined);
      expect(contextStore.getNoteId()).toBeUndefined();
    });

    test('should check if has current note', () => {
      expect(contextStore.hasCurrentNote()).toBe(false);
      
      contextStore.setNoteId('note-456', 'note-456');
      expect(contextStore.hasCurrentNote()).toBe(true);
      
      contextStore.setNoteId(undefined, undefined);
      expect(contextStore.hasCurrentNote()).toBe(false);
    });
  });

  describe('context operations', () => {
    test('should get full context', () => {
      contextStore.setArchiveId('archive-123', 'archive-123');
      contextStore.setNoteId('note-456', 'note-456');
      
      const context = contextStore.getContext();
      expect(context).toEqual({
        archiveId: 'archive-123',
        noteId: 'note-456'
      });
    });

    test('should clear all context', () => {
      contextStore.setArchiveId('archive-123', 'archive-123');
      contextStore.setNoteId('note-456', 'note-456');
      
      contextStore.clear();
      
      expect(contextStore.getArchiveId()).toBeUndefined();
      expect(contextStore.getNoteId()).toBeUndefined();
      expect(contextStore.getContext()).toEqual({});
    });

    test('should return copy of context (not reference)', () => {
      contextStore.setArchiveId('archive-123', 'archive-123');
      
      const context1 = contextStore.getContext();
      const context2 = contextStore.getContext();
      
      expect(context1).toEqual(context2);
      expect(context1).not.toBe(context2); // Different objects
    });
  });
});
