/**
 * Prompt handlers for MCP server
 */
import {
  GetPromptRequest,
  GetPromptResult,
  CompleteRequest,
  CompleteResult,
} from "@modelcontextprotocol/sdk/types.js";
import { ValidationError } from "../common/errors.js";
import {
  PROMPT_LIST_ARCHIVES,
  PROMPT_SEARCH_NOTES,
  PROMPT_ARCHIVE_STATS,
} from "./promptConstants.js";
import {
  ListArchivesSchema,
  SearchNotesSchema,
  ArchiveStatsSchema,
} from "./promptSchemas.js";
import { TorrowService } from "../service/torrowService.js";

export class PromptHandlers {
  constructor(private torrowService: TorrowService) {}

  /**
   * Lists all available archives
   */
  async listArchives(request: GetPromptRequest): Promise<GetPromptResult> {
    ListArchivesSchema.parse(request.params.arguments || {});

    const archives = await this.torrowService.getArchives();

    if (archives.length === 0) {
      return {
        description: "List of archives",
        messages: [
          {
            role: "assistant",
            content: {
              type: "text",
              text: "Архивы не найдены. Создайте новый архив с помощью инструмента create_archive.",
            },
          },
        ],
      };
    }

    const archivesList = archives
      .map(
        (archive, index) =>
          `${index + 1}. "${archive.name}" (ID: ${archive.id})${
            archive.tags?.length ? " #" + archive.tags.join(" #") : ""
          }`
      )
      .join("\n");

    return {
      description: "List of archives",
      messages: [
        {
          role: "assistant",
          content: {
            type: "text",
            text: `Найдено архивов: ${archives.length}\n\n${archivesList}`,
          },
        },
      ],
    };
  }

  /**
   * Searches notes in an archive
   */
  async searchNotes(request: GetPromptRequest): Promise<GetPromptResult> {
    const { phrase, limit, skip, archiveId, tags, distance } =
      SearchNotesSchema.parse(request.params.arguments || {});

    // Get archive to verify it exists
    const archive = await this.torrowService.getArchive(archiveId);

    const result = await this.torrowService.searchNotes(
      phrase,
      limit,
      skip,
      archive.id,
      tags,
      distance
    );

    if (result.items.length === 0) {
      return {
        description: "Search results",
        messages: [
          {
            role: "assistant",
            content: {
              type: "text",
              text: `В архиве "${archive.name}" для указанных параметров заметок не найдено.`,
            },
          },
        ],
      };
    }

    const notesList = result.items
      .map(
        (note, index) =>
          `${index + 1}. "${note.name}" (ID: ${note.id})${
            note.tags?.length ? " #" + note.tags.join(" #") : ""
          }`
      )
      .join("\n");

    return {
      description: "Search results",
      messages: [
        {
          role: "assistant",
          content: {
            type: "text",
            text: `Найдено заметок: ${result.items.length} в архиве "${archive.name}"\n\n${notesList}`,
          },
        },
      ],
    };
  }

  /**
   * Gets statistics about an archive
   */
  async archiveStats(request: GetPromptRequest): Promise<GetPromptResult> {
    const params = ArchiveStatsSchema.parse(request.params.arguments || {});
    const MAX_NOTES_COUNT = 101;

    // Get archive to verify it exists
    const archive = await this.torrowService.getArchive(params.archiveId);

    // Get all notes in archive
    const searchResult = await this.torrowService.searchNotes(
      undefined,
      MAX_NOTES_COUNT,
      undefined,
      params.archiveId,
      undefined,
      undefined
    );

    const totalNotes = searchResult.totalCount;

    // Collect all tags
    const tagCounts: Record<string, number> = {};
    searchResult.items.forEach((note) => {
      if (note.tags) {
        note.tags.forEach((tag) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });

    const uniqueTags = Object.keys(tagCounts).length;
    const topTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag, count]) => `  - ${tag}: ${count}`)
      .join("\n");

    const statsText =
      `Статистика архива "${archive.name}" (ID: ${params.archiveId}):\n\n` +
      `Всего заметок: ${
        totalNotes == MAX_NOTES_COUNT ? "более " + totalNotes : totalNotes
      }\n` +
      `Уникальных тегов: ${uniqueTags}\n` +
      (topTags ? `\nТоп-10 тегов:\n${topTags}` : "\nТеги отсутствуют");

    return {
      description: "Archive statistics",
      messages: [
        {
          role: "assistant",
          content: {
            type: "text",
            text: statsText,
          },
        },
      ],
    };
  }

  /**
   * Handles completion requests for prompt arguments
   */
  async handleCompletionRequest(
    request: CompleteRequest
  ): Promise<CompleteResult> {
    // Check if this is a prompt completion request
    if (request.params.ref.type !== "ref/prompt") {
      throw new ValidationError("Completion is only supported for prompts");
    }

    const promptName = request.params.ref.name;
    const argumentName = request.params.argument.name;
    const argumentValue = request.params.argument.value || "";

    // Handle completion for PROMPT_SEARCH_NOTES - archiveId
    if (promptName === PROMPT_SEARCH_NOTES && argumentName === "archiveId") {
      try {
        const archives = await this.torrowService.getArchives();

        // Filter archives by the current input value (case-insensitive)
        const filteredArchives = archives
          .filter(
            (archive) =>
              archive.id &&
              (archive.id.toLowerCase().includes(argumentValue.toLowerCase()) ||
                archive.name
                  ?.toLowerCase()
                  .includes(argumentValue.toLowerCase()))
          )
          .map((archive) => archive.id || "")
          .filter((id) => id.length > 0)
          .slice(0, 100); // Limit to 100 items as per MCP spec

        return {
          completion: {
            values: filteredArchives,
            total: filteredArchives.length,
            hasMore: false,
          },
        };
      } catch (error) {
        // Return empty completion on error
        return {
          completion: {
            values: [],
            total: 0,
            hasMore: false,
          },
        };
      }
    }

    // Handle completion for PROMPT_ARCHIVE_STATS - archiveId
    if (promptName === PROMPT_ARCHIVE_STATS && argumentName === "archiveId") {
      try {
        const archives = await this.torrowService.getArchives();

        // Filter archives by the current input value (case-insensitive)
        const filteredArchives = archives
          .filter(
            (archive) =>
              archive.id &&
              (archive.id.toLowerCase().includes(argumentValue.toLowerCase()) ||
                archive.name
                  ?.toLowerCase()
                  .includes(argumentValue.toLowerCase()))
          )
          .map((archive) => archive.id || "")
          .filter((id) => id.length > 0)
          .slice(0, 100); // Limit to 100 items as per MCP spec

        return {
          completion: {
            values: filteredArchives,
            total: filteredArchives.length,
            hasMore: false,
          },
        };
      } catch (error) {
        // Return empty completion on error
        return {
          completion: {
            values: [],
            total: 0,
            hasMore: false,
          },
        };
      }
    }

    // No completion for other prompts/arguments
    return {
      completion: {
        values: [],
        total: 0,
        hasMore: false,
      },
    };
  }

  /**
   * Routes prompt requests to appropriate handlers
   */
  async handlePromptRequest(
    request: GetPromptRequest
  ): Promise<GetPromptResult> {
    switch (request.params.name) {
      case PROMPT_LIST_ARCHIVES:
        return this.listArchives(request);
      case PROMPT_SEARCH_NOTES:
        return this.searchNotes(request);
      case PROMPT_ARCHIVE_STATS:
        return this.archiveStats(request);
      default:
        throw new ValidationError(`Unknown prompt: ${request.params.name}`);
    }
  }
}
