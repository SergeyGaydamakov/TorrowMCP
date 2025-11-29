import { parsePhrase, validateName } from "../util/phrase.js";
import { ValidationError } from "../common/errors.js";
import { TOOL_CREATE_NOTE, TOOL_UPDATE_NOTE, TOOL_DELETE_NOTE, TOOL_SEARCH_NOTES, TOOL_CREATE_ARCHIVE, TOOL_UPDATE_ARCHIVE, TOOL_DELETE_ARCHIVE, } from "./toolConstants.js";
import { CreateNoteSchema, UpdateNoteSchema, DeleteNoteSchema, SearchNotesSchema, CreateArchiveSchema, UpdateArchiveSchema, DeleteArchiveSchema, } from "./toolSchemas.js";
export class ToolHandlers {
    torrowService;
    constructor(torrowService) {
        this.torrowService = torrowService;
    }
    /**
     * Creates a new note
     */
    async createNote(request) {
        const { archiveId, phrase } = CreateNoteSchema.parse(request.params.arguments);
        const { name, text, tags } = parsePhrase(phrase);
        validateName(name);
        const noteInArchive = await this.torrowService.createNoteInArchive({
            name: name,
            data: text,
            tags: tags,
            noteType: "Text",
        }, archiveId);
        return {
            content: [
                {
                    type: "text",
                    text: `Заметка "${name}" успешно создана в каталоге "${noteInArchive.archiveName}". ID: ${noteInArchive.id}`,
                },
            ],
        };
    }
    /**
     * Updates note by ID
     */
    async updateNote(request) {
        const { noteId, phrase } = UpdateNoteSchema.parse(request.params.arguments);
        const { name, text, tags } = parsePhrase(phrase);
        validateName(name);
        const updatedNote = await this.torrowService.updateNote(noteId, name, text, tags);
        return {
            content: [
                {
                    type: "text",
                    text: `Заметка "${name}" успешно обновлена. ID: ${noteId}`,
                },
            ],
        };
    }
    /**
     * Deletes note by ID
     */
    async deleteNote(request) {
        const { noteId } = DeleteNoteSchema.parse(request.params.arguments);
        const deletedNote = await this.torrowService.deleteNote(noteId);
        return {
            content: [
                {
                    type: "text",
                    text: `Заметка "${deletedNote.name}" успешно удалена. ID: ${noteId}`,
                },
            ],
        };
    }
    /**
     * Searches notes in specified archive
     */
    async searchNotes(request) {
        const { phrase, limit, skip, archiveId, tags, distance } = SearchNotesSchema.parse(request.params.arguments);
        const result = await this.torrowService.searchNotes(phrase, limit, skip, archiveId, tags, distance);
        if (result.items.length === 0) {
            // Get archive name for the message
            const archive = await this.torrowService.getArchive(archiveId);
            return {
                content: [
                    {
                        type: "text",
                        text: `В архиве "${archive.name || archiveId}" для указанных параметров заметок не найдено.`,
                    },
                ],
            };
        }
        const notesList = result.items
            .map((note, index) => `${index + 1}. ID: ${note.id} - ${note.name}${note.tags?.length ? " #" + note.tags.join(" #") : ""}`)
            .join("\n");
        return {
            content: [
                {
                    type: "text",
                    text: `Найдено заметок: ${result.items.length}\n\n${notesList}`,
                },
            ],
        };
    }
    /**
     * Creates a new archive
     */
    async createArchive(request) {
        const { phrase } = CreateArchiveSchema.parse(request.params.arguments);
        const { name, text, tags } = parsePhrase(phrase);
        validateName(name);
        // Create note first
        const archive = await this.torrowService.createArchive({
            name: name,
            data: text,
            tags: tags,
        });
        return {
            content: [
                {
                    type: "text",
                    text: `Каталог "${name}" успешно создан. ID: ${archive.id}`,
                },
            ],
        };
    }
    /**
     * Updates archive by ID
     */
    async updateArchive(request) {
        const { archiveId, phrase } = UpdateArchiveSchema.parse(request.params.arguments);
        const { name, text, tags } = parsePhrase(phrase);
        validateName(name);
        const updatedArchive = await this.torrowService.updateArchive(archiveId, name, text, tags);
        return {
            content: [
                {
                    type: "text",
                    text: `Каталог "${name}" успешно обновлен. ID: ${archiveId}`,
                },
            ],
        };
    }
    /**
     * Deletes archive by ID
     */
    async deleteArchive(request) {
        const { archiveId, cascade } = DeleteArchiveSchema.parse(request.params.arguments);
        const deletedArchive = await this.torrowService.deleteArchive(archiveId, cascade);
        return {
            content: [
                {
                    type: "text",
                    text: `Каталог "${deletedArchive.name}" успешно удален ${cascade ? "со всеми вложенными заметками" : ""}. ID: ${archiveId}`,
                },
            ],
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