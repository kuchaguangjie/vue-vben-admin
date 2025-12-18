import type { Recordable } from '@vben/types';

import type { CommonType } from '#/api';

import { requestClient } from '#/api/request';

export namespace SystemRoleApi {
  export interface SystemRole {
    [key: string]: any;

    code: string;
    id: number;
    name: string;
    permissions: string[];
    remark?: string;
    sort: number;
    status: number;
  }
}

/**
 * 获取角色列表数据, 带有 menu 信息;
 */
async function getRoleListWithMenu(params: Recordable<any>) {
  return requestClient.get<Array<SystemRoleApi.SystemRole>>(
    '/system/role/pageWithMenu',
    { params },
  );
}

/**
 * 获取角色列表数据, 无 menu 信息;
 */
async function getRoleAll() {
  return requestClient.get<Array<SystemRoleApi.SystemRole>>('/system/role/all');
}

/**
 * 创建角色
 * @param data 角色数据
 */
async function createRole(data: Omit<SystemRoleApi.SystemRole, 'id'>) {
  return requestClient.post('/system/role', data);
}

/**
 * 更新角色
 *
 * @param id 角色 ID
 * @param data 角色数据
 */
async function updateRole(
  id: string,
  data: Omit<SystemRoleApi.SystemRole, 'id'>,
) {
  return requestClient.put(`/system/role/${id}`, data);
}

/**
 * 更新角色状态
 * @param data 角色数据
 */
async function updateRoleStatus(data: CommonType.UpdateStatus) {
  return requestClient.post(`/system/role/updateStatus`, data);
}

/**
 * 删除角色
 * @param id 角色 ID
 */
async function deleteRole(id: number) {
  return requestClient.delete(`/system/role/${id}`);
}

/**
 * 获得角色 已继承的角色
 */
async function getInheritRoles(code: string) {
  return requestClient.get(`/system/role/getInheritRoles?code=${code}`);
}

/**
 * 获得角色 的 api
 */
async function getRoleApis(code: string) {
  return requestClient.get(`/system/role/getRoleApis?code=${code}`);
}

export {
  createRole,
  deleteRole,
  getInheritRoles,
  getRoleAll,
  getRoleApis,
  getRoleListWithMenu,
  updateRole,
  updateRoleStatus,
};
