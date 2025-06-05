export class ResponseDto<T = any> {
    code: number;
    message: string;
    count: number;
    results: T[];

    constructor(code: number, message: string, results: T[] = []) {
        this.code = code;
        this.message = message;
        this.results = results;
        this.count = results.length;
    }

}
