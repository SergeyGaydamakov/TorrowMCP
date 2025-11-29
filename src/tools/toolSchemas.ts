/**
 * Zod schemas for MCP tools
 */
import { z } from 'zod';
import { RESOURCE_ARCHIVES_LIST } from '../resources/resourceConstants.js';

export const CreateNoteSchema = z.object({
  archiveId: z.string().describe('ID of the archive (catalog) in which to create the note'),
  name: z.string().describe('Name of the note'),
  text: z.string().describe('Text content of the note. Light html formatted text of the note including <img> and <a> tags.'),
  tags: z.array(z.string()).describe('Tags for the note. Tags are used to group notes in the archive. Tag is simple string 3 - 100 characters [A-z, А-я, 0-9, /,\,-,_,.] or two strings separated by colon (<tag_value>:<tag_group>).')
});

export const UpdateNoteSchema = z.object({
  noteId: z.string().describe('ID of the note to update'),
  name: z.string().describe('Name of the note'),
  text: z.string().describe('Text content of the note. Light html formatted text of the note including <img> and <a> tags.'),
  tags: z.array(z.string()).describe('Tags for the note. Tags are used to group notes in the archive. Tag is simple string 3 - 100 characters [A-z, А-я, 0-9, /,\,-,_,.] or two strings separated by colon (<tag_value>:<tag_group>).')
});

export const DeleteNoteSchema = z.object({
  noteId: z.string().describe('ID of the note to delete')
});

export const SearchNotesSchema = z.object({
  archiveId: z.string().describe(`ID of the archive (catalog) in which to search notes. List all available archives in resources ${RESOURCE_ARCHIVES_LIST}`),
  phrase: z.string().optional().describe('Search phrase'),
  limit: z.coerce.number().optional().default(10).describe('Maximum number of results (default: 10)'),
  skip: z.coerce.number().optional().default(0).describe('Skip number of results (default: 0)'),
  tags: z.array(z.string()).optional().describe('Tags to filter by. Tags are used to group notes in the archive. Tag is simple string 3 - 100 characters [A-z, А-я, 0-9, /,\,-,_,.] or two strings separated by colon (<tag_value>:<tag_group>).'),
  distance: z.coerce.number().optional().default(0).describe('Distance between results in characters (default: 0). Distance is used to search for notes with similar text.')
});

export const CreateArchiveSchema = z.object({
  name: z.string().describe('Name of the archive'),
  text: z.string().describe('Text content of the archive. Light html formatted text of the archive.'),
  tags: z.array(z.string()).describe('Tags for the archive. Tags are used to group notes in the archive. Tag is simple string 3 - 100 characters [A-z, А-я, 0-9, /,\,-,_,.] or two strings separated by colon (<tag_value>:<tag_group>).')
});

export const UpdateArchiveSchema = z.object({
  archiveId: z.string().describe('ID of the archive to update'),
  name: z.string().describe('Name of the archive'),
  text: z.string().describe('Text content of the archive. Light html formatted text of the archive including <img> and <a> tags.'),
  tags: z.array(z.string()).describe('Tags for the archive. Tags are used to group notes in the archive. Tag is simple string 3 - 100 characters [A-z, А-я, 0-9, /,\,-,_,.] or two strings separated by colon (<tag_value>:<tag_group>).')
});

export const DeleteArchiveSchema = z.object({
  archiveId: z.string().describe('ID of the archive to delete'),
  cascade: z.coerce.boolean().optional().default(false).describe('Delete all notes in archive (default: false)')
});

export type CreateNoteParams = z.infer<typeof CreateNoteSchema>;
export type UpdateNoteParams = z.infer<typeof UpdateNoteSchema>;
export type DeleteNoteParams = z.infer<typeof DeleteNoteSchema>;
export type SearchNotesParams = z.infer<typeof SearchNotesSchema>;
export type CreateArchiveParams = z.infer<typeof CreateArchiveSchema>;
export type UpdateArchiveParams = z.infer<typeof UpdateArchiveSchema>;
export type DeleteArchiveParams = z.infer<typeof DeleteArchiveSchema>;
