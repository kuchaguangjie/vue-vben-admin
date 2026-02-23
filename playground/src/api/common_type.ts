import type { SystemUserApi } from '#/api/system';

export namespace CommonType {
  export interface UpdateStatus {
    id: number;
    status: number;
  }

  export interface Page<T = any> {
    [key: string]: any;
    items: T[];
    total: number;
  }
  export interface PageWithUserCore<T = any> extends Page<T> {
    userCoreMap: Record<number, SystemUserApi.UserCore>;
  }

  export interface Tree<T = any> {
    [key: string]: any;
    roots: T[];
  }
  export interface TreeWithUserCore<T = any> extends Tree<T> {
    userCoreMap: Record<number, SystemUserApi.UserCore>;
  }
}

// call given tree api, but return roots array only;
export async function getTreeAsRoots<T = any>(
  apiFn: (params?: any) => Promise<CommonType.Tree<T>>,
  params?: any,
): Promise<T[]> {
  const result = await apiFn(params);
  return result?.roots || [];
}
