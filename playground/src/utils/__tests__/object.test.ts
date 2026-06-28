import { describe, expect, it } from 'vitest';

import { checkAllFieldsEmpty, removeEmptyFields } from '../object';

describe('checkAllFieldsEmpty', () => {
  it('returns true for empty object', () => {
    expect(checkAllFieldsEmpty({})).toBe(true);
  });

  it('returns true for all undefined', () => {
    expect(checkAllFieldsEmpty({ a: undefined, b: undefined })).toBe(true);
  });

  it('returns true for all null', () => {
    expect(checkAllFieldsEmpty({ a: null, b: null })).toBe(true);
  });

  it('returns true for all empty string', () => {
    expect(checkAllFieldsEmpty({ a: '', b: '' })).toBe(true);
  });

  it('returns true for mixed empty values', () => {
    expect(checkAllFieldsEmpty({ a: undefined, b: null, c: '' })).toBe(true);
  });

  it('returns false when at least one field has value', () => {
    expect(checkAllFieldsEmpty({ a: undefined, b: 'hello' })).toBe(false);
  });

  it('returns false for non-empty number', () => {
    expect(checkAllFieldsEmpty({ a: 0, b: undefined })).toBe(false);
  });
});

describe('removeEmptyFields', () => {
  it('removes empty string fields', () => {
    expect(removeEmptyFields({ a: 'hello', b: '' })).toEqual({ a: 'hello' });
  });

  it('keeps null and undefined (only filters empty string)', () => {
    const result = removeEmptyFields({ a: 'hello', b: null, c: undefined });
    expect(result).toEqual({ a: 'hello', b: null, c: undefined });
  });

  it('returns empty object when all fields are empty string', () => {
    expect(removeEmptyFields({ a: '', b: '' })).toEqual({});
  });

  it('keeps non-empty values', () => {
    expect(removeEmptyFields({ a: 'x', b: 'y' })).toEqual({ a: 'x', b: 'y' });
  });
});
