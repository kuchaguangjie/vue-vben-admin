import { describe, expect, it } from 'vitest';

import {
  extractTreeValue,
  formatBackendTime,
  formatJsonObj,
} from '../value-format';

describe('formatBackendTime', () => {
  it('returns empty string for empty input', () => {
    expect(formatBackendTime('')).toBe('');
  });

  it('formats RFC3339 with timezone', () => {
    const result = formatBackendTime('2025-10-04T00:51:59.575623+08:00');
    expect(result).toBe('2025-10-04 00:51:59 +08');
  });

  it('formats time with negative timezone', () => {
    const result = formatBackendTime('2025-10-04T00:51:59.575623-05:00');
    expect(result).toBe('2025-10-04 00:51:59 -05');
  });

  it('formats time without milliseconds', () => {
    const result = formatBackendTime('2025-10-04T00:51:59+08:00');
    expect(result).toBe('2025-10-04 00:51:59 +08');
  });

  it('handles UTC Z suffix', () => {
    const result = formatBackendTime('2025-10-04T00:51:59.575Z');
    expect(result).toBe('2025-10-04 00:51:59Z');
  });
});

describe('formatJsonObj', () => {
  it('returns empty string for falsy input', () => {
    expect(formatJsonObj(null)).toBe('');
    expect(formatJsonObj(undefined)).toBe('');
    expect(formatJsonObj('')).toBe('');
  });

  it('returns string as-is', () => {
    expect(formatJsonObj('hello')).toBe('hello');
  });

  it('formats object to pretty JSON', () => {
    const result = formatJsonObj({ a: 1, b: 2 });
    expect(result).toBe('{\n  "a": 1,\n  "b": 2\n}');
  });

  it('formats array to pretty JSON', () => {
    const result = formatJsonObj([1, 2, 3]);
    expect(result).toBe('[\n  1,\n  2,\n  3\n]');
  });
});

describe('extractTreeValue', () => {
  it('converts object array to id array', () => {
    const values = {
      menuIds: [{ value: 1 }, { value: 2 }, { value: 3 }],
    };
    extractTreeValue(values, ['menuIds']);
    expect(values.menuIds).toEqual([1, 2, 3]);
  });

  it('keeps non-object items as-is', () => {
    const values = {
      menuIds: [1, 2, 3],
    };
    extractTreeValue(values, ['menuIds']);
    expect(values.menuIds).toEqual([1, 2, 3]);
  });

  it('handles multiple fields', () => {
    const values = {
      deptIds: [{ value: 10 }],
      roleIds: [{ value: 20 }],
    };
    extractTreeValue(values, ['deptIds', 'roleIds']);
    expect(values.deptIds).toEqual([10]);
    expect(values.roleIds).toEqual([20]);
  });

  it('skips non-array values', () => {
    const values = { menuIds: 'not-array' as any };
    extractTreeValue(values, ['menuIds']);
    expect(values.menuIds).toBe('not-array');
  });
});
