import type { Recordable } from '@vben-core/typings';

import { requestClient } from '#/api/request';
import { type CommonType } from '#/api';

export namespace SystemDeptApi {
  export interface SystemDept {
    [key: string]: any;

    children?: SystemDept[];
    id: number;
    name: string;
    remark?: string;
    roleCodes: string[];
    status: 0 | 1;
  }
}

/**
 * 获取部门列表数据
 */
async function getDeptTree(params: Recordable<any>) {
  return requestClient.get<Array<SystemDeptApi.SystemDept>>(
    '/system/dept/tree',
    { params },
  );
}
async function getDeptTreeWithUserCore(params: Recordable<any>) {
  return requestClient.get<
    CommonType.TreeWithUserCore<SystemDeptApi.SystemDept>
  >('/system/dept/treeWithUserCore', {
    params,
  });
}

/**
 * 创建部门
 * @param data 部门数据
 */
async function createDept(
  data: Omit<SystemDeptApi.SystemDept, 'children' | 'id'>,
) {
  return requestClient.post('/system/dept', data);
}

/**
 * 更新部门
 *
 * @param id 部门 ID
 * @param data 部门数据
 */
async function updateDept(
  id: number,
  data: Omit<SystemDeptApi.SystemDept, 'children' | 'id'>,
) {
  return requestClient.put(`/system/dept/${id}`, data);
}

/**
 * 删除部门
 * @param id 部门 ID
 */
async function deleteDept(id: number) {
  return requestClient.delete(`/system/dept/${id}`);
}

/**
 * pre create
 */
async function preCreateDept() {
  return requestClient.get(`/system/dept/preCreate`);
}

/**
 * pre update
 */
async function preUpdateDept(id: number) {
  return requestClient.get(`/system/dept/preUpdate?id=${id}`);
}

/**
 * 部门 详情
 * @param id 角色 ID
 */
async function getDetailDept(id: number) {
  return requestClient.get(`/system/dept/${id}`);
}

export {
  createDept,
  deleteDept,
  getDeptTree,
  getDeptTreeWithUserCore,
  getDetailDept,
  preCreateDept,
  preUpdateDept,
  updateDept,
};
