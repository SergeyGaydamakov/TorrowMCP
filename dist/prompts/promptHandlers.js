import { contextStore } from '../context/contextStore.js';
import { ValidationError, NotFoundError } from '../common/errors.js';
import { PROMPT_SELECT_ARCHIVE, PROMPT_SELECT_NOTE, PROMPT_CONTEXT_STATUS } from './promptConstants.js';
import { SelectArchiveSchema, SelectNoteSchema } from './promptSchemas.js';
export class PromptHandlers {
    torrowClient;
    constructor(torrowClient) {
        this.torrowClient = torrowClient;
    }
    /**
     * Selects an archive by name and makes it current
     */
    async selectArchive(request) {
        const params = SelectArchiveSchema.parse(request.params.arguments || {});
        if (!contextStore.getMcpContextId()) {
            const mcpContext = await this.torrowClient.findOrCreateMCPContext();
            if (!mcpContext) {
                throw new ValidationError('Ошибка инициализации. Не найден контекст MCP.');
            }
            contextStore.setMcpContextId(mcpContext.id);
        }
        const mcpContextId = contextStore.getMcpContextId();
        const archive = await this.torrowClient.findArchiveByName(params.archiveName, mcpContextId);
        if (!archive) {
            throw new NotFoundError(`Каталог с названием "${params.archiveName}" не найден`);
        }
        contextStore.setArchiveId(archive.id, archive.name);
        contextStore.setNoteId(undefined, undefined); // Clear current note
        return {
            description: `Archive "${params.archiveName}" selected`,
            messages: [{
                    role: 'user',
                    content: {
                        type: 'text',
                        text: `Выбран каталог "${params.archiveName}" (ID: ${archive.id}). Теперь вы можете работать с заметками в этом каталоге.`
                    }
                }]
        };
    }
    /**
     * Selects a note by name or index and makes it current
     */
    async selectNote(request) {
        const params = SelectNoteSchema.parse(request.params.arguments || {});
        if (!params.noteName && !params.noteIndex) {
            throw new ValidationError('Необходимо указать название заметки или её индекс');
        }
        const archiveId = contextStore.getArchiveId();
        if (!archiveId) {
            throw new ValidationError('Выберите каталог перед выбором заметки.');
        }
        let note;
        if (params.noteName) {
            note = await this.torrowClient.findNoteByName(params.noteName, archiveId);
            if (!note) {
                throw new NotFoundError(`Заметка с названием "${params.noteName}" не найдена`);
            }
        }
        else if (params.noteIndex) {
            // Find note by index from search results
            const searchResult = await this.torrowClient.searchNotes({
                archiveId: archiveId,
                take: 50
            });
            const notes = searchResult.items;
            if (params.noteIndex < 1 || params.noteIndex > notes.length) {
                throw new ValidationError(`Неверный индекс заметки: ${params.noteIndex}. Доступно: 1-${notes.length}`);
            }
            note = notes[params.noteIndex - 1];
            if (!note) {
                throw new NotFoundError(`Заметка с индексом ${params.noteIndex} не найдена.`);
            }
        }
        else {
            throw new ValidationError('Необходимо указать название заметки или её индекс.');
        }
        contextStore.setNoteId(note.id, note.name);
        return {
            description: `Note "${note.name}" selected`,
            messages: [{
                    role: 'user',
                    content: {
                        type: 'text',
                        text: `Выбрана заметка "${note.name}" (ID: ${note.id}). Теперь вы можете изменять или удалить эту заметку.`
                    }
                }]
        };
    }
    /**
     * Shows current context status
     */
    async contextStatus(request) {
        const context = contextStore.getContext();
        let statusText = '';
        if (context.archiveId) {
            statusText += `Каталог: "${contextStore.getArchiveName()}"\n`;
        }
        else {
            statusText += 'Каталог: не выбран\n';
        }
        if (context.noteId) {
            statusText += `Заметка: "${contextStore.getNoteName()}"\n`;
        }
        else {
            statusText += 'Заметка: не выбрана\n';
        }
        return {
            description: 'Current context status',
            messages: [{
                    role: 'assistant',
                    content: {
                        type: 'text',
                        text: statusText
                    }
                }]
        };
    }
    /**
     * Handles completion requests for prompt arguments
     */
    async handleCompletionRequest(request) {
        // Check if this is a prompt completion request
        if (request.params.ref.type !== 'ref/prompt') {
            throw new ValidationError('Completion is only supported for prompts');
        }
        const promptName = request.params.ref.name;
        const argumentName = request.params.argument.name;
        const argumentValue = request.params.argument.value || '';
        // Handle completion for PROMPT_SELECT_ARCHIVE
        if (promptName === PROMPT_SELECT_ARCHIVE && argumentName === 'archiveName') {
            try {
                // Ensure MCP context is initialized
                if (!contextStore.getMcpContextId()) {
                    const mcpContext = await this.torrowClient.findOrCreateMCPContext();
                    if (!mcpContext) {
                        return {
                            completion: {
                                values: [],
                                total: 0,
                                hasMore: false
                            }
                        };
                    }
                    contextStore.setMcpContextId(mcpContext.id);
                }
                const mcpContextId = contextStore.getMcpContextId();
                const archives = await this.torrowClient.getArchives(mcpContextId);
                // Filter archives by the current input value (case-insensitive)
                const filteredArchives = archives
                    .filter(archive => archive.name &&
                    archive.name.toLowerCase().includes(argumentValue.toLowerCase()))
                    .map(archive => archive.name || '')
                    .filter(name => name.length > 0)
                    .slice(0, 100); // Limit to 100 items as per MCP spec
                return {
                    completion: {
                        values: filteredArchives,
                        total: filteredArchives.length,
                        hasMore: false
                    }
                };
            }
            catch (error) {
                // Return empty completion on error
                return {
                    completion: {
                        values: [],
                        total: 0,
                        hasMore: false
                    }
                };
            }
        }
        if (promptName === PROMPT_SELECT_NOTE && argumentName === 'noteName') {
            try {
                const archiveId = contextStore.getArchiveId();
                if (!archiveId) {
                    throw new ValidationError('Выберите каталог перед выбором заметки.');
                }
                const notes = await this.torrowClient.getPinnedNotesByParentId(archiveId, 10, 0);
                // Filter archives by the current input value (case-insensitive)
                const filteredNotes = notes
                    .filter(note => note.name && note.name.toLowerCase().includes(argumentValue.toLowerCase()))
                    .map(note => note.name || '')
                    .filter(name => name.length > 0)
                    .slice(0, 100); // Limit to 100 items as per MCP spec
                return {
                    completion: {
                        values: filteredNotes,
                        total: filteredNotes.length,
                        hasMore: false
                    }
                };
            }
            catch (error) {
                // Return empty completion on error
                return {
                    completion: {
                        values: [],
                        total: 0,
                        hasMore: false
                    }
                };
            }
        }
        // No completion for other prompts/arguments
        return {
            completion: {
                values: [],
                total: 0,
                hasMore: false
            }
        };
    }
    /**
     * Routes prompt requests to appropriate handlers
     */
    async handlePromptRequest(request) {
        switch (request.params.name) {
            case PROMPT_SELECT_ARCHIVE:
                return this.selectArchive(request);
            case PROMPT_SELECT_NOTE:
                return this.selectNote(request);
            case PROMPT_CONTEXT_STATUS:
                return this.contextStatus(request);
            default:
                throw new ValidationError(`Unknown prompt: ${request.params.name}`);
        }
    }
}
//# sourceMappingURL=promptHandlers.js.map