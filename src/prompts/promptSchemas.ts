/**
 * Zod schemas for MCP prompts
 */
import { z } from 'zod';

export const ListArchivesSchema = z.object({});

export const SearchNotesSchema = z.object({
  phrase: z.string().optional().describe('Search phrase text'),
  archiveId: z.string().describe('ID of the archive to search in'),
  limit: z.coerce.number().optional().default(20).describe('Maximum number of results'),
  skip: z.coerce.number().optional().default(0).describe('Skip number of results'),
  tags: z.array(z.string()).optional().describe('Tags to filter by. Tags are used to group notes in the archive. Tag is simple string 3 - 100 characters [A-z, А-я, 0-9, /,\,-,_,.] or two strings separated by colon (<tag_value>:<tag_group>).'),
  distance: z.coerce.number().optional().default(0).describe('Distance between notes')
});

export const ArchiveStatsSchema = z.object({
  archiveId: z.string().describe('ID of the archive to get statistics for')
});

export type ListArchivesParams = z.infer<typeof ListArchivesSchema>;
export type SearchNotesParams = z.infer<typeof SearchNotesSchema>;
export type ArchiveStatsParams = z.infer<typeof ArchiveStatsSchema>;
