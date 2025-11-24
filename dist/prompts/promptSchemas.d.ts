/**
 * Zod schemas for MCP prompts
 */
import { z } from 'zod';
export declare const SelectArchiveSchema: z.ZodObject<{
    archiveName: z.ZodString;
}, "strip", z.ZodTypeAny, {
    archiveName: string;
}, {
    archiveName: string;
}>;
export declare const SelectNoteSchema: z.ZodObject<{
    noteName: z.ZodOptional<z.ZodString>;
    noteIndex: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    noteName?: string | undefined;
    noteIndex?: number | undefined;
}, {
    noteName?: string | undefined;
    noteIndex?: number | undefined;
}>;
export declare const ContextStatusSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export type SelectArchiveParams = z.infer<typeof SelectArchiveSchema>;
export type SelectNoteParams = z.infer<typeof SelectNoteSchema>;
export type ContextStatusParams = z.infer<typeof ContextStatusSchema>;
//# sourceMappingURL=promptSchemas.d.ts.map