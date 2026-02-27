import type { UserInfo } from '@vben/types';

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
}

/**
 * 获取用户信息
 */
export async function getUserInfoApi() {
  return requestClient.get<UserInfo>('/user/info');
}

export async function getSysAvatarListApi() {
  return requestClient.get<UserApi.GetSysAvatarListResp>(
    '/user/getSysAvatarList',
  );
}

export async function updateUserBasicInfoApi(data: any) {
  return requestClient.post<UserInfo>('/user/updateBasicInfo', data);
}

export async function updateUserPasswordApi(data: any) {
  return requestClient.post<UserInfo>('/user/updatePassword', data);
}

export async function updateUserAvatarApi(
  avatarType: number,
  avatar: Blob | string,
) {
  const body = {} as Record<string, any> & { file: Blob };
  body.avatarType = avatarType;

  // set avatar
  if (avatarType === 0) {
    // choose system avatar
    body.sysAvatar = avatar as string;
  } else if (avatarType === 1) {
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
