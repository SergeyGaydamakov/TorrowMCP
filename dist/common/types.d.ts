/**
 * Common types for Torrow MCP service
 */
export interface TorrowCreateNoteInfo {
    name: string;
    data?: string;
    tags?: string[];
    noteType?: string;
}
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
export interface TorrowNoteInArchive extends TorrowNote {
    archiveId: string;
    archiveName: string;
}
export interface TorrowArchive extends TorrowNote {
    groupInfo: {
        rolesToSearchItems?: string[];
    };
}
export interface TorrowContext {
    id: string;
    name: string;
    [key: string]: unknown;
}
export interface Context {
    archiveId?: string;
    archiveName?: string;
    noteId?: string;
    noteName?: string;
    contextId?: string;
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
    distance?: number;
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
//# sourceMappingURL=types.d.ts.map