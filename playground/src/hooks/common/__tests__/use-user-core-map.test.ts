import { describe, expect, it } from 'vitest';

import { useUserCoreMap } from '../use-user-core-map';

describe('useUserCoreMap', () => {
  it('returns empty map initially', () => {
    const { userCoreMap } = useUserCoreMap();
    expect(userCoreMap.value).toEqual({});
  });

  it('sets and gets user core map', () => {
    const { setUserCoreMap, getUserCore, userCoreMap } = useUserCoreMap();

    setUserCoreMap({
      1: { id: 1, nickname: 'Alice', username: 'alice' },
      2: { id: 2, nickname: 'Bob', username: 'bob' },
    });

    expect(userCoreMap.value).toEqual({
      1: { id: 1, nickname: 'Alice', username: 'alice' },
      2: { id: 2, nickname: 'Bob', username: 'bob' },
    });
    expect(getUserCore(1)).toEqual({
      id: 1,
      nickname: 'Alice',
      username: 'alice',
    });
    expect(getUserCore(2)).toEqual({ id: 2, nickname: 'Bob', username: 'bob' });
  });

  it('returns undefined for non-existent user', () => {
    const { getUserCore } = useUserCoreMap();
    expect(getUserCore(999)).toBeUndefined();
  });

  it('clears the map', () => {
    const { setUserCoreMap, clearUserCoreMap, userCoreMap } = useUserCoreMap();

    setUserCoreMap({ 1: { id: 1, nickname: 'Alice', username: 'alice' } });
    clearUserCoreMap();
    expect(userCoreMap.value).toEqual({});
  });

  it('shares state across multiple instances (global ref)', () => {
    const { setUserCoreMap } = useUserCoreMap();
    const { userCoreMap: map2, getUserCore: get2 } = useUserCoreMap();

    setUserCoreMap({ 1: { id: 1, nickname: 'Alice', username: 'alice' } });

    expect(map2.value[1]).toEqual({
      id: 1,
      nickname: 'Alice',
      username: 'alice',
    });
    expect(get2(1)).toEqual({ id: 1, nickname: 'Alice', username: 'alice' });
  });
});
