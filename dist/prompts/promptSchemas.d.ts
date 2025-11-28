/**
 * Zod schemas for MCP prompts
 */
import { z } from 'zod';
export declare const ListArchivesSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const SearchNotesSchema: z.ZodObject<{
    archiveId: z.ZodString;
    query: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    archiveId: string;
    limit: number;
    tags?: string | undefined;
    query?: string | undefined;
}, {
    archiveId: string;
    tags?: string | undefined;
    limit?: number | undefined;
    query?: string | undefined;
}>;
export declare const ArchiveStatsSchema: z.ZodObject<{
    archiveId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    archiveId: string;
}, {
    archiveId: string;
}>;
export type ListArchivesParams = z.infer<typeof ListArchivesSchema>;
export type SearchNotesParams = z.infer<typeof SearchNotesSchema>;
export type ArchiveStatsParams = z.infer<typeof ArchiveStatsSchema>;
//# sourceMappingURL=promptSchemas.d.ts.map