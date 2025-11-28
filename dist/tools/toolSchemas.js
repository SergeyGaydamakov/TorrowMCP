/**
 * Zod schemas for MCP tools
 */
import { z } from 'zod';
import { RESOURCE_ARCHIVES_LIST } from '../resources/resourceConstants.js';
export const CreateNoteSchema = z.object({
    archiveId: z.string().describe('ID of the archive (catalog) in which to create the note'),
    phrase: z.string().describe('Phrase in format: <name>.<text>#tag#tag')
});
export const UpdateNoteSchema = z.object({
    noteId: z.string().describe('ID of the note to update'),
    phrase: z.string().describe('New phrase in format: <name>.<text>#tag#tag')
});
export const DeleteNoteSchema = z.object({
    noteId: z.string().describe('ID of the note to delete')
});
export const SearchNotesSchema = z.object({
    archiveId: z.string().describe(`ID of the archive (catalog) in which to search notes. List all available archives in resources ${RESOURCE_ARCHIVES_LIST}`),
    phrase: z.string().optional().describe('Search phrase'),
    tags: z.array(z.string()).optional().describe('Tags to filter by'),
    limit: z.coerce.number().optional().default(10).describe('Maximum number of results (default: 10)')
});
export const CreateArchiveSchema = z.object({
    phrase: z.string().describe('Phrase in format: <name>.<text>#tag#tag')
});
export const UpdateArchiveSchema = z.object({
    archiveId: z.string().describe('ID of the archive to update'),
    phrase: z.string().describe('New phrase in format: <name>.<text>#tag#tag')
});
export const DeleteArchiveSchema = z.object({
    archiveId: z.string().describe('ID of the archive to delete'),
    cascade: z.coerce.boolean().optional().default(false).describe('Delete all notes in archive (default: false)')
});
//# sourceMappingURL=toolSchemas.js.map