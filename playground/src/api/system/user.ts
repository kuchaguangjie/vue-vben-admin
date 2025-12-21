import type { Recordable } from '@vben/types';

import type { CommonType } from '#/api';

import { requestClient } from '#/api/request';

export namespace SystemUserApi {
  export interface SystemUser {
    [key: string]: any;

    id: number;
    nick: string;
    permissions?: string[];
    status: number;
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
 * 获得用户 角色
 */
async function getUserRoles(username: string) {
  return requestClient.get(`/system/user/getUserRoles?username=${username}`);
}

/**
 * 删除用户
 * @param id 用户 ID
 */
async function deleteUser(id: number) {
  return requestClient.delete(`/system/user/${id}`);
}

/**
 * create 前 获取数据.
 */
async function prepareUserForCreate() {
  return requestClient.get(`/system/user/prepareForCreate`);
}

/**
 * update 前 获取数据.
 */
async function prepareUserForUpdate(username: string) {
  return requestClient.get(
    `/system/user/prepareForUpdate?username=${username}`,
  );
}

export {
  createUser,
  deleteUser,
  getUserList,
  getUserRoles,
  prepareUserForCreate,
  prepareUserForUpdate,
  updateUser,
  updateUserStatus,
};
