import type { Recordable } from '@vben/types';

import type { CommonType } from '#/api';

import { requestClient } from '#/api/request';

export namespace SystemApiKeyApi {
  export interface ApiKey {
    id: number;
    tenantId: number;
    userId: number;
    username: string;
    isBot: boolean;
    name: string;
    expiresAt?: string;
    lastUsedAt?: string;
    status: number;
    remark?: string;
    createdAt: string;
    createdBy: number;
  }

  export interface BotUser {
    id: number;
    username: string;
    nick: string;
  }

  export interface ApiKeyCreateReq {
    userId: number;
    name: string;
    expiryType: 'custom' | '1h' | '1d' | '1w' | '1y' | '99y';
    expiresAt?: number; // 秒级时间戳
  }

  export interface ApiKeyCreateResp {
    id: number;
    key: string;
    name: string;
    userId: number;
    expiryType: string;
    expiresAt?: string;
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
async function updateApiKeyStatus(data: { id: number; status: number }) {
  return requestClient.put(`/system/api-key/${data.id}/status`, { status: data.status });
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
  getBotUserList,
  getApiKeyDetail,
  getApiKeyPage,
  updateApiKeyStatus,
};
