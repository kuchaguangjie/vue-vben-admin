import { describe, expect, it, vi } from 'vitest';

import { usePreviewLink } from '../use-preview-link';

describe('usePreviewLink', () => {
  it('returns column config with correct field and title', () => {
    const onPreview = vi.fn();
    const result = usePreviewLink({ field: 'name', title: 'Name' }, onPreview);

    expect(result.field).toBe('name');
    expect(result.title).toBe('Name');
  });

  it('has default width of 120', () => {
    const onPreview = vi.fn();
    const result = usePreviewLink({ field: 'name', title: 'Name' }, onPreview);

    expect(result.width).toBe(120);
  });

  it('accepts custom width', () => {
    const onPreview = vi.fn();
    const result = usePreviewLink(
      { field: 'name', title: 'Name', width: 200 },
      onPreview,
    );

    expect(result.width).toBe(200);
  });

  it('has sortable undefined by default', () => {
    const onPreview = vi.fn();
    const result = usePreviewLink({ field: 'name', title: 'Name' }, onPreview);

    expect(result.sortable).toBeUndefined();
  });

  it('accepts sortable option', () => {
    const onPreview = vi.fn();
    const result = usePreviewLink(
      { field: 'name', title: 'Name', sortable: true },
      onPreview,
    );

    expect(result.sortable).toBe(true);
  });

  it('has slots.default as a function', () => {
    const onPreview = vi.fn();
    const result = usePreviewLink({ field: 'name', title: 'Name' }, onPreview);

    expect(result.slots).toBeDefined();
    expect(typeof result.slots.default).toBe('function');
  });
});
