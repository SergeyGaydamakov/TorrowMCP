/**
 * Zod schemas for MCP prompts
 */
import { z } from 'zod';
export const ListArchivesSchema = z.object({});
export const SearchNotesSchema = z.object({
    archiveId: z.string().describe('ID of the archive to search in'),
    query: z.string().optional().describe('Search query text'),
    tags: z.string().optional().describe('Tags to filter by (comma-separated)'),
    limit: z.coerce.number().optional().default(20).describe('Maximum number of results')
});
export const ArchiveStatsSchema = z.object({
    archiveId: z.string().describe('ID of the archive to get statistics for')
});
//# sourceMappingURL=promptSchemas.js.map