/**
 * Zod schemas for MCP prompts
 */
import { z } from 'zod';
export const ListArchivesSchema = z.object({});
export const SearchNotesSchema = z.object({
    query: z.string().optional().describe('Search query text'),
    archiveId: z.string().describe('ID of the archive to search in'),
    limit: z.coerce.number().optional().default(20).describe('Maximum number of results'),
    skip: z.coerce.number().optional().default(0).describe('Skip number of results'),
    tags: z.string().optional().describe('Tags to filter by (comma-separated)'),
    distance: z.coerce.number().optional().default(0).describe('Distance between notes')
});
export const ArchiveStatsSchema = z.object({
    archiveId: z.string().describe('ID of the archive to get statistics for')
});
//# sourceMappingURL=promptSchemas.js.map