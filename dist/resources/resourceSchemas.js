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
//# sourceMappingURL=resourceSchemas.js.map