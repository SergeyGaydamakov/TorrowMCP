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
//# sourceMappingURL=resourceSchemas.js.map