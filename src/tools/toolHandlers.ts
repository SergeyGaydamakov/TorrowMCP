/**
 * Tool handlers for MCP server
 */
import { CallToolRequest, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { TorrowClient } from '../torrow/torrowClient.js';
import { contextStore } from '../context/contextStore.js';
import { parsePhrase, validateName } from '../util/phrase.js';
import { ValidationError, ContextError, NotFoundError } from '../common/errors.js';
import {
  TOOL_CREATE_NOTE,
  TOOL_UPDATE_NOTE,
  TOOL_DELETE_NOTE,
  TOOL_SEARCH_NOTES,
  TOOL_CREATE_ARCHIVE,
  TOOL_UPDATE_ARCHIVE,
  TOOL_DELETE_ARCHIVE,
  TOOL_SELECT_ARCHIVE_BY_ID,
  TOOL_SELECT_ARCHIVE_BY_NAME,
  TOOL_SELECT_NOTE_BY_ID,
  TOOL_SELECT_NOTE_BY_NAME
} from './toolConstants.js';
import {
  CreateNoteSchema,
  UpdateNoteSchema,
  DeleteNoteSchema,
  SearchNotesSchema,
  CreateArchiveSchema,
  UpdateArchiveSchema,
  DeleteArchiveSchema,
  SelectArchiveByIdSchema,
  SelectArchiveByNameSchema,
  SelectNoteByIdSchema,
  SelectNoteByNameSchema
} from './toolSchemas.js';

export class ToolHandlers {
  constructor(private torrowClient: TorrowClient) {}

  /**
   * Creates a new note
   */
  async createNote(request: CallToolRequest): Promise<CallToolResult> {
    const params = CreateNoteSchema.parse(request.params.arguments);
    const parsed = parsePhrase(params.phrase);
    
    validateName(request.params.name);

    // Check if note with this name already exists in current archive
    const currentArchiveId = contextStore.getArchiveId();
    const currentArchiveName = contextStore.getArchiveName();
    if (!currentArchiveId) {
      throw new ContextError('Выберите существующий каталог или создайте новый, чтобы создать заметку.');
    }

    const exists = await this.torrowClient.noteExistsInArchive(parsed.name, currentArchiveId);
    if (exists) {
      throw new ValidationError(`Заметка с названием "${parsed.name}" уже существует в каталоге "${currentArchiveName}"`);
    }

    const note = await this.torrowClient.createNote({
      name: parsed.name,
      data: parsed.text,
      tags: parsed.tags
    }, currentArchiveId);
    
    await this.torrowClient.addNoteToGroup(note.id, currentArchiveId, parsed.tags);

    // Set as current note
    contextStore.setNoteId(note.id, parsed.name);

    return {
      content: [{
        type: 'text',
        text: `Заметка "${parsed.name}" успешно создана. ID: ${note.id}`
      }]
    };
  }

  /**
   * Updates current note
   */
  async updateNote(request: CallToolRequest): Promise<CallToolResult> {
    const params = UpdateNoteSchema.parse(request.params.arguments);
    const parsed = parsePhrase(params.phrase);
    
    validateName(parsed.name);

    const currentNoteId = contextStore.getNoteId();
    const currentNoteName = contextStore.getNoteName();
    if (!currentNoteId) {
      throw new ContextError('Укажите заметку, которую нужно изменить.');
    }

    try {
      const updatedNote = await this.torrowClient.updateNote(currentNoteId, {
        name: parsed.name,
        data: parsed.text,
        tags: parsed.tags
      });
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Не удалось обновить заметку "${parsed.name}": ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`
        }]
      };
    }

    return {
      content: [{
        type: 'text',
        text: `Заметка "${currentNoteName}" успешно обновлена. ID: ${currentNoteId}`
      }]
    };
  }

  /**
   * Deletes current note
   */
  async deleteNote(request: CallToolRequest): Promise<CallToolResult> {
    const currentNoteId = contextStore.getNoteId();
    const currentNoteName = contextStore.getNoteName();
    if (!currentNoteId) {
      throw new ContextError('Укажите заметку, которую нужно удалить.');
    }

    try {
      await this.torrowClient.deleteNote(currentNoteId);
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Не удалось удалить заметку "${currentNoteId}": ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`
        }]
      };
    }
    
    // Clear current note
    contextStore.setNoteId(undefined, undefined);

    return {
      content: [{
        type: 'text',
        text: `Заметка "${currentNoteName}" успешно удалена. ID: ${currentNoteId}`
      }]
    };
  }

  /**
   * Searches notes in current archive
   */
  async searchNotes(request: CallToolRequest): Promise<CallToolResult> {
    const params = SearchNotesSchema.parse(request.params.arguments);
    
    const result = await this.torrowClient.searchNotes({
      text: params.phrase,
      tags: params.tags,
      archiveId: contextStore.getArchiveId(),
      take: params.limit
    });

    if (result.items.length === 0) {
      return {
        content: [{
          type: 'text',
          text: `В архиве "${contextStore.getArchiveName()}" для указанных параметров заметок не найдено.`
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

    // Set as current archive
    contextStore.setArchiveId(archive.id, parsed.name);

    return {
      content: [{
        type: 'text',
        text: `Каталог "${parsed.name}" успешно создан. ID: ${archive.id}`
      }]
    };
  }

  /**
   * Updates current archive
   */
  async updateArchive(request: CallToolRequest): Promise<CallToolResult> {
    const params = UpdateArchiveSchema.parse(request.params.arguments);
    const parsed = parsePhrase(params.phrase);
    
    validateName(parsed.name);

    const currentArchiveId = contextStore.getArchiveId();
    const currentArchiveName = contextStore.getArchiveName();
    if (!currentArchiveId) {
      throw new ContextError('Укажите каталог, который нужно изменить.');
    }

    try {
      const updatedArchive = await this.torrowClient.updateNote(currentArchiveId, {
        name: parsed.name,
        data: parsed.text,
        tags: parsed.tags
      });
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Не удалось обновить каталог "${currentArchiveName}": ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`
        }]
      };
    }

    return {
      content: [{
        type: 'text',
        text: `Каталог "${currentArchiveName}" успешно обновлен. ID: ${currentArchiveId}`
      }]
    };
  }

  /**
   * Deletes current archive
   */
  async deleteArchive(request: CallToolRequest): Promise<CallToolResult> {
    const params = DeleteArchiveSchema.parse(request.params.arguments);
    
    const currentArchiveId = contextStore.getArchiveId();
    const currentArchiveName = contextStore.getArchiveName();
    if (!currentArchiveId) {
      throw new ContextError('Укажите каталог, который нужно удалить.');
    }

    await this.torrowClient.deleteNote(currentArchiveId, params.cascade);
    
    // Clear current archive
    contextStore.setArchiveId(undefined, undefined);

    return {
      content: [{
        type: 'text',
        text: `Каталог "${currentArchiveName}" успешно удален ${params.cascade ? ' со всеми заметками' : ''}`
      }]
    };
  }

  /**
   * Selects an archive by ID and makes it current
   */
  async selectArchiveById(request: CallToolRequest): Promise<CallToolResult> {
    const params = SelectArchiveByIdSchema.parse(request.params.arguments);
    
    try {
      const archive = await this.torrowClient.getNote(params.archiveId);
      const isArchive = archive.groupInfo?.rolesToSearchItems?.includes("PublicReader");
      if (!isArchive) {
        throw new NotFoundError(`Указанный ID "${params.archiveId}" не является каталогом`);
      }
      contextStore.setArchiveId(archive.id, archive.name);

      return {
        content: [{
          type: 'text',
          text: `Каталог "${archive.name}" успешно выбран. ID: ${archive.id}`
        }]
      };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new NotFoundError(`Каталог с ID "${params.archiveId}" не найден: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Selects an archive by name and makes it current
   */
  async selectArchiveByName(request: CallToolRequest): Promise<CallToolResult> {
    const params = SelectArchiveByNameSchema.parse(request.params.arguments);
    
    const mcpContextId = contextStore.getMcpContextId();
    if (!mcpContextId) {
      // Find or create MCP context
      const mcpContext = await this.torrowClient.findOrCreateMCPContext();
      contextStore.setMcpContextId(mcpContext.id);
    }

    try {
      const archive = await this.torrowClient.findArchiveByName(
        params.archiveName,
        contextStore.getMcpContextId()
      );
      
      if (!archive) {
        throw new NotFoundError(`Каталог с названием "${params.archiveName}" не найден`);
      }

      contextStore.setArchiveId(archive.id, archive.name);

      return {
        content: [{
          type: 'text',
          text: `Каталог "${archive.name}" успешно выбран. ID: ${archive.id}`
        }]
      };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new NotFoundError(`Каталог с названием "${params.archiveName}" не найден: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Selects a note by ID and makes it current
   */
  async selectNoteById(request: CallToolRequest): Promise<CallToolResult> {
    const params = SelectNoteByIdSchema.parse(request.params.arguments);
    
    try {
      const note = await this.torrowClient.getNote(params.noteId);
      
      // Check that it's not an archive
      const isArchive = note.groupInfo?.rolesToSearchItems?.includes("PublicReader");
      if (isArchive) {
        throw new NotFoundError(`Указанный ID "${params.noteId}" является каталогом, а не заметкой`);
      }

      // Set as current note
      contextStore.setNoteId(note.id, note.name);

      return {
        content: [{
          type: 'text',
          text: `Заметка "${note.name}" успешно выбрана. ID: ${note.id}`
        }]
      };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new NotFoundError(`Заметка с ID "${params.noteId}" не найдена: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Selects a note by name and makes it current
   */
  async selectNoteByName(request: CallToolRequest): Promise<CallToolResult> {
    const params = SelectNoteByNameSchema.parse(request.params.arguments);
    
    const archiveId = contextStore.getArchiveId();
    if (!archiveId) {
      throw new ContextError('Выберите каталог перед выбором заметки.');
    }

    try {
      const note = await this.torrowClient.findNoteByName(
        params.noteName,
        archiveId
      );
      
      if (!note) {
        throw new NotFoundError(`Заметка с названием "${params.noteName}" не найдена в текущем каталоге`);
      }

      // Set as current note
      contextStore.setNoteId(note.id, note.name);

      return {
        content: [{
          type: 'text',
          text: `Заметка "${note.name}" успешно выбрана. ID: ${note.id}`
        }]
      };
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ContextError) {
        throw error;
      }
      throw new NotFoundError(`Заметка с названием "${params.noteName}" не найдена: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
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
      case TOOL_SELECT_ARCHIVE_BY_ID:
        return this.selectArchiveById(request);
      case TOOL_SELECT_ARCHIVE_BY_NAME:
        return this.selectArchiveByName(request);
      case TOOL_SELECT_NOTE_BY_ID:
        return this.selectNoteById(request);
      case TOOL_SELECT_NOTE_BY_NAME:
        return this.selectNoteByName(request);
      default:
        throw new ValidationError(`Unknown tool: ${request.params.name}`);
    }
  }
}
