import type { Recordable } from '@vben/types';

import type { CommonType } from '#/api';

import { requestClient } from '#/api/request';

export namespace SystemAiProviderApi {
  export interface AiProvider {
    apiKey: string;
    baseUrl: string;
    code: string;
    config?: Recordable<any>;
    createdAt?: string;
    createdBy?: number;
    id: number;
    name: string;
    status: number;
    tenantId?: number;
    timeout: number;
    updatedAt?: string;
    updatedBy?: number;
    version?: number;
  }

  export interface AiModel {
    capabilities?: string[];
    code: string;
    config?: Recordable<any>;
    contextWindow?: number;
    createdAt?: string;
    createdBy?: number;
    description?: string;
    id: number;
    inputPrice?: number;
    isCustom?: boolean;
    maxOutput?: number;
    name: string;
    outputPrice?: number;
    status: number;
    tenantId?: number;
    updatedAt?: string;
    updatedBy?: number;
    version?: number;
  }

  export interface AiProviderModel {
    config?: Recordable<any>;
    createdAt?: string;
    createdBy?: number;
    id: number;
    model?: AiModel;
    modelId: number;
    priority?: number;
    providerId: number;
    providerModelCode: string;
    status: number;
    tenantId?: number;
    updatedAt?: string;
    updatedBy?: number;
  }

  export interface ProviderWithModels {
    models: AiProviderModel[];
    provider: AiProvider;
  }
}

/**
 * 获取 AI 供应商列表（分页）
 */
async function getAiProviderPage(params: Recordable<any>) {
  return requestClient.get<CommonType.Page<SystemAiProviderApi.AiProvider>>(
    '/ai/provider/page',
    { params },
  );
}

/**
 * 获取 AI 供应商详情
 */
async function getAiProviderDetail(id: number) {
  return requestClient.get<SystemAiProviderApi.AiProvider>(
    `/ai/provider/${id}`,
  );
}

/**
 * 创建 AI 供应商
 */
async function createAiProvider(
  data: Omit<SystemAiProviderApi.AiProvider, 'id'>,
) {
  return requestClient.post('/ai/provider', data);
}

/**
 * 更新 AI 供应商
 */
async function updateAiProvider(
  id: number,
  data: Omit<SystemAiProviderApi.AiProvider, 'id'>,
) {
  return requestClient.put(`/ai/provider/${id}`, data);
}

/**
 * 删除 AI 供应商
 */
async function deleteAiProvider(id: number) {
  return requestClient.delete(`/ai/provider/${id}`);
}

/**
 * 获取供应商关联的模型列表
 */
async function getProviderModels(providerId: number) {
  return requestClient.get<SystemAiProviderApi.ProviderWithModels>(
    `/ai/provider/${providerId}/models`,
  );
}

/**
 * 绑定模型到供应商
 */
async function bindProviderModel(
  providerId: number,
  data: Omit<SystemAiProviderApi.AiProviderModel, 'id' | 'providerId'>,
) {
  return requestClient.post(`/ai/provider/${providerId}/models`, data);
}

/**
 * 批量绑定模型到供应商
 */
async function batchBindProviderModels(providerId: number, modelIds: number[]) {
  return requestClient.post(`/ai/provider/${providerId}/models/batch`, {
    modelIds,
  });
}

/**
 * 更新供应商-模型关联
 */
async function updateProviderModel(
  providerId: number,
  modelId: number,
  data: Partial<SystemAiProviderApi.AiProviderModel>,
) {
  return requestClient.put(
    `/ai/provider/${providerId}/models/${modelId}`,
    data,
  );
}

/**
 * 删除供应商-模型关联
 */
async function deleteProviderModel(providerId: number, modelId: number) {
  return requestClient.delete(`/ai/provider/${providerId}/models/${modelId}`);
}

/**
 * 获取 AI 模型列表（分页）
 */
async function getAiModelPage(params: Recordable<any>) {
  return requestClient.get<CommonType.Page<SystemAiProviderApi.AiModel>>(
    '/ai/model/page',
    { params },
  );
}

/**
 * 获取可用的 AI 模型列表
 */
async function getAvailableModels(params?: Recordable<any>) {
  return requestClient.get<SystemAiProviderApi.AiModel[]>(
    '/ai/model/available',
    { params },
  );
}

/**
 * 获取 AI 模型详情
 */
async function getAiModelDetail(id: number) {
  return requestClient.get<SystemAiProviderApi.AiModel>(`/ai/model/${id}`);
}

/**
 * 创建 AI 模型
 */
async function createAiModel(data: Omit<SystemAiProviderApi.AiModel, 'id'>) {
  return requestClient.post('/ai/model', data);
}

/**
 * 更新 AI 模型
 */
async function updateAiModel(
  id: number,
  data: Omit<SystemAiProviderApi.AiModel, 'id'>,
) {
  return requestClient.put(`/ai/model/${id}`, data);
}

/**
 * 删除 AI 模型
 */
async function deleteAiModel(id: number) {
  return requestClient.delete(`/ai/model/${id}`);
}

export namespace SystemAiChatStatApi {
  export interface ChatStatOverviewResp {
    activeUsers: number;
    conversationTrend: TrendItem[];
    modelDistribution: ModelDistributionItem[];
    referenceCount: number;
    referencedReplies: number;
    todayConversations: number;
    todayMessages: number;
    todayReferenceCount: number;
    todayReferencedReplies: number;
    todayTokensUsed: number;
    tokenTrend: TrendItem[];
    totalConversations: number;
    totalMessages: number;
    totalTokensUsed: number;
  }

  export interface ModelDistributionItem {
    conversationCount: number;
    messageCount: number;
    modelCode: string;
    modelName: string;
    tokenUsed: number;
  }

  export interface TrendItem {
    count: number;
    date: string;
  }

  export interface ChatStatFilterReq {
    endDate?: string;
    modelCode?: string;
    startDate?: string;
    tenantId?: number;
    userId?: number;
  }
}

async function getChatStatOverview(
  params?: SystemAiChatStatApi.ChatStatFilterReq,
) {
  return requestClient.get<SystemAiChatStatApi.ChatStatOverviewResp>(
    '/ai/stat/overview',
    { params },
  );
}

export {
  batchBindProviderModels,
  bindProviderModel,
  createAiModel,
  createAiProvider,
  deleteAiModel,
  deleteAiProvider,
  deleteProviderModel,
  getAiModelDetail,
  getAiModelPage,
  getAiProviderDetail,
  getAiProviderPage,
  getAvailableModels,
  getChatStatOverview,
  getProviderModels,
  updateAiModel,
  updateAiProvider,
  updateProviderModel,
};
