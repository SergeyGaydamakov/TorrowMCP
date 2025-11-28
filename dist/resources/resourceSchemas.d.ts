/**
 * Zod schemas for MCP resources
 */
import { z } from 'zod';
export declare const NoteResourceSchema: z.ZodObject<{
    noteId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    noteId: string;
}, {
    noteId: string;
}>;
export declare const ArchiveResourceSchema: z.ZodObject<{
    archiveId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    archiveId: string;
}, {
    archiveId: string;
}>;
export declare const ArchivesListResourceSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const ArchiveNoteResourceSchema: z.ZodObject<{
    archiveName: z.ZodString;
    noteName: z.ZodString;
}, "strip", z.ZodTypeAny, {
    archiveName: string;
    noteName: string;
}, {
    archiveName: string;
    noteName: string;
}>;
export type NoteResourceParams = z.infer<typeof NoteResourceSchema>;
export type ArchiveResourceParams = z.infer<typeof ArchiveResourceSchema>;
export type ArchivesListResourceParams = z.infer<typeof ArchivesListResourceSchema>;
export type ArchiveNoteResourceParams = z.infer<typeof ArchiveNoteResourceSchema>;
//# sourceMappingURL=resourceSchemas.d.ts.map