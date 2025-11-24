import { contextStore } from '../context/contextStore.js';
import { parsePhrase, validateName } from '../util/phrase.js';
import { ValidationError, ContextError } from '../common/errors.js';
import { TOOL_CREATE_NOTE, TOOL_UPDATE_NOTE, TOOL_DELETE_NOTE, TOOL_SEARCH_NOTES, TOOL_CREATE_ARCHIVE, TOOL_UPDATE_ARCHIVE, TOOL_DELETE_ARCHIVE } from './toolConstants.js';
import { CreateNoteSchema, UpdateNoteSchema, SearchNotesSchema, CreateArchiveSchema, UpdateArchiveSchema, DeleteArchiveSchema } from './toolSchemas.js';
export class ToolHandlers {
    torrowClient;
    constructor(torrowClient) {
        this.torrowClient = torrowClient;
    }
    /**
     * Creates a new note
     */
    async createNote(request) {
        const params = CreateNoteSchema.parse(request.params);
        const parsed = parsePhrase(params.phrase);
        validateName(parsed.name);
        // Check if note with this name already exists in current archive
        const currentArchiveId = contextStore.getArchiveId();
        if (currentArchiveId) {
            const exists = await this.torrowClient.noteExistsInArchive(parsed.name, currentArchiveId);
            if (exists) {
                throw new ValidationError(`Заметка с названием "${parsed.name}" уже существует в каталоге`);
            }
        }
        const note = await this.torrowClient.createNote({
            name: parsed.name,
            text: parsed.text,
            tags: parsed.tags
        }, currentArchiveId);
        // Set as current note
        contextStore.setNoteId(note.id);
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
    async updateNote(request) {
        const params = UpdateNoteSchema.parse(request.params);
        const parsed = parsePhrase(params.phrase);
        validateName(parsed.name);
        const currentNoteId = contextStore.getNoteId();
        if (!currentNoteId) {
            throw new ContextError('Нет текущей заметки для изменения');
        }
        const updatedNote = await this.torrowClient.updateNote(currentNoteId, {
            name: parsed.name,
            text: parsed.text,
            tags: parsed.tags
        });
        return {
            content: [{
                    type: 'text',
                    text: `Заметка "${parsed.name}" успешно обновлена`
                }]
        };
    }
    /**
     * Deletes current note
     */
    async deleteNote(request) {
        const currentNoteId = contextStore.getNoteId();
        if (!currentNoteId) {
            throw new ContextError('Нет текущей заметки для удаления');
        }
        // Get note info before deletion
        const note = await this.torrowClient.getNote(currentNoteId);
        await this.torrowClient.deleteNote(currentNoteId);
        // Clear current note
        contextStore.setNoteId(undefined);
        return {
            content: [{
                    type: 'text',
                    text: `Заметка "${note.name}" успешно удалена`
                }]
        };
    }
    /**
     * Searches notes in current archive
     */
    async searchNotes(request) {
        const params = SearchNotesSchema.parse(request.params);
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
                        text: 'Заметки не найдены'
                    }]
            };
        }
        const notesList = result.items
            .filter(note => !note.groupInfo?.isGroup) // Exclude archives
            .map((note, index) => `${index + 1}. ${note.name}${note.tags?.length ? ' #' + note.tags.join(' #') : ''}`)
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
    async createArchive(request) {
        const params = CreateArchiveSchema.parse(request.params);
        const parsed = parsePhrase(params.phrase);
        validateName(parsed.name);
        // Check archive limit (max 10)
        const existingArchives = await this.torrowClient.getArchives();
        if (existingArchives.length >= 10) {
            throw new ValidationError('Превышен лимит каталогов (максимум 10)');
        }
        // Check if archive with this name already exists
        const exists = await this.torrowClient.archiveExists(parsed.name);
        if (exists) {
            throw new ValidationError(`Каталог с названием "${parsed.name}" уже существует`);
        }
        // Create note first
        const note = await this.torrowClient.createNote({
            name: parsed.name,
            text: parsed.text,
            tags: parsed.tags
        });
        // Convert to archive
        await this.torrowClient.setNoteAsGroup(note.id);
        // Set as current archive
        contextStore.setArchiveId(note.id);
        return {
            content: [{
                    type: 'text',
                    text: `Каталог "${parsed.name}" успешно создан. ID: ${note.id}`
                }]
        };
    }
    /**
     * Updates current archive
     */
    async updateArchive(request) {
        const params = UpdateArchiveSchema.parse(request.params);
        const parsed = parsePhrase(params.phrase);
        validateName(parsed.name);
        const currentArchiveId = contextStore.getArchiveId();
        if (!currentArchiveId) {
            throw new ContextError('Нет текущего каталога для изменения');
        }
        const updatedArchive = await this.torrowClient.updateNote(currentArchiveId, {
            name: parsed.name,
            text: parsed.text,
            tags: parsed.tags
        });
        return {
            content: [{
                    type: 'text',
                    text: `Каталог "${parsed.name}" успешно обновлен`
                }]
        };
    }
    /**
     * Deletes current archive
     */
    async deleteArchive(request) {
        const params = DeleteArchiveSchema.parse(request.params);
        const currentArchiveId = contextStore.getArchiveId();
        if (!currentArchiveId) {
            throw new ContextError('Нет текущего каталога для удаления');
        }
        // Get archive info before deletion
        const archive = await this.torrowClient.getNote(currentArchiveId);
        await this.torrowClient.deleteNote(currentArchiveId, params.cascade);
        // Clear current archive
        contextStore.setArchiveId(undefined);
        return {
            content: [{
                    type: 'text',
                    text: `Каталог "${archive.name}" успешно удален${params.cascade ? ' со всеми заметками' : ''}`
                }]
        };
    }
    /**
     * Routes tool requests to appropriate handlers
     */
    async handleToolRequest(request) {
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
//# sourceMappingURL=toolHandlers.js.map