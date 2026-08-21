import type { CommonType, SystemMenuApi } from '#/api';

import { queryOptions } from '@tanstack/vue-query';

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

/**
 * 全部菜单（原始 tree）queryOptions 工厂
 *
 * 全局只读，登录后由路由守卫拉取一次；菜单结构变更少，缓存 5min。
 * 变更（菜单 CRUD）后应 `queryClient.invalidateQueries({ queryKey: ['menus'] })`。
 */
export function allMenusQueryOptions() {
  return queryOptions({
    queryFn: () => getAllMenusApi(),
    queryKey: ['menus', 'all'] as const,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * 全部菜单（roots 数组形式）queryOptions 工厂
 *
 * router/access.ts、examples/form/basic.vue 的 ApiSelect/ApiTreeSelect 共享。
 * queryKey 与 allMenusQueryOptions 区分，避免被误命中导致数据形状不符。
 */
export function allMenusRootsQueryOptions() {
  return queryOptions({
    queryFn: () => getAllMenusApiRoots(),
    queryKey: ['menus', 'roots'] as const,
    staleTime: 5 * 60 * 1000,
  });
}
