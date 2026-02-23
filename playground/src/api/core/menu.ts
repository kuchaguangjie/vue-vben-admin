import type { CommonType, SystemMenuApi } from '#/api';

import { getTreeAsRoots } from '#/api';
import { requestClient } from '#/api/request';

/**
 * 获取用户所有菜单
 */
export async function getAllMenusApi() {
  return requestClient.get<CommonType.Tree<SystemMenuApi.SystemMenu>>(
    '/menu/all',
  );
}
export async function getAllMenusApiRoots() {
  return getTreeAsRoots<SystemMenuApi.SystemMenu>(getAllMenusApi);
}
