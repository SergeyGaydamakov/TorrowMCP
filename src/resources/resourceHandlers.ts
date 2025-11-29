/**
 * Resource handlers for MCP server
 */
import {
  ReadResourceRequest,
  ReadResourceResult,
} from "@modelcontextprotocol/sdk/types.js";
import { TorrowService } from "../service/torrowService.js";
import { NotFoundError, ValidationError } from "../common/errors.js";

export class ResourceHandlers {
  constructor(private torrowService: TorrowService) {}

  /**
   * Handles note resource requests
   */
  async handleNoteResource(
    request: ReadResourceRequest
  ): Promise<ReadResourceResult> {
    // Parse URI to extract noteId
    const uri = request.params.uri.toString();

    // Try multiple URI patterns
    let noteId: string | undefined;

    // Pattern 1: torrow://notes/{noteId}
    const uriMatch1 = uri.match(/torrow:\/\/notes\/(.+)$/);
    if (uriMatch1 && uriMatch1[1]) {
      noteId = decodeURIComponent(uriMatch1[1]);
    }

    // Pattern 2: torrow://notes/{noteId} with query params or fragments
    if (!noteId) {
      const uriMatch2 = uri.match(/torrow:\/\/notes\/([^?#]+)/);
      if (uriMatch2 && uriMatch2[1]) {
        noteId = decodeURIComponent(uriMatch2[1]);
      }
    }

    if (
      !noteId ||
      noteId === "undefined" ||
      noteId === "{noteId}" ||
      noteId.trim() === ""
    ) {
      throw new ValidationError(
        `Invalid note URI format. Expected: torrow://notes/{noteId} where {noteId} should be replaced with actual note ID (e.g., torrow://notes/aae6203eb30ec9f2624061bd89b595f57). Got: ${uri}`
      );
    }

    const note = await this.torrowService.getNote(noteId);

    return {
      contents: [
        {
          uri: request.params.uri,
          mimeType: "application/json",
          text: JSON.stringify(
            {
              id: note.id,
              name: note.name,
              text: note.data,
              tags: note.tags,
              type: "note",
              meta: note.meta,
            },
            null,
            2
          ),
        },
      ],
    };
  }

  /**
   * Handles archive resource requests
   */
  async handleArchiveResource(
    request: ReadResourceRequest
  ): Promise<ReadResourceResult> {
    // Parse URI to extract archiveId
    const uri = request.params.uri.toString();

    // Try multiple URI patterns
    let archiveId: string | undefined;

    // Pattern 1: torrow://archives/{archiveId}
    const uriMatch1 = uri.match(/torrow:\/\/archives\/(.+)$/);
    if (uriMatch1 && uriMatch1[1]) {
      archiveId = decodeURIComponent(uriMatch1[1]);
    }

    // Pattern 2: torrow://archives/{archiveId} with query params or fragments
    if (!archiveId) {
      const uriMatch2 = uri.match(/torrow:\/\/archives\/([^\/?#]+)/);
      if (uriMatch2 && uriMatch2[1]) {
        archiveId = decodeURIComponent(uriMatch2[1]);
      }
    }

    if (
      !archiveId ||
      archiveId === "undefined" ||
      archiveId === "{archiveId}" ||
      archiveId.trim() === ""
    ) {
      throw new ValidationError(
        `Invalid archive URI format. Expected: torrow://archives/{archiveId} where {archiveId} should be replaced with actual archive ID. Got: ${uri}`
      );
    }

    const archive = await this.torrowService.getArchive(archiveId);

    return {
      contents: [
        {
          uri: request.params.uri,
          mimeType: "application/json",
          text: JSON.stringify(
            {
              id: archive.id,
              name: archive.name,
              text: archive.data,
              tags: archive.tags,
              type: "archive",
              meta: archive.meta,
            },
            null,
            2
          ),
        },
      ],
    };
  }

  /**
   * Handles archives list resource requests
   */
  async handleArchivesListResource(
    request: ReadResourceRequest
  ): Promise<ReadResourceResult> {
    const archives = await this.torrowService.getArchives();

    const archivesList = archives.map((archive) => ({
      id: archive.id,
      name: archive.name,
      text: archive.data,
      tags: archive.tags,
      meta: archive.meta,
    }));

    return {
      contents: [
        {
          uri: request.params.uri,
          mimeType: "application/json",
          text: JSON.stringify(
            {
              archives: archivesList,
              count: archivesList.length,
            },
            null,
            2
          ),
        },
      ],
    };
  }

  /**
   * Handles archive notes resource requests
   */
  async handleArchiveNotesResource(
    request: ReadResourceRequest
  ): Promise<ReadResourceResult> {
    // Parse URI to extract archiveId and query parameters
    const uri = request.params.uri.toString();

    // Extract archiveId from path
    let archiveId: string | undefined;

    // Pattern 1: torrow://archives/{archiveId}/notes
    const uriMatch1 = uri.match(/torrow:\/\/archives\/([^\/]+)\/notes/);
    if (uriMatch1 && uriMatch1[1]) {
      archiveId = decodeURIComponent(uriMatch1[1]);
    }

    // Pattern 2: torrow://archives/{archiveId}/notes with query params
    if (!archiveId) {
      const uriMatch2 = uri.match(/torrow:\/\/archives\/([^\/?#]+)\/notes/);
      if (uriMatch2 && uriMatch2[1]) {
        archiveId = decodeURIComponent(uriMatch2[1]);
      }
    }

    if (
      !archiveId ||
      archiveId === "undefined" ||
      archiveId === "{archiveId}" ||
      archiveId.trim() === ""
    ) {
      throw new ValidationError(
        `Invalid archive notes URI format. Expected: torrow://archives/{archiveId}/notes where {archiveId} should be replaced with actual archive ID. Got: ${uri}`
      );
    }

    // Parse query parameters for limit and skip manually
    // Extract query string (everything after ?)
    const queryString = uri.includes("?") ? uri.split("?")[1].split("#")[0] : "";
    const queryParams = new URLSearchParams(queryString);
    
    const limitParam = queryParams.get("limit");
    const skipParam = queryParams.get("skip");
    
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;
    const skip = skipParam ? parseInt(skipParam, 10) : undefined;

    if (limit !== undefined && (isNaN(limit) || limit < 0)) {
      throw new ValidationError(
        `Invalid limit parameter. Expected a non-negative integer, got: ${limitParam}`
      );
    }

    if (skip !== undefined && (isNaN(skip) || skip < 0)) {
      throw new ValidationError(
        `Invalid skip parameter. Expected a non-negative integer, got: ${skipParam}`
      );
    }

    // Search notes in archive (empty text means get all notes)
    const searchResult = await this.torrowService.searchNotes(
      undefined, // text - empty to get all notes
      limit,     // take (limit)
      skip,      // skip
      archiveId, // archiveId
      undefined, // tags
      undefined  // distance
    );

    const notesList = searchResult.items.map((note) => ({
      id: note.id,
      name: note.name,
      text: note.data,
      tags: note.tags,
      meta: note.meta,
    }));

    return {
      contents: [
        {
          uri: request.params.uri,
          mimeType: "application/json",
          text: JSON.stringify(
            {
              notes: notesList,
              count: notesList.length,
              totalCount: searchResult.totalCount,
              archiveId: archiveId,
            },
            null,
            2
          ),
        },
      ],
    };
  }

  /**
   * Routes resource requests to appropriate handlers
   */
  async handleResourceRequest(
    request: ReadResourceRequest
  ): Promise<ReadResourceResult> {
    try {
      const uri = request.params.uri.toString();

      const uriParts = uri.split("://");
      if (uriParts.length < 2) {
        throw new ValidationError(`Invalid URI format: ${uri}`);
      }

      const resourceType = uriParts[1].split("/")[0];
      const pathAfterType = uriParts[1].substring(resourceType.length);

      switch (resourceType) {
        case "notes":
          return this.handleNoteResource(request);
        case "archives":
          // Check if it's archives list resource (exactly /list or /list with query params)
          if (pathAfterType === "/list" || /^\/list(\?|$)/.test(pathAfterType)) {
            return this.handleArchivesListResource(request);
          }
          // Check if it's archive notes resource (contains /notes)
          if (pathAfterType.includes("/notes")) {
            return this.handleArchiveNotesResource(request);
          }
          return this.handleArchiveResource(request);
        default:
          throw new NotFoundError(
            `Unknown resource type: ${resourceType}. Full request: ${JSON.stringify(
              request,
              null,
              2
            )}`
          );
      }
    } catch (error) {
      throw error;
    }
  }
}
