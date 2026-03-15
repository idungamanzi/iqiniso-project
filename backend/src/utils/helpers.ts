export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function getClientIp(req: { ip?: string; headers: Record<string, string | string[] | undefined> }): string {
  const forwarded = req.headers['x-forwarded-for']
  if (typeof forwarded === 'string') return forwarded.split(',')[0].trim()
  return req.ip ?? 'unknown'
}

/**
 * Builds a full URL for an uploaded file path.
 * Returns null if path is null/undefined.
 */
export function fileUrl(req: { protocol: string; get: (h: string) => string | undefined }, filePath: string | null | undefined): string | null {
  if (!filePath) return null
  const base = `${req.protocol}://${req.get('host')}`
  return `${base}/${filePath.replace(/\\/g, '/')}`
}
