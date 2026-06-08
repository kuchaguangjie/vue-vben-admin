import type { Recordable } from '@vben/types';

import type { CommonType } from '#/api';

import { requestClient } from '#/api/request';

export namespace SystemUserApi {
  export const _ = true;
  export interface SystemUser {
    [key: string]: any;

    deptIds: number[];
    email?: string;
    id: number;
    isBot: boolean;
    nick: string;
    parentId?: number;
    permissions?: string[];
    status: number;
    tenantId: number;
    username: string;
    userType: number;
  }
  export interface UserCore {
    [key: string]: any;

    id: number;
    nick: string;
    tenantId: number;
    username: string;
  }
}

/**
 * 获取用户列表数据
 */
async function getUserList(params: Recordable<any>) {
  return requestClient.get<Array<SystemUserApi.SystemUser>>(
    '/system/user/page',
    { params },
  );
}

async function getUserListWithUserCore(params: Recordable<any>) {
  return requestClient.get<
    CommonType.PageWithUserCore<SystemUserApi.SystemUser>
  >('/system/user/pageWithUserCore', {
    params,
  });
}

/**
 * 创建用户
 * @param data 用户数据
 */
async function createUser(data: Omit<SystemUserApi.SystemUser, 'id'>) {
  return requestClient.post('/system/user', data);
}

/**
 * 更新用户
 * @param id
 * @param data 用户数据
 */
async function updateUser(
  id: number,
  data: Omit<SystemUserApi.SystemUser, 'id'>,
) {
  return requestClient.put(`/system/user/${id}`, data);
}

/**
 * 更新用户状态
 * @param data 用户数据
 */
async function updateUserStatus(data: CommonType.UpdateStatus) {
  return requestClient.post(`/system/user/updateStatus`, data);
}

/**
 * 删除用户
 * @param id 用户 ID
 */
async function deleteUser(id: number) {
  return requestClient.delete(`/system/user/${id}`);
}

/**
 * 用户详情
 * @param id 用户 ID
 */
async function getDetailUser(id: number) {
  return requestClient.get(`/system/user/${id}`);
}

/**
 * create 前 获取数据.
 */
async function preCreateUser() {
  return requestClient.get(`/system/user/preCreate`);
}

/**
 * update 前 获取数据.
 */
async function preUpdateUser(userId: number) {
  return requestClient.get(`/system/user/preUpdate?id=${userId}`);
}

export {
  createUser,
  deleteUser,
  getDetailUser,
  getUserList,
  getUserListWithUserCore,
  preCreateUser,
  preUpdateUser,
  updateUser,
  updateUserStatus,
};
