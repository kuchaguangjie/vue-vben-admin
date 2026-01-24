import type { CustomUserInfo, UserInfo } from '@vben/types';

import { requestClient } from '#/api/request';

/**
 * 获取用户信息
 */
export async function getUserInfoApi() {
  return requestClient.get<UserInfo>('/user/info');
}

export async function updateUserBasicInfoApi(data: any) {
  return requestClient.post<CustomUserInfo>('/user/updateBasicInfo', data);
}
