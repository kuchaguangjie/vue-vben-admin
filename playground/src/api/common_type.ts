import type { SystemUserApi } from '#/api/system';

export namespace CommonType {
  export interface UpdateStatus {
    id: number;
    status: number;
  }
  export interface TreeWithUserCore<T = any> {
    [key: string]: any;
    topItems: T[];
    userCoreMap: Record<number, SystemUserApi.UserCore>;
  }
  export interface Page<T = any> {
    [key: string]: any;
    items: T[];
    total: number;
  }
  export interface PageWithUserCore<T = any> extends Page<T> {
    userCoreMap: Record<number, SystemUserApi.UserCore>;
  }
}
