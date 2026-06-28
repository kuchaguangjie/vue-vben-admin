import { describe, expect, it } from 'vitest';

import { getSafeRedirectPath, isSafeRedirectUrl, safeHtml } from '../security';

describe('isSafeRedirectUrl', () => {
  it('rejects empty string', () => {
    expect(isSafeRedirectUrl('')).toBe(false);
  });

  it('rejects protocol-relative URL', () => {
    expect(isSafeRedirectUrl('//evil.com')).toBe(false);
  });

  it('rejects http URL', () => {
    expect(isSafeRedirectUrl('http://evil.com')).toBe(false);
  });

  it('rejects https URL', () => {
    expect(isSafeRedirectUrl('https://evil.com')).toBe(false);
  });

  it('allows absolute path', () => {
    expect(isSafeRedirectUrl('/dashboard')).toBe(true);
  });

  it('allows root path', () => {
    expect(isSafeRedirectUrl('/')).toBe(true);
  });

  it('rejects relative path without leading slash', () => {
    expect(isSafeRedirectUrl('dashboard')).toBe(false);
  });

  it('rejects javascript protocol', () => {
    expect(isSafeRedirectUrl('javascript:alert(1)')).toBe(false);
  });
});

describe('getSafeRedirectPath', () => {
  it('returns fallback for null', () => {
    expect(getSafeRedirectPath(null)).toBe('/');
  });

  it('returns fallback for undefined', () => {
    expect(getSafeRedirectPath(undefined)).toBe('/');
  });

  it('returns fallback for empty string', () => {
    expect(getSafeRedirectPath('')).toBe('/');
  });

  it('returns custom fallback', () => {
    expect(getSafeRedirectPath(null, '/home')).toBe('/home');
  });

  it('returns safe path as-is', () => {
    expect(getSafeRedirectPath('/admin/users')).toBe('/admin/users');
  });

  it('decodes URL-encoded safe path', () => {
    expect(getSafeRedirectPath('/admin%2Fusers')).toBe('/admin/users');
  });

  it('falls back for unsafe URL', () => {
    expect(getSafeRedirectPath('https://evil.com')).toBe('/');
  });
});

describe('safeHtml', () => {
  it('returns empty string for empty input', () => {
    expect(safeHtml('')).toBe('');
  });

  it('keeps safe HTML', () => {
    const result = safeHtml('<b>bold</b>');
    expect(result).toContain('bold');
  });

  it('removes dangerous script tags', () => {
    const result = safeHtml('<img src=x onerror=alert(1)>');
    expect(result).not.toContain('onerror');
  });

  it('removes onclick handlers', () => {
    const result = safeHtml('<div onclick="alert(1)">text</div>');
    expect(result).not.toContain('onclick');
  });
});
