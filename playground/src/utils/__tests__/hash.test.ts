import { describe, expect, it } from 'vitest';

import { generateSHA256 } from '../hash';

describe('generateSHA256', () => {
  it('generates a 64-character hex string', async () => {
    const hash = await generateSHA256('hello');
    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('generates consistent hash for same input', async () => {
    const hash1 = await generateSHA256('test');
    const hash2 = await generateSHA256('test');
    expect(hash1).toBe(hash2);
  });

  it('generates different hash for different input', async () => {
    const hash1 = await generateSHA256('hello');
    const hash2 = await generateSHA256('world');
    expect(hash1).not.toBe(hash2);
  });

  it('handles empty string', async () => {
    const hash = await generateSHA256('');
    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('produces known SHA-256 value', async () => {
    const hash = await generateSHA256('hello');
    expect(hash).toBe(
      '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824',
    );
  });
});
