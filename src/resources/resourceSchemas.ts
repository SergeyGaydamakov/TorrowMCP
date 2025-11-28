/**
 * Zod schemas for MCP resources
 */
import { z } from 'zod';

export const NoteResourceSchema = z.object({
  noteId: z.string().describe('ID of the note')
});

export const ArchiveResourceSchema = z.object({
  archiveId: z.string().describe('ID of the archive (catalog)')
});

export const ArchivesListResourceSchema = z.object({});

export const ArchiveNoteResourceSchema = z.object({
  archiveName: z.string().describe('Name of the archive (catalog)'),
  noteName: z.string().describe('Name of the note in the archive (catalog)')
});

export type NoteResourceParams = z.infer<typeof NoteResourceSchema>;
export type ArchiveResourceParams = z.infer<typeof ArchiveResourceSchema>;
export type ArchivesListResourceParams = z.infer<typeof ArchivesListResourceSchema>;
export type ArchiveNoteResourceParams = z.infer<typeof ArchiveNoteResourceSchema>;
