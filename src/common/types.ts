/**
 * Common types for Torrow MCP service
 */

// Базовые типы для Torrow API
export interface TorrowNote {
  id: string;
  name: string;
  text?: string;
  tags?: string[];
  noteType?: string;
  meta?: {
    version: number;
    createdDate: string;
    modifiedDate: string;
  };
  groupInfo?: {
    isGroup: boolean;
  };
}

export interface TorrowArchive extends TorrowNote {
  groupInfo: {
    isGroup: true;
  };
}

// Контекст общения
export interface Context {
  archiveId?: string;
  noteId?: string;
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
