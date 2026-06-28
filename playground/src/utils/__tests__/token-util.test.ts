import { describe, expect, it } from 'vitest';

import { formatToken } from '../token-util';

describe('formatToken', () => {
  it('returns null for null input', () => {
    expect(formatToken(null)).toBeNull();
  });

  it('formats token with Bearer prefix', () => {
    expect(formatToken('abc123')).toBe('Bearer abc123');
  });

  it('formats JWT token with Bearer prefix', () => {
    expect(formatToken('eyJhbGciOiJIUzI1NiJ9.xxx.yyy')).toBe(
      'Bearer eyJhbGciOiJIUzI1NiJ9.xxx.yyy',
    );
  });
});
