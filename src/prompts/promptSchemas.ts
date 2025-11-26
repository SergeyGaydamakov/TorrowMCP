/**
 * Zod schemas for MCP prompts
 */
import { z } from 'zod';

export const SelectArchiveSchema = z.object({
  archiveName: z.string().describe('Name of the archive to select')
});

export const SelectNoteSchema = z.object({
  noteName: z.string().optional().describe('Name of the note to select'),
  noteIndex: z.coerce.number().optional().describe('Index of the note from search results (1-based)')
});

export const ContextStatusSchema = z.object({});

export type SelectArchiveParams = z.infer<typeof SelectArchiveSchema>;
export type SelectNoteParams = z.infer<typeof SelectNoteSchema>;
export type ContextStatusParams = z.infer<typeof ContextStatusSchema>;
