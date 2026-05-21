import type { Recordable } from '@vben/types';

import type { CommonType } from '#/api/common_type';

import { requestClient } from '#/api/request';

export namespace SystemApiKeyApi {
  export interface ApiKey {
    createdAt: string;
    createdBy: number;
    expiresAt?: string;
    id: number;
    isBot: boolean;
    lastUsedAt?: string;
    name: string;
    remark?: string;
    status: number;
    tenantId: number;
    userId: number;
    username: string;
  }

  export interface BotUser {
    id: number;
    nick: string;
    username: string;
  }

  export interface ApiKeyCreateReq {
    expiresAt?: number; // 秒级时间戳
    expiryType: '1d' | '1h' | '1w' | '1y' | '99y' | 'custom';
    name: string;
    userId: number;
  }

  export interface ApiKeyCreateResp {
    expiresAt?: string;
    expiryType: string;
    id: number;
    key: string;
    name: string;
    userId: number;
  }

  export interface ApiKeyUpdateReq {
    name?: string;
    expiryType?: '1d' | '1h' | '1w' | '1y' | '99y' | 'custom';
    expiresAt?: number;
  }
}

/**
 * 分页查询机器人 API Key 列表
 */
async function getApiKeyPage(params: Recordable<any>) {
  return requestClient.get<CommonType.Page<SystemApiKeyApi.ApiKey>>(
    '/system/api-key/page',
    { params },
  );
}

/**
 * 获取机器人 API Key 详情
 */
async function getApiKeyDetail(id: number) {
  return requestClient.get<SystemApiKeyApi.ApiKey>(`/system/api-key/${id}`);
}

/**
 * 为机器人创建 API Key
 */
async function createApiKey(data: SystemApiKeyApi.ApiKeyCreateReq) {
  return requestClient.post<SystemApiKeyApi.ApiKeyCreateResp>(
    '/system/api-key',
    data,
  );
}

/**
 * 删除机器人 API Key
 */
async function deleteApiKey(id: number) {
  return requestClient.delete(`/system/api-key/${id}`);
}

/**
 * 更新机器人 API Key 状态
 */
async function updateApiKeyStatus(data: CommonType.UpdateStatus) {
  return requestClient.post(`/system/api-key/updateStatus`, data);
}

/**
 * 更新机器人 API Key
 */
async function updateApiKey(
  id: number,
  data: SystemApiKeyApi.ApiKeyUpdateReq,
) {
  return requestClient.put(`/system/api-key/${id}`, data);
}

/**
 * 获取机器人用户列表
 */
async function getBotUserList() {
  return requestClient.get<SystemApiKeyApi.BotUser[]>(
    '/system/api-key/bot-users',
  );
}

export {
  createApiKey,
  deleteApiKey,
  getApiKeyDetail,
  getApiKeyPage,
  getBotUserList,
  updateApiKey,
  updateApiKeyStatus,
};
