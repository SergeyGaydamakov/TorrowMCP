import { NotFoundError, ValidationError } from "../common/errors.js";
import {
  TorrowCreateNoteInfo,
  TorrowNote,
  TorrowNoteInArchive,
  TorrowContext,
  SearchResult,
  NoteViewResponse,
} from "../common/types.js";
import { TorrowClient } from "../torrow/torrowClient.js";

export class TorrowService {
  private mcpContext: TorrowContext | null;

  constructor(private torrowClient: TorrowClient) {
    this.mcpContext = null;
  }

  /**
   * Creates a note in an archive (group, catalog)
   * @param createNoteInfo - information to create a note
   * @param archiveId - ID of the archive to create the note in
   * @returns created note
   */
  async createNoteInArchive(
    createNoteInfo: TorrowCreateNoteInfo,
    archiveId: string
  ): Promise<TorrowNoteInArchive> {
    // Get archive to verify it exists and is an archive
    const archive = await this.getArchive(archiveId);

    // Check if note with this name already exists in archive
    const exists = await this.noteExistsInArchive(
      createNoteInfo.name,
      archiveId
    );
    if (exists) {
      throw new ValidationError(
        `Заметка с названием "${createNoteInfo.name}" уже существует в каталоге "${archive.name}"`
      );
    }

    const note = await this.torrowClient.createNote(createNoteInfo, archiveId);
    if (!note || !note.id) {
      throw new NotFoundError(
        `Failed to create note in archive "${archiveId}"`
      );
    }
    await this.torrowClient.addNoteToGroup(
      note.id,
      archiveId,
      createNoteInfo.tags
    );
    // Update tags for the note
    if (createNoteInfo.tags !== undefined && createNoteInfo.tags.length > 0) {
      await this.torrowClient.updateNoteTags(note.id, createNoteInfo.tags);
    }
    return { ...note, archiveId: archiveId, archiveName: archive.name };
  }

  /**
   * Updates a note by ID
   * @param noteId - ID of the note to update
   * @param noteName - new name of the note
   * @param noteText - new text of the note
   * @param noteTags - new tags of the note
   * @returns updated note
   */
  async updateNote(
    noteId: string,
    noteName?: string,
    noteText?: string,
    noteTags?: string[]
  ): Promise<TorrowNote> {
    const currentNote = await this.getNote(noteId);
    if (noteName !== undefined) {
      currentNote.name = noteName;
    }
    if (noteText !== undefined) {
      currentNote.data = noteText;
    }

    await this.torrowClient.updateNote(currentNote);
    // Update tags for the note
    if (noteTags !== undefined && noteTags.length > 0) {
      await this.torrowClient.updateNoteTags(noteId, noteTags);
    }
    return currentNote;
  }

  /**
   * Deletes a note by ID
   * @param noteId - ID of the note to delete
   * @returns deleted note
   */
  async deleteNote(noteId: string): Promise<TorrowNote> {
    const currentNote = await this.getNote(noteId);
    await this.torrowClient.deleteNote(noteId);
    return currentNote;
  }

  /**
   * Gets a note by ID
   * @param noteId - ID of the note to get
   * @returns note
   */
  async getNote(noteId: string): Promise<TorrowNote> {
    const note = await this.torrowClient.getNote(noteId);
    if (!note || !note.id) {
      throw new NotFoundError(`Заметка с ID "${noteId}" не найдена`);
    }
    // Check that it's not an archive
    const isArchive = this.NoteIsArchive(note);
    if (isArchive) {
      throw new ValidationError(
        `Указанный ID "${noteId}" является каталогом, а не заметкой`
      );
    }

    return note;
  }

  /**
   * Maps NoteViewResponse to TorrowNote
   */
  private mapNoteViewToTorrowNote(item: NoteViewResponse): TorrowNote {
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

  /**
   * Searches notes in archive (group, catalog)
   * @param text - text to search
   * @param take - number of notes to take
   * @param skip - number of notes to skip
   * @param archiveId - ID of the archive to search in
   * @param tags - tags to search
   * @param distance - distance to search
   * @returns list of notes
   */
  async searchNotes(
    text?: string,
    take?: number,
    skip?: number,
    archiveId?: string,
    tags?: string[],
    distance?: number
  ): Promise<SearchResult> {
    const viewItems = await this.torrowClient.searchNotes(
      text,
      take,
      skip,
      archiveId,
      tags,
      distance
    );
    return {
      items: viewItems.map((item) => this.mapNoteViewToTorrowNote(item)),
      totalCount: viewItems.length,
    };
  }

  /**
   * Gets notes with user link to parent element
   * @param parentId - ID of the parent element to get notes from
   * @param take - number of notes to take
   * @param skip - number of notes to skip
   * @returns list of notes
   */
  async getUserNotes(
    parentId: string,
    take?: number,
    skip?: number
  ): Promise<TorrowNote[]> {
    const viewItems = await this.torrowClient.getUserNotesByParentId(
      parentId,
      take,
      skip
    );
    return viewItems.map((item) => this.mapNoteViewToTorrowNote(item));
  }

  /**
   * Gets pinned notes from parent element
   * @param parentId - ID of the parent element to get pinned notes from
   * @param take - number of notes to take
   * @param skip - number of notes to skip
   * @returns list of notes
   */
  async getPinnedNotes(
    parentId: string,
    take?: number,
    skip?: number
  ): Promise<TorrowNote[]> {
    const viewItems = await this.torrowClient.getPinnedNotesByParentId(
      parentId,
      take,
      skip
    );
    return viewItems.map((item) => this.mapNoteViewToTorrowNote(item));
  }

  /**
   * Checks if note is an archive
   * @param note - note to check
   * @returns true if note is an archive, false otherwise
   */
  NoteIsArchive(note: TorrowNote): boolean {
    return (
      note.groupInfo?.rolesToSearchItems?.includes("PublicReader") || false
    );
  }

  /**
   * Creates an archive (catalog)
   * @param createNoteInfo - information to create an archive
   * @returns created archive
   */
  async createArchive(
    createNoteInfo: TorrowCreateNoteInfo
  ): Promise<TorrowNote> {
    // Check archive limit (max 10)
    const existingArchives = await this.getArchives();
    if (existingArchives.length >= 10) {
      throw new ValidationError("Превышен лимит каталогов (максимум 10)");
    }

    // Check if archive with this name already exists
    const exists = existingArchives.find(
      (archive) =>
        archive.name?.toLowerCase() === createNoteInfo.name?.toLowerCase()
    );
    if (exists) {
      throw new ValidationError(
        `Каталог с названием "${createNoteInfo.name}" уже существует`
      );
    }

    const mcpContext = await this.findOrCreateMCPContext();
    const archive = await this.torrowClient.createNote(createNoteInfo, mcpContext.id);

    if (!archive || !archive.id) {
      throw new NotFoundError(`Failed to create archive`);
    }
    // Convert to archive and set tags
    await this.torrowClient.setNoteAsGroup(archive.id);

    if (createNoteInfo.tags !== undefined && createNoteInfo.tags.length > 0) {
      await this.torrowClient.updateNoteTags(archive.id, createNoteInfo.tags);
      // Установка быстрого фильтра по тегам для архива
      const solutionData = {
        ...archive.solutionData,
        quickFilterTags: createNoteInfo.tags,
      };
      await this.torrowClient.updateNoteSolutionData(archive.id, solutionData);
    }

    // Проверяем, что каталог создан в MCP контексте
    const newArchives = await this.getArchives();
    const isCreated = newArchives.find(
      (item) => item.name?.toLowerCase() === createNoteInfo.name?.toLowerCase()
    );
    if (!isCreated) {
      throw new NotFoundError(`Каталог с названием "${createNoteInfo.name}" создан, но не найден в списке архивов в MCP контексте ${mcpContext.name}.`);
    }
    return archive;
  }

  /**
   * Updates an archive (catalog)
   * @param archiveId - ID of the archive to update
   * @param archiveName - new name of the archive
   * @param archiveText - new text of the archive
   * @param archiveTags - new tags of the archive
   * @returns updated archive
   */
  async updateArchive(
    archiveId: string,
    archiveName?: string,
    archiveText?: string,
    archiveTags?: string[]
  ): Promise<TorrowNote> {
    const currentArchive = await this.getArchive(archiveId);
    if (!currentArchive) {
      throw new NotFoundError(`Каталог с ID "${archiveId}" не найден`);
    }
    // Check that it's an archive
    const isArchive = this.NoteIsArchive(currentArchive);
    if (!isArchive) {
      throw new ValidationError(
        `Указанный ID "${archiveId}" не является каталогом`
      );
    }
    if (archiveName !== undefined) {
      currentArchive.name = archiveName;
    }
    if (archiveText !== undefined) {
      currentArchive.data = archiveText;
    }

    await this.torrowClient.updateNote(currentArchive);

    // Update tags for the note
    if (archiveTags !== undefined && archiveTags.length > 0) {
      await this.torrowClient.updateNoteTags(archiveId, archiveTags);
      // Установка быстрого фильтра по тегам для архива
      const solutionData = {
        ...currentArchive.solutionData,
        quickFilterTags: archiveTags,
      };
      await this.torrowClient.updateNoteSolutionData(archiveId, solutionData);
    }
    return currentArchive;
  }

  /**
   * Deletes an archive (catalog)
   * @param archiveId - ID of the archive to delete
   * @param cascade - whether to delete notes in the archive
   * @returns deleted archive
   */
  async deleteArchive(archiveId: string, cascade?: boolean): Promise<TorrowNote> {
    const currentArchive = await this.getArchive(archiveId);
    if (!currentArchive) {
      throw new NotFoundError(`Каталог с ID "${archiveId}" не найден`);
    }
    // Check that it's an archive
    const isArchive = this.NoteIsArchive(currentArchive);
    if (!isArchive) {
      throw new ValidationError(
        `Указанный ID "${archiveId}" не является каталогом`
      );
    }
    await this.torrowClient.deleteNote(archiveId, cascade);
    return currentArchive;
  }

  /**
   * Gets archive (catalog) by ID
   * @param archiveId - ID of the archive to get
   * @returns archive
   */
  async getArchive(archiveId: string): Promise<TorrowNote> {
    const archive = await this.torrowClient.getNote(archiveId);
    if (!archive || !archive.id) {
      throw new NotFoundError(`Каталог с ID "${archiveId}" не найден`);
    }
    if (!(this.NoteIsArchive(archive))) {
      throw new NotFoundError(
        `Указанный ID "${archiveId}" не является каталогом`
      );
    }
    return archive;
  }

  /**
   * Gets list of archives (catalogs)
   * @returns list of archives
   */
  async getArchives(): Promise<TorrowNote[]> {
    const mcpContext = await this.findOrCreateMCPContext();

    try {
      const result = await this.torrowClient.getUserNotesByParentId(
        mcpContext.id,
        20,
        0
      );
      return result.map((item) => this.mapNoteViewToTorrowNote(item));
    } catch (error) {
        throw new NotFoundError(`Не удалось получить список архивов: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  }

  /**
   * Finds archive by name
   */
  async findArchiveByName(name: string): Promise<TorrowNote | null> {
    try {
      const archives = await this.getArchives();
      return (
        archives.find(
          (archive) => archive.name?.toLowerCase() === name.toLowerCase()
        ) || null
      );
    } catch (error) {
      return null;
    }
  }

  /**
   * Finds note by name in archive
   */
  async findNoteByName(
    name: string,
    archiveId: string
  ): Promise<TorrowNote | null> {
    try {
      const result = await this.searchNotes(name, 50, 0, archiveId, undefined, 0);
      return (
        result.items.find(
          (note) => note.name?.toLowerCase() === name.toLowerCase()
        ) || null
      );
    } catch (error) {
      return null;
    }
  }

  /**
   * Поиск или создание служебного раздела "MCP"
   */
  async findOrCreateMCPContext(): Promise<TorrowContext> {
    if (this.mcpContext) {
      return this.mcpContext;
    }
    const contexts = await this.torrowClient.getContexts();
    const mcpContext = contexts.find((context) => context.name === "MCP");
    if (mcpContext) {
      return mcpContext;
    }
    this.mcpContext = await this.torrowClient.createContext("MCP");
    // Заметка, которая по умолчанию будет включаться в MCP контекст
    const NOTE_FIND_RECIEPT = "1b5f03eb7bd076afe23ef66a8d0b619e";
    await this.torrowClient.saveNoteToMindmap(NOTE_FIND_RECIEPT, this.mcpContext.id);
    return this.mcpContext;
  }

  /**
   * Checks if note with name exists in archive
   * @param name - name of the note to check
   * @param archiveId - ID of the archive to check in
   * @returns true if note exists, false otherwise
   */
  async noteExistsInArchive(
    name: string,
    archiveId?: string
  ): Promise<boolean> {
    try {
      const result = await this.searchNotes(name, 20, 0, archiveId, undefined, 0);

      return result.items.some(
        (note) => note.name?.toLowerCase() === name.toLowerCase()
      );
    } catch (error) {
      return false;
    }
  }
}
