const SITE_PATH = /^\/(es|en)(?:\/(?:about|contact|projects(?:\/[^/]+)?|blog(?:\/[^/]+)?|search\/[^/]+))?\/?$/;

export function safePreviewPath(value) {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) return null;
  if (/[\\\u0000-\u001f]/.test(value) || /%2f|%5c|%00/i.test(value)) return null;

  try {
    if (value.split(/[?#]/, 1)[0].split('/').some((segment) => ['.', '..'].includes(decodeURIComponent(segment)))) return null;
  } catch {
    return null;
  }

  let url;
  try {
    url = new URL(value, 'https://preview.invalid');
  } catch {
    return null;
  }

  if (url.origin !== 'https://preview.invalid' || !SITE_PATH.test(url.pathname)) return null;
  url.searchParams.delete('sanity-preview-secret');
  return `${url.pathname}${url.search}${url.hash}`;
}
