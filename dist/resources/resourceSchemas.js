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
//# sourceMappingURL=resourceSchemas.js.map