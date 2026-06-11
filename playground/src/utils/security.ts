import DOMPurify from 'dompurify';

export function isSafeRedirectUrl(url: string): boolean {
  if (!url) {
    return false;
  }

  if (url.startsWith('//')) {
    return false;
  }

  if (/^https?:\/\//i.test(url)) {
    return false;
  }

  if (url.startsWith('/')) {
    return true;
  }

  return false;
}

export function getSafeRedirectPath(
  url: null | string | undefined,
  fallback: string = '/',
): string {
  if (!url) {
    return fallback;
  }
  const decoded = decodeURIComponent(url);
  return isSafeRedirectUrl(decoded) ? decoded : fallback;
}

export function safeHtml(html: string): string {
  if (!html) {
    return '';
  }
  return DOMPurify.sanitize(html);
}
