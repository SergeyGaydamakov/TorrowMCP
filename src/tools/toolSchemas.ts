/**
 * Zod schemas for MCP tools
 */
import { z } from 'zod';

export const CreateNoteSchema = z.object({
  phrase: z.string().describe('Phrase in format: <name>.<text>#tag#tag')
});

export const UpdateNoteSchema = z.object({
  phrase: z.string().describe('New phrase in format: <name>.<text>#tag#tag')
});

export const DeleteNoteSchema = z.object({});

export const SearchNotesSchema = z.object({
  phrase: z.string().optional().describe('Search phrase'),
  tags: z.array(z.string()).optional().describe('Tags to filter by'),
  limit: z.coerce.number().optional().default(10).describe('Maximum number of results (default: 10)')
});

export const CreateArchiveSchema = z.object({
  phrase: z.string().describe('Phrase in format: <name>.<text>#tag#tag')
});

export const UpdateArchiveSchema = z.object({
  phrase: z.string().describe('New phrase in format: <name>.<text>#tag#tag')
});

export const DeleteArchiveSchema = z.object({
  cascade: z.coerce.boolean().optional().default(false).describe('Delete all notes in archive (default: false)')
});

export const SelectArchiveByIdSchema = z.object({
  archiveId: z.string().describe('ID of the archive to select')
});

export const SelectArchiveByNameSchema = z.object({
  archiveName: z.string().describe('Name of the archive to select')
});

export const SelectNoteByIdSchema = z.object({
  noteId: z.string().describe('ID of the note to select')
});

export const SelectNoteByNameSchema = z.object({
  noteName: z.string().describe('Name of the note to select')
});

export type CreateNoteParams = z.infer<typeof CreateNoteSchema>;
export type UpdateNoteParams = z.infer<typeof UpdateNoteSchema>;
export type DeleteNoteParams = z.infer<typeof DeleteNoteSchema>;
export type SearchNotesParams = z.infer<typeof SearchNotesSchema>;
export type CreateArchiveParams = z.infer<typeof CreateArchiveSchema>;
export type UpdateArchiveParams = z.infer<typeof UpdateArchiveSchema>;
export type DeleteArchiveParams = z.infer<typeof DeleteArchiveSchema>;
export type SelectArchiveByIdParams = z.infer<typeof SelectArchiveByIdSchema>;
export type SelectArchiveByNameParams = z.infer<typeof SelectArchiveByNameSchema>;
export type SelectNoteByIdParams = z.infer<typeof SelectNoteByIdSchema>;
export type SelectNoteByNameParams = z.infer<typeof SelectNoteByNameSchema>;
