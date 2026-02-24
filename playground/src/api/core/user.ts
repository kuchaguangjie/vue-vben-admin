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
    avatarUrl: string;
  }
}

/**
 * 获取用户信息
 */
export async function getUserInfoApi() {
  return requestClient.get<UserInfo>('/user/info');
}

export async function updateUserBasicInfoApi(data: any) {
  return requestClient.post<UserInfo>('/user/updateBasicInfo', data);
}

export async function updateUserPasswordApi(data: any) {
  return requestClient.post<UserInfo>('/user/updatePassword', data);
}

export async function updateUserAvatarApi(file: Blob) {
  return requestClient.upload<UserApi.AvatarInfo>('/user/updateAvatar', {
    file,
  });
}

// get all user sessions
export async function getUserSessionsApi() {
  return requestClient.get<Array<UserApi.UserSession>>('/user/sessions');
}

// delete 1 user session
export async function deleteUserSessionApi(sid: string) {
  return requestClient.delete(`/user/session?sid=${sid}`);
}
