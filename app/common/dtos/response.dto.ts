export interface PaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export class ResponseDto<T = unknown> {
    code: number;
    message: string;
    count: number;
    results: T[];
    meta?: PaginationMeta;

    constructor(
        code: number, 
        message: string, 
        results: T[] = [], 
        meta?: PaginationMeta
    ) {
        this.code = code;
        this.message = message;
        this.results = results;
        this.count = results.length;
        this.meta = meta;
    }
}