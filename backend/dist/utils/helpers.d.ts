export declare function slugify(text: string): string;
export declare function getClientIp(req: {
    ip?: string;
    headers: Record<string, string | string[] | undefined>;
}): string;
/**
 * Builds a full URL for an uploaded file path.
 * Returns null if path is null/undefined.
 */
export declare function fileUrl(req: {
    protocol: string;
    get: (h: string) => string | undefined;
}, filePath: string | null | undefined): string | null;
//# sourceMappingURL=helpers.d.ts.map