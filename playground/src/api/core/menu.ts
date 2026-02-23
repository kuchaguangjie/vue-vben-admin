import type { RouteRecordStringComponent } from '@vben/types';

import { getTreeAsRoots } from '#/api';
import { requestClient } from '#/api/request';

/**
 * 获取用户所有菜单
 */
export async function getAllMenusApi() {
  return requestClient.get<RouteRecordStringComponent[]>('/menu/all');
}
export async function getAllMenusApiRoots() {
  return getTreeAsRoots(getAllMenusApi);
}
