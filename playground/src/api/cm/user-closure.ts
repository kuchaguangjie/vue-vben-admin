import { requestClient } from '#/api/request';

export namespace CmUserClosureApi {
  export interface CmUserClosureRow {
    ancestorId: number;
    ancestorNick: string;
    ancestorUsername: string;
    createdAt: string;
    descendantId: number;
    descendantNick: string;
    descendantUsername: string;
    distance: number;
    tenantId: number;
  }

  export interface CmUserClosurePageParams {
    ancestorId?: number;
    descendantId?: number;
    distance?: number;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortDesc?: boolean;
  }

  export interface CmUserAncestor {
    avatar: string;
    distance: number;
    nick: string;
    userId: number;
    username: string;
  }

  export interface CmUserDescendant {
    avatar: string;
    distance: number;
    nick: string;
    userId: number;
    username: string;
  }

  export interface CmUserRelationResp {
    ancestors: CmUserAncestor[];
    descendants: CmUserDescendant[];
    directChildren: CmUserDescendant[];
    directParent: CmUserAncestor | null;
  }

  export interface CmBindParentReq {
    parentId: number;
    userId: number;
  }

  export interface CmUnbindParentReq {
    userId: number;
  }
}

export async function getCmUserClosurePage(
  params: CmUserClosureApi.CmUserClosurePageParams,
) {
  return requestClient.get<{
    items: CmUserClosureApi.CmUserClosureRow[];
    total: number;
  }>('/cm/user-closure/page', { params });
}

export async function getCmUserRelation(userId: number) {
  return requestClient.get<CmUserClosureApi.CmUserRelationResp>(
    '/cm/user-closure/relation',
    { params: { userId } },
  );
}

export async function bindParent(data: CmUserClosureApi.CmBindParentReq) {
  return requestClient.post('/cm/user-closure/bind-parent', data);
}

export async function unbindParent(data: CmUserClosureApi.CmUnbindParentReq) {
  return requestClient.post('/cm/user-closure/unbind-parent', data);
}
