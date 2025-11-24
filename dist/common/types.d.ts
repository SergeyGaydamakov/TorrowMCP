/**
 * Common types for Torrow MCP service
 */
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
export interface Context {
    archiveId?: string;
    noteId?: string;
}
export interface ParsedPhrase {
    name: string;
    text?: string;
    tags: string[];
}
export interface SearchParams {
    text?: string;
    tags?: string[];
    archiveId?: string;
    take?: number;
    skip?: number;
}
export interface SearchResult {
    items: TorrowNote[];
    totalCount: number;
}
export interface ApiError {
    message: string;
    code?: string;
    details?: unknown;
}
//# sourceMappingURL=types.d.ts.map