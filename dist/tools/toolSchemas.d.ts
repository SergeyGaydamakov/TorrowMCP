/**
 * Zod schemas for MCP tools
 */
import { z } from 'zod';
export declare const CreateNoteSchema: z.ZodObject<{
    archiveId: z.ZodString;
    phrase: z.ZodString;
}, "strip", z.ZodTypeAny, {
    archiveId: string;
    phrase: string;
}, {
    archiveId: string;
    phrase: string;
}>;
export declare const UpdateNoteSchema: z.ZodObject<{
    noteId: z.ZodString;
    phrase: z.ZodString;
}, "strip", z.ZodTypeAny, {
    phrase: string;
    noteId: string;
}, {
    phrase: string;
    noteId: string;
}>;
export declare const DeleteNoteSchema: z.ZodObject<{
    noteId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    noteId: string;
}, {
    noteId: string;
}>;
export declare const SearchNotesSchema: z.ZodObject<{
    archiveId: z.ZodString;
    phrase: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    skip: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    distance: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    skip: number;
    distance: number;
    archiveId: string;
    limit: number;
    tags?: string[] | undefined;
    phrase?: string | undefined;
}, {
    archiveId: string;
    tags?: string[] | undefined;
    skip?: number | undefined;
    distance?: number | undefined;
    phrase?: string | undefined;
    limit?: number | undefined;
}>;
export declare const CreateArchiveSchema: z.ZodObject<{
    phrase: z.ZodString;
}, "strip", z.ZodTypeAny, {
    phrase: string;
}, {
    phrase: string;
}>;
export declare const UpdateArchiveSchema: z.ZodObject<{
    archiveId: z.ZodString;
    phrase: z.ZodString;
}, "strip", z.ZodTypeAny, {
    archiveId: string;
    phrase: string;
}, {
    archiveId: string;
    phrase: string;
}>;
export declare const DeleteArchiveSchema: z.ZodObject<{
    archiveId: z.ZodString;
    cascade: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    cascade: boolean;
    archiveId: string;
}, {
    archiveId: string;
    cascade?: boolean | undefined;
}>;
export type CreateNoteParams = z.infer<typeof CreateNoteSchema>;
export type UpdateNoteParams = z.infer<typeof UpdateNoteSchema>;
export type DeleteNoteParams = z.infer<typeof DeleteNoteSchema>;
export type SearchNotesParams = z.infer<typeof SearchNotesSchema>;
export type CreateArchiveParams = z.infer<typeof CreateArchiveSchema>;
export type UpdateArchiveParams = z.infer<typeof UpdateArchiveSchema>;
export type DeleteArchiveParams = z.infer<typeof DeleteArchiveSchema>;
//# sourceMappingURL=toolSchemas.d.ts.map