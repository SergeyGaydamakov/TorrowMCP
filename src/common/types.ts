/**
 * Common types for Torrow MCP service
 */

// Базовые типы для Torrow API
export interface TorrowNote {
  id: string;
  name: string;
  data?: string;
  tags?: string[];
  noteType?: string;
  meta?: {
    version: number;
    createdDate: string;
    modifiedDate: string;
  };
  groupInfo?: {
    rolesToSearchItems?: string[];
  };
}

export interface TorrowArchive extends TorrowNote {
  groupInfo: {
    rolesToSearchItems?: string[];
  };
}

// Раздел Torrow (Context)
export interface TorrowContext {
  id: string;
  name: string;
  [key: string]: unknown;
}

// Контекст общения
export interface Context {
  archiveId?: string;
  archiveName?: string;
  noteId?: string;
  noteName?: string;
  contextId?: string;
}

// Разобранная фраза
export interface ParsedPhrase {
  name: string;
  text?: string;
  tags: string[];
}

// Параметры поиска
export interface SearchParams {
  text?: string;
  tags?: string[];
  archiveId?: string;
  take?: number;
  skip?: number;
  distance?: number;
}

// Результат поиска
export interface SearchResult {
  items: TorrowNote[];
  totalCount: number;
}

// Ошибки API
export interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
}

// Response structure from /api/v1/notes/{parentId}/views/user
export interface NoteViewResponse {
  itemObject?: {
    id: string;
    meta?: {
      version: number;
      createdDate: string;
      modifiedDate: string;
    };
  };
  name: string;
  data?: string;
  tags?: string[];
  noteType?: string;
  groupInfo?: {
    rolesToSearchItems?: string[];
  };
  [key: string]: unknown;
}
