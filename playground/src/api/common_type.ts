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
}
