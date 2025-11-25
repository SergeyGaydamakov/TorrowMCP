/**
 * Resource handlers for MCP server
 */
import { ReadResourceRequest, ReadResourceResult } from '@modelcontextprotocol/sdk/types.js';
import { TorrowClient } from '../torrow/torrowClient.js';
import { contextStore } from '../context/contextStore.js';
import { RESOURCE_NOTE, RESOURCE_ARCHIVE, RESOURCE_ARCHIVES_LIST } from './resourceConstants.js';
import { NoteResourceSchema, ArchiveResourceSchema } from './resourceSchemas.js';
import { NotFoundError, ValidationError } from '../common/errors.js';

export class ResourceHandlers {
  constructor(private torrowClient: TorrowClient) {}

  /**
   * Handles note resource requests
   */
  async handleNoteResource(request: ReadResourceRequest): Promise<ReadResourceResult> {
    try {
      const params = NoteResourceSchema.parse(request.params);
      const note = await this.torrowClient.getNote(params.torrowId);

      return {
        contents: [{
          uri: request.params.uri,
          mimeType: 'application/json',
          text: JSON.stringify({
            id: note.id,
            name: note.name,
            text: note.text,
            tags: note.tags,
            type: 'note',
            meta: note.meta
          }, null, 2)
        }]
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new NotFoundError(`Note not found: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Handles archive resource requests
   */
  async handleArchiveResource(request: ReadResourceRequest): Promise<ReadResourceResult> {
    try {
      const params = ArchiveResourceSchema.parse(request.params);
      const archive = await this.torrowClient.getNote(params.torrowId);

      if (!archive.groupInfo?.isGroup) {
        throw new NotFoundError('Specified ID is not an archive');
      }

      return {
        contents: [{
          uri: request.params.uri,
          mimeType: 'application/json',
          text: JSON.stringify({
            id: archive.id,
            name: archive.name,
            text: archive.text,
            tags: archive.tags,
            type: 'archive',
            meta: archive.meta
          }, null, 2)
        }]
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new NotFoundError(`Archive not found: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Handles archives list resource requests
   */
  async handleArchivesListResource(request: ReadResourceRequest): Promise<ReadResourceResult> {
    try {
      // Find or create MCP context
      let mcpContextId = contextStore.getMcpContextId();
      if (!mcpContextId) {
        const mcpContext = await this.torrowClient.findOrCreateMCPContext();
        mcpContextId = mcpContext.id;
        contextStore.setMcpContextId(mcpContextId);
      }

      const archives = await this.torrowClient.getArchives(mcpContextId);
      const currentArchiveId = contextStore.getArchiveId();

      const archivesList = archives.map(archive => ({
        id: archive.id,
        name: archive.name,
        text: archive.text,
        tags: archive.tags,
        meta: archive.meta,
        isCurrent: archive.id === currentArchiveId
      }));

      return {
        contents: [{
          uri: request.params.uri,
          mimeType: 'application/json',
          text: JSON.stringify({
            archives: archivesList,
            count: archivesList.length
          }, null, 2)
        }]
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new ValidationError(`Failed to get archives list: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Routes resource requests to appropriate handlers
   */
  async handleResourceRequest(request: ReadResourceRequest): Promise<ReadResourceResult> {
    const uri = request.params.uri.toString();
    const resourceType = uri.split("://")[1].split("/")[0];

    switch (resourceType) {
      case 'note':
        return this.handleNoteResource(request);
      case 'archive':
        return this.handleArchiveResource(request);
      case 'archives':
        return this.handleArchivesListResource(request);
      default:
        throw new NotFoundError(`Unknown resource type: ${resourceType} JSON: ${JSON.stringify(request)}`);
    }
  }
}
