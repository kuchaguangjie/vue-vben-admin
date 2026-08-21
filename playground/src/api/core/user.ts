import type { UserInfo } from '@vben/types';

import { queryOptions } from '@tanstack/vue-query';

import { requestClient } from '#/api/request';

export namespace UserApi {
  export interface UserSession {
    browser: string;
    city?: string;
    cityCn?: string;
    createdAt: string;
    device: string;
    ip: string;
    isCurrent: boolean;
    os: string;
    sid: string;
  }
  export interface AvatarInfo {
    avatar: string;
  }
  export interface AvatarPreviewItem {
    relativePath: string;
    url: string;
  }
  export interface GetSysAvatarListResp {
    avatarList: AvatarPreviewItem[];
  }
  export enum AvatarUpdateType {
    /** 系统预设头像 */
    SYSTEM = 0,
    /** 用户手动上传 */
    UPLOAD = 1,
  }
}

/**
 * 获取用户信息
 */
export async function getUserInfoApi() {
  return requestClient.get<UserInfo>('/user/info');
}

/**
 * 用户信息 queryOptions 工厂
 *
 * 全局只读服务器数据：登录后多处共享，建议缓存 30s 避免短时间重复拉取。
 * 变更点（如 profile 修改资料后）通过 `queryClient.invalidateQueries` 失效。
 */
export function userInfoQueryOptions() {
  return queryOptions({
    queryFn: () => getUserInfoApi(),
    queryKey: ['user', 'info'] as const,
    staleTime: 30_000,
  });
}

export async function getSysAvatarListApi() {
  return requestClient.get<UserApi.GetSysAvatarListResp>(
    '/user/getSysAvatarList',
  );
}

/**
 * 系统预设头像列表 queryOptions 工厂
 *
 * 全局只读、变更极少，长缓存即可。
 */
export function sysAvatarListQueryOptions() {
  return queryOptions({
    queryFn: () => getSysAvatarListApi(),
    queryKey: ['user', 'sysAvatarList'] as const,
    staleTime: 10 * 60 * 1000,
  });
}

export async function updateUserBasicInfoApi(data: any) {
  return requestClient.post<UserInfo>('/user/updateBasicInfo', data);
}

export async function updateUserPasswordApi(data: any) {
  return requestClient.post<UserInfo>('/user/updatePassword', data);
}

export async function updateUserAvatarApi(
  avatarType: UserApi.AvatarUpdateType,
  avatar: Blob | string,
) {
  const body = {} as Record<string, any> & { file: Blob };
  body.avatarType = avatarType;

  // set avatar
  if (avatarType === UserApi.AvatarUpdateType.SYSTEM) {
    // choose system avatar
    body.sysAvatar = avatar as string;
  } else if (avatarType === UserApi.AvatarUpdateType.UPLOAD) {
    // user upload
    body.file = avatar as Blob;
  } else {
    throw new Error(`invalid avatar type: ${avatarType}`);
  }

  return requestClient.upload<UserApi.AvatarInfo>('/user/updateAvatar', body);
}

// get all user sessions
export async function getUserSessionsApi() {
  return requestClient.get<Array<UserApi.UserSession>>('/user/sessions');
}

// delete 1 user session
export async function deleteUserSessionApi(sid: string) {
  return requestClient.delete(`/user/session?sid=${sid}`);
}
