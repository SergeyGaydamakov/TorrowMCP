/**
 * Zod schemas for MCP resources
 */
import { z } from 'zod';
export declare const NoteResourceSchema: z.ZodObject<{
    torrowId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    torrowId: string;
}, {
    torrowId: string;
}>;
export declare const ArchiveResourceSchema: z.ZodObject<{
    torrowId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    torrowId: string;
}, {
    torrowId: string;
}>;
export declare const ArchivesListResourceSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export type NoteResourceParams = z.infer<typeof NoteResourceSchema>;
export type ArchiveResourceParams = z.infer<typeof ArchiveResourceSchema>;
export type ArchivesListResourceParams = z.infer<typeof ArchivesListResourceSchema>;
//# sourceMappingURL=resourceSchemas.d.ts.map