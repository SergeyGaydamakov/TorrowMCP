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
        const archive = await this.torrowClient.findArchiveByName(params.archiveName);
        if (!archive) {
            throw new NotFoundError(`Каталог с названием "${params.archiveName}" не найден`);
        }
        contextStore.setArchiveId(archive.id);
        contextStore.setNoteId(undefined); // Clear current note
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
        let note;
        if (params.noteName) {
            note = await this.torrowClient.findNoteByName(params.noteName, contextStore.getArchiveId());
            if (!note) {
                throw new NotFoundError(`Заметка с названием "${params.noteName}" не найдена`);
            }
        }
        else if (params.noteIndex) {
            // Find note by index from search results
            const searchResult = await this.torrowClient.searchNotes({
                archiveId: contextStore.getArchiveId(),
                take: 50
            });
            const notes = searchResult.items.filter(item => !item.groupInfo?.isGroup);
            if (params.noteIndex < 1 || params.noteIndex > notes.length) {
                throw new ValidationError(`Неверный индекс заметки: ${params.noteIndex}. Доступно: 1-${notes.length}`);
            }
            note = notes[params.noteIndex - 1];
        }
        if (!note) {
            throw new NotFoundError('Заметка не найдена');
        }
        contextStore.setNoteId(note.id);
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
        let statusText = 'Текущий контекст:\n';
        if (context.archiveId) {
            try {
                const archive = await this.torrowClient.getNote(context.archiveId);
                statusText += `• Каталог: "${archive.name}" (ID: ${context.archiveId})\n`;
            }
            catch {
                statusText += `• Каталог: ID ${context.archiveId} (недоступен)\n`;
            }
        }
        else {
            statusText += '• Каталог: не выбран (используется каталог по умолчанию)\n';
        }
        if (context.noteId) {
            try {
                const note = await this.torrowClient.getNote(context.noteId);
                statusText += `• Заметка: "${note.name}" (ID: ${context.noteId})\n`;
            }
            catch {
                statusText += `• Заметка: ID ${context.noteId} (недоступна)\n`;
            }
        }
        else {
            statusText += '• Заметка: не выбрана\n';
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