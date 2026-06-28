import { describe, expect, it } from 'vitest';

import {
  useDisabledPagerConfig,
  useFullPagerConfig,
  useNeatPagerConfig,
  usePagerConfig,
} from '../pager';

describe('usePagerConfig', () => {
  it('returns same config as useNeatPagerConfig', () => {
    expect(usePagerConfig()).toEqual(useNeatPagerConfig());
  });
});

describe('useFullPagerConfig', () => {
  it('has paging enabled', () => {
    expect(useFullPagerConfig().enabled).toBe(true);
  });

  it('has default page size of 20', () => {
    expect(useFullPagerConfig().pageSize).toBe(20);
  });

  it('has 4 page size options', () => {
    expect(useFullPagerConfig().pageSizes).toEqual([10, 20, 50, 100]);
  });

  it('includes PrevJump and NextJump layouts', () => {
    const { layouts } = useFullPagerConfig();
    expect(layouts).toContain('PrevJump');
    expect(layouts).toContain('NextJump');
  });

  it('has Total and FullJump', () => {
    const { layouts } = useFullPagerConfig();
    expect(layouts).toContain('Total');
    expect(layouts).toContain('FullJump');
  });
});

describe('useNeatPagerConfig', () => {
  it('has paging enabled', () => {
    expect(useNeatPagerConfig().enabled).toBe(true);
  });

  it('has default page size of 20', () => {
    expect(useNeatPagerConfig().pageSize).toBe(20);
  });

  it('does not include PrevJump or NextJump', () => {
    const { layouts } = useNeatPagerConfig();
    expect(layouts).not.toContain('PrevJump');
    expect(layouts).not.toContain('NextJump');
  });
});

describe('useDisabledPagerConfig', () => {
  it('has paging disabled', () => {
    expect(useDisabledPagerConfig().enabled).toBe(false);
  });
});
