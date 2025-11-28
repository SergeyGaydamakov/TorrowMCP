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
export type NoteResourceParams = z.infer<typeof NoteResourceSchema>;
export type ArchiveResourceParams = z.infer<typeof ArchiveResourceSchema>;
export type ArchivesListResourceParams = z.infer<typeof ArchivesListResourceSchema>;
//# sourceMappingURL=resourceSchemas.d.ts.map