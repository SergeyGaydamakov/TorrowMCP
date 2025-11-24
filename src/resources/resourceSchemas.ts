/**
 * Zod schemas for MCP resources
 */
import { z } from 'zod';

export const NoteResourceSchema = z.object({
  torrowId: z.string().describe('Torrow ID of the note')
});

export const ArchiveResourceSchema = z.object({
  torrowId: z.string().describe('Torrow ID of the archive')
});

export const ArchivesListResourceSchema = z.object({});

export type NoteResourceParams = z.infer<typeof NoteResourceSchema>;
export type ArchiveResourceParams = z.infer<typeof ArchiveResourceSchema>;
export type ArchivesListResourceParams = z.infer<typeof ArchivesListResourceSchema>;
