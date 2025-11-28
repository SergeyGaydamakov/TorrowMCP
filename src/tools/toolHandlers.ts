/**
 * Tool handlers for MCP server
 */
import { CallToolRequest, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { TorrowClient } from '../torrow/torrowClient.js';
import { contextStore } from '../context/contextStore.js';
import { parsePhrase, validateName } from '../util/phrase.js';
import { ValidationError, NotFoundError } from '../common/errors.js';
import {
  TOOL_CREATE_NOTE,
  TOOL_UPDATE_NOTE,
  TOOL_DELETE_NOTE,
  TOOL_SEARCH_NOTES,
  TOOL_CREATE_ARCHIVE,
  TOOL_UPDATE_ARCHIVE,
  TOOL_DELETE_ARCHIVE
} from './toolConstants.js';
import {
  CreateNoteSchema,
  UpdateNoteSchema,
  DeleteNoteSchema,
  SearchNotesSchema,
  CreateArchiveSchema,
  UpdateArchiveSchema,
  DeleteArchiveSchema
} from './toolSchemas.js';

export class ToolHandlers {
  constructor(private torrowClient: TorrowClient) {}

  /**
   * Creates a new note
   */
  async createNote(request: CallToolRequest): Promise<CallToolResult> {
    const params = CreateNoteSchema.parse(request.params.arguments);
    const parsed = parsePhrase(params.phrase);
    
    validateName(parsed.name);

    try {
      // Get archive to verify it exists and is an archive
      const archive = await this.torrowClient.getNote(params.archiveId);
      const isArchive = archive.groupInfo?.rolesToSearchItems?.includes("PublicReader");
      if (!isArchive) {
        throw new ValidationError(`Указанный ID "${params.archiveId}" не является каталогом`);
      }

      // Check if note with this name already exists in archive
      const exists = await this.torrowClient.noteExistsInArchive(parsed.name, archive.id);
      if (exists) {
        throw new ValidationError(`Заметка с названием "${parsed.name}" уже существует в каталоге "${archive.name}"`);
      }

      const note = await this.torrowClient.createNote({
        name: parsed.name,
        data: parsed.text,
        tags: parsed.tags
      }, archive.id);
      
      await this.torrowClient.addNoteToGroup(note.id, archive.id, parsed.tags);

      return {
        content: [{
          type: 'text',
          text: `Заметка "${parsed.name}" успешно создана в каталоге "${archive.name}". ID: ${note.id}`
        }]
      };
    } catch (error) {
      if (error instanceof ValidationError || error instanceof NotFoundError) {
        throw error;
      }
      throw new NotFoundError(`Каталог с ID "${params.archiveId}" не найден: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Updates note by ID
   */
  async updateNote(request: CallToolRequest): Promise<CallToolResult> {
    const params = UpdateNoteSchema.parse(request.params.arguments);
    const parsed = parsePhrase(params.phrase);
    
    validateName(parsed.name);

    try {
      // Get note to verify it exists and get its current name
      const note = await this.torrowClient.getNote(params.noteId);
      
      // Check that it's not an archive
      const isArchive = note.groupInfo?.rolesToSearchItems?.includes("PublicReader");
      if (isArchive) {
        throw new ValidationError(`Указанный ID "${params.noteId}" является каталогом, а не заметкой`);
      }

      const updatedNote = await this.torrowClient.updateNote(params.noteId, {
        name: parsed.name,
        data: parsed.text,
        tags: parsed.tags
      });

      return {
        content: [{
          type: 'text',
          text: `Заметка "${parsed.name}" успешно обновлена. ID: ${params.noteId}`
        }]
      };
    } catch (error) {
      if (error instanceof ValidationError || error instanceof NotFoundError) {
        throw error;
      }
      throw new NotFoundError(`Заметка с ID "${params.noteId}" не найдена: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Deletes note by ID
   */
  async deleteNote(request: CallToolRequest): Promise<CallToolResult> {
    const params = DeleteNoteSchema.parse(request.params.arguments);

    try {
      // Get note to verify it exists and get its name
      const note = await this.torrowClient.getNote(params.noteId);
      
      // Check that it's not an archive
      const isArchive = note.groupInfo?.rolesToSearchItems?.includes("PublicReader");
      if (isArchive) {
        throw new ValidationError(`Указанный ID "${params.noteId}" является каталогом, а не заметкой`);
      }

      await this.torrowClient.deleteNote(params.noteId);

      return {
        content: [{
          type: 'text',
          text: `Заметка "${note.name}" успешно удалена. ID: ${params.noteId}`
        }]
      };
    } catch (error) {
      if (error instanceof ValidationError || error instanceof NotFoundError) {
        throw error;
      }
      throw new NotFoundError(`Заметка с ID "${params.noteId}" не найдена: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Searches notes in specified archive
   */
  async searchNotes(request: CallToolRequest): Promise<CallToolResult> {
    const params = SearchNotesSchema.parse(request.params.arguments);
    
    const result = await this.torrowClient.searchNotes({
      text: params.phrase,
      tags: params.tags,
      archiveId: params.archiveId,
      take: params.limit
    });

    if (result.items.length === 0) {
      // Get archive name for the message
      const archive = await this.torrowClient.getNote(params.archiveId);
      return {
        content: [{
          type: 'text',
          text: `В архиве "${archive.name || params.archiveId}" для указанных параметров заметок не найдено.`
        }]
      };
    }

    const notesList = result.items
      .map((note, index) => `${index + 1}. ID: ${note.id} - ${note.name}${note.tags?.length ? ' #' + note.tags.join(' #') : ''}`)
      .join('\n');

    return {
      content: [{
        type: 'text',
        text: `Найдено заметок: ${result.items.length}\n\n${notesList}`
      }]
    };
  }

  /**
   * Creates a new archive
   */
  async createArchive(request: CallToolRequest): Promise<CallToolResult> {
    const params = CreateArchiveSchema.parse(request.params.arguments);
    const parsed = parsePhrase(params.phrase);
    
    validateName(parsed.name);

    if (!contextStore.getMcpContextId()) {
      // Find or create MCP context
      const mcpContext = await this.torrowClient.findOrCreateMCPContext();
      contextStore.setMcpContextId(mcpContext.id);
    }

    // Check archive limit (max 10)
    const existingArchives = await this.torrowClient.getArchives(contextStore.getMcpContextId());
    if (existingArchives.length >= 10) {
      throw new ValidationError('Превышен лимит каталогов (максимум 10)');
    }

    // Check if archive with this name already exists
    const exists = existingArchives.find(archive => archive.name.toLowerCase() === parsed.name.toLowerCase());
    if (exists) {
      throw new ValidationError(`Каталог с названием "${parsed.name}" уже существует`);
    }

    // Create note first
    const archive = await this.torrowClient.createNote({
      name: parsed.name,
      data: parsed.text,
      tags: parsed.tags
    }, contextStore.getMcpContextId());

    // Convert to archive
    await this.torrowClient.setNoteAsGroup(archive.id);

    return {
      content: [{
        type: 'text',
        text: `Каталог "${parsed.name}" успешно создан. ID: ${archive.id}`
      }]
    };
  }

  /**
   * Updates archive by ID
   */
  async updateArchive(request: CallToolRequest): Promise<CallToolResult> {
    const params = UpdateArchiveSchema.parse(request.params.arguments);
    const parsed = parsePhrase(params.phrase);
    
    validateName(parsed.name);

    try {
      // Get archive to verify it exists and is an archive
      const archive = await this.torrowClient.getNote(params.archiveId);
      const isArchive = archive.groupInfo?.rolesToSearchItems?.includes("PublicReader");
      if (!isArchive) {
        throw new ValidationError(`Указанный ID "${params.archiveId}" не является каталогом`);
      }

      const updatedArchive = await this.torrowClient.updateNote(params.archiveId, {
        name: parsed.name,
        data: parsed.text,
        tags: parsed.tags
      });

      return {
        content: [{
          type: 'text',
          text: `Каталог "${parsed.name}" успешно обновлен. ID: ${params.archiveId}`
        }]
      };
    } catch (error) {
      if (error instanceof ValidationError || error instanceof NotFoundError) {
        throw error;
      }
      throw new NotFoundError(`Каталог с ID "${params.archiveId}" не найден: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Deletes archive by ID
   */
  async deleteArchive(request: CallToolRequest): Promise<CallToolResult> {
    const params = DeleteArchiveSchema.parse(request.params.arguments);

    try {
      // Get archive to verify it exists and is an archive
      const archive = await this.torrowClient.getNote(params.archiveId);
      const isArchive = archive.groupInfo?.rolesToSearchItems?.includes("PublicReader");
      if (!isArchive) {
        throw new ValidationError(`Указанный ID "${params.archiveId}" не является каталогом`);
      }

      await this.torrowClient.deleteNote(params.archiveId, params.cascade);

      return {
        content: [{
          type: 'text',
          text: `Каталог "${archive.name}" успешно удален ${params.cascade ? 'со всеми заметками' : ''}. ID: ${params.archiveId}`
        }]
      };
    } catch (error) {
      if (error instanceof ValidationError || error instanceof NotFoundError) {
        throw error;
      }
      throw new NotFoundError(`Каталог с ID "${params.archiveId}" не найден: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Routes tool requests to appropriate handlers
   */
  async handleToolRequest(request: CallToolRequest): Promise<CallToolResult> {
    switch (request.params?.name) {
      case TOOL_CREATE_NOTE:
        return this.createNote(request);
      case TOOL_UPDATE_NOTE:
        return this.updateNote(request);
      case TOOL_DELETE_NOTE:
        return this.deleteNote(request);
      case TOOL_SEARCH_NOTES:
        return this.searchNotes(request);
      case TOOL_CREATE_ARCHIVE:
        return this.createArchive(request);
      case TOOL_UPDATE_ARCHIVE:
        return this.updateArchive(request);
      case TOOL_DELETE_ARCHIVE:
        return this.deleteArchive(request);
      default:
        throw new ValidationError(`Unknown tool: ${request.params.name}`);
    }
  }
}
