/**
 * Zod schemas for MCP tools
 */
import { z } from 'zod';
export declare const CreateNoteSchema: z.ZodObject<{
    phrase: z.ZodString;
}, "strip", z.ZodTypeAny, {
    phrase: string;
}, {
    phrase: string;
}>;
export declare const UpdateNoteSchema: z.ZodObject<{
    phrase: z.ZodString;
}, "strip", z.ZodTypeAny, {
    phrase: string;
}, {
    phrase: string;
}>;
export declare const DeleteNoteSchema: z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>;
export declare const SearchNotesSchema: z.ZodObject<{
    phrase: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    tags?: string[] | undefined;
    phrase?: string | undefined;
}, {
    tags?: string[] | undefined;
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
    phrase: z.ZodString;
}, "strip", z.ZodTypeAny, {
    phrase: string;
}, {
    phrase: string;
}>;
export declare const DeleteArchiveSchema: z.ZodObject<{
    cascade: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    cascade: boolean;
}, {
    cascade?: boolean | undefined;
}>;
export declare const SelectArchiveByIdSchema: z.ZodObject<{
    archiveId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    archiveId: string;
}, {
    archiveId: string;
}>;
export declare const SelectArchiveByNameSchema: z.ZodObject<{
    archiveName: z.ZodString;
}, "strip", z.ZodTypeAny, {
    archiveName: string;
}, {
    archiveName: string;
}>;
export declare const SelectNoteByIdSchema: z.ZodObject<{
    noteId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    noteId: string;
}, {
    noteId: string;
}>;
export declare const SelectNoteByNameSchema: z.ZodObject<{
    noteName: z.ZodString;
}, "strip", z.ZodTypeAny, {
    noteName: string;
}, {
    noteName: string;
}>;
export type CreateNoteParams = z.infer<typeof CreateNoteSchema>;
export type UpdateNoteParams = z.infer<typeof UpdateNoteSchema>;
export type DeleteNoteParams = z.infer<typeof DeleteNoteSchema>;
export type SearchNotesParams = z.infer<typeof SearchNotesSchema>;
export type CreateArchiveParams = z.infer<typeof CreateArchiveSchema>;
export type UpdateArchiveParams = z.infer<typeof UpdateArchiveSchema>;
export type DeleteArchiveParams = z.infer<typeof DeleteArchiveSchema>;
export type SelectArchiveByIdParams = z.infer<typeof SelectArchiveByIdSchema>;
export type SelectArchiveByNameParams = z.infer<typeof SelectArchiveByNameSchema>;
export type SelectNoteByIdParams = z.infer<typeof SelectNoteByIdSchema>;
export type SelectNoteByNameParams = z.infer<typeof SelectNoteByNameSchema>;
//# sourceMappingURL=toolSchemas.d.ts.map