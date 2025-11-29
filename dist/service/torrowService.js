import { NotFoundError, ValidationError } from "../common/errors.js";
export class TorrowService {
    torrowClient;
    constructor(torrowClient) {
        this.torrowClient = torrowClient;
    }
    async createNoteInArchive(createNoteInfo, archiveId) {
        // Get archive to verify it exists and is an archive
        const archive = await this.getArchive(archiveId);
        // Check if note with this name already exists in archive
        const exists = await this.noteExistsInArchive(createNoteInfo.name, archive.id);
        if (exists) {
            throw new ValidationError(`Заметка с названием "${createNoteInfo.name}" уже существует в каталоге "${archive.name}"`);
        }
        const note = await this.torrowClient.createNote(createNoteInfo, archiveId);
        if (!note || !note.id) {
            throw new NotFoundError(`Failed to create note in archive "${archiveId}"`);
        }
        await this.torrowClient.addNoteToGroup(note.id, archiveId, createNoteInfo.tags);
        return { ...note, archiveId: archiveId, archiveName: archive.name };
    }
    async updateNote(noteId, noteName, noteText, noteTags) {
        const currentNote = await this.getNote(noteId);
        if (!currentNote) {
            throw new NotFoundError(`Заметка с ID "${noteId}" не найдена`);
        }
        // Check that it's not an archive
        const isArchive = this.NoteIsArchive(currentNote);
        if (isArchive) {
            throw new ValidationError(`Указанный ID "${noteId}" является каталогом, а не заметкой`);
        }
        if (noteName !== undefined) {
            currentNote.name = noteName;
        }
        if (noteText !== undefined) {
            currentNote.data = noteText;
        }
        if (noteTags !== undefined && noteTags.length > 0) {
            currentNote.tags = noteTags;
        }
        await this.torrowClient.updateNote(currentNote);
        return currentNote;
    }
    async deleteNote(noteId) {
        const currentNote = await this.getNote(noteId);
        if (!currentNote) {
            throw new NotFoundError(`Заметка с ID "${noteId}" не найдена`);
        }
        // Check that it's not an archive
        const isArchive = this.NoteIsArchive(currentNote);
        if (isArchive) {
            throw new ValidationError(`Указанный ID "${noteId}" является каталогом, а не заметкой`);
        }
        await this.torrowClient.deleteNote(noteId);
        return currentNote;
    }
    async getNote(noteId) {
        const note = await this.torrowClient.getNote(noteId);
        if (!note || !note.id) {
            throw new NotFoundError(`Заметка с ID "${noteId}" не найдена`);
        }
        // Check that it's not an archive
        const isArchive = this.NoteIsArchive(note);
        if (isArchive) {
            throw new ValidationError(`Указанный ID "${noteId}" является каталогом, а не заметкой`);
        }
        return note;
    }
    async getNotes(archiveId, take, skip) {
        const viewItems = await this.torrowClient.getUserNotesByParentId(archiveId, take, skip);
        return viewItems.map((item) => this.mapNoteViewToTorrowNote(item));
    }
    /**
     * Maps NoteViewResponse to TorrowNote
     */
    mapNoteViewToTorrowNote(item) {
        return {
            id: item.itemObject?.id || "",
            name: item.name || "",
            data: item.data,
            tags: item.tags,
            noteType: item.noteType,
            meta: item.itemObject?.meta,
            groupInfo: item.groupInfo,
        };
    }
    async searchNotes(text, take, skip, archiveId, tags, distance) {
        const viewItems = await this.torrowClient.searchNotes(text, take, skip, archiveId, tags, distance);
        return {
            items: viewItems.map((item) => this.mapNoteViewToTorrowNote(item)),
            totalCount: viewItems.length,
        };
    }
    async getPinnedNotes(archiveId, take, skip) {
        const viewItems = await this.torrowClient.getPinnedNotesByParentId(archiveId, take, skip);
        return viewItems.map((item) => this.mapNoteViewToTorrowNote(item));
    }
    NoteIsArchive(note) {
        return (note.groupInfo?.rolesToSearchItems?.includes("PublicReader") || false);
    }
    async createArchive(createNoteInfo) {
        // Check archive limit (max 10)
        const existingArchives = await this.getArchives();
        if (existingArchives.length >= 10) {
            throw new ValidationError("Превышен лимит каталогов (максимум 10)");
        }
        // Check if archive with this name already exists
        const exists = existingArchives.find((archive) => archive.name?.toLowerCase() === createNoteInfo.name?.toLowerCase());
        if (exists) {
            throw new ValidationError(`Каталог с названием "${createNoteInfo.name}" уже существует`);
        }
        const note = await this.torrowClient.createNote(createNoteInfo);
        if (!note || !note.id) {
            throw new NotFoundError(`Failed to create archive`);
        }
        // Convert to archive
        await this.torrowClient.setNoteAsGroup(note.id);
        return note;
    }
    async updateArchive(archiveId, archiveName, archiveText, archiveTags) {
        const currentArchive = await this.getArchive(archiveId);
        if (!currentArchive) {
            throw new NotFoundError(`Каталог с ID "${archiveId}" не найден`);
        }
        // Check that it's an archive
        const isArchive = this.NoteIsArchive(currentArchive);
        if (!isArchive) {
            throw new ValidationError(`Указанный ID "${archiveId}" не является каталогом`);
        }
        if (archiveName !== undefined) {
            currentArchive.name = archiveName;
        }
        if (archiveText !== undefined) {
            currentArchive.data = archiveText;
        }
        if (archiveTags !== undefined && archiveTags.length > 0) {
            currentArchive.tags = archiveTags;
        }
        await this.torrowClient.updateNote(currentArchive);
        return currentArchive;
    }
    async deleteArchive(archiveId, cascade) {
        const currentArchive = await this.getArchive(archiveId);
        if (!currentArchive) {
            throw new NotFoundError(`Каталог с ID "${archiveId}" не найден`);
        }
        // Check that it's an archive
        const isArchive = this.NoteIsArchive(currentArchive);
        if (!isArchive) {
            throw new ValidationError(`Указанный ID "${archiveId}" не является каталогом`);
        }
        await this.torrowClient.deleteNote(archiveId, cascade);
        return currentArchive;
    }
    /**
     * Gets archives list
     */
    async getArchive(archiveId) {
        const archive = await this.getNote(archiveId);
        if (!archive || !archive.id) {
            throw new NotFoundError(`Каталог с ID "${archiveId}" не найден`);
        }
        if (!(this.NoteIsArchive(archive))) {
            throw new NotFoundError(`Указанный ID "${archiveId}" не является каталогом`);
        }
        return archive;
    }
    async getArchives() {
        const mcpContext = await this.findOrCreateMCPContext();
        try {
            const result = await this.torrowClient.getUserNotesByParentId(mcpContext.id, 20, 0);
            return result.map((item) => this.mapNoteViewToTorrowNote(item));
        }
        catch (error) {
            throw new NotFoundError(`Не удалось получить список архивов: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
        }
    }
    /**
     * Finds archive by name
     */
    async findArchiveByName(name) {
        try {
            const archives = await this.getArchives();
            return (archives.find((archive) => archive.name?.toLowerCase() === name.toLowerCase()) || null);
        }
        catch (error) {
            return null;
        }
    }
    /**
     * Finds note by name in archive
     */
    async findNoteByName(name, archiveId) {
        try {
            const result = await this.searchNotes(name, 50, 0, archiveId, undefined, 0);
            return (result.items.find((note) => note.name?.toLowerCase() === name.toLowerCase()) || null);
        }
        catch (error) {
            return null;
        }
    }
    /**
     * Поиск или создание служебного раздела "MCP"
     */
    async findOrCreateMCPContext() {
        const contexts = await this.torrowClient.getContexts();
        const mcpContext = contexts.find((context) => context.name === "MCP");
        if (mcpContext) {
            return mcpContext;
        }
        const newContext = await this.torrowClient.createContext("MCP");
        return newContext;
    }
    /**
     * Checks if note with name exists in archive
     */
    async noteExistsInArchive(name, archiveId) {
        try {
            const result = await this.searchNotes(name, 20, 0, archiveId, undefined, 0);
            return result.items.some((note) => note.name?.toLowerCase() === name.toLowerCase());
        }
        catch (error) {
            return false;
        }
    }
}
//# sourceMappingURL=torrowService.js.map