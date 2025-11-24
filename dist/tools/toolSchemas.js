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
    limit: z.number().optional().default(10).describe('Maximum number of results (default: 10)')
});
export const CreateArchiveSchema = z.object({
    phrase: z.string().describe('Phrase in format: <name>.<text>#tag#tag')
});
export const UpdateArchiveSchema = z.object({
    phrase: z.string().describe('New phrase in format: <name>.<text>#tag#tag')
});
export const DeleteArchiveSchema = z.object({
    cascade: z.boolean().optional().default(false).describe('Delete all notes in archive (default: false)')
});
//# sourceMappingURL=toolSchemas.js.map