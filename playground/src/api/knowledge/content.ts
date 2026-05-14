import type { Recordable } from '@vben/types';

import type { CommonType } from '#/api';

import { requestClient } from '#/api/request';

export namespace KnowledgeContentApi {
  export interface KnowledgeContent {
    categoryId?: number;
    content: string;
    createdAt: string;
    createdBy: number;
    format: string;
    id: number;
    isPrivate: boolean;
    language: string;
    priority: number;
    publishedAt?: string;
    publishedBy?: number;
    source?: string;
    sourceUrl?: string;
    status: number;
    summary?: string;
    tags: string[];
    tenantId?: number;
    title: string;
    updatedAt?: string;
    updatedBy?: number;
    useCount: number;
    viewCount: number;
  }
}

/**
 * 获取知识库内容分页列表
 */
async function getKnowledgeContentPage(params: Recordable<any>) {
  return requestClient.get<
    CommonType.Page<KnowledgeContentApi.KnowledgeContent>
  >('/knowledge/content/page', { params });
}

/**
 * 创建知识库内容
 */
async function createKnowledgeContent(
  data: Omit<KnowledgeContentApi.KnowledgeContent, 'id'>,
) {
  return requestClient.post('/knowledge/content', data);
}

/**
 * 更新知识库内容
 */
async function updateKnowledgeContent(
  id: string,
  data: Omit<KnowledgeContentApi.KnowledgeContent, 'id'>,
) {
  return requestClient.put(`/knowledge/content/${id}`, data);
}

/**
 * 删除知识库内容
 */
async function deleteKnowledgeContent(id: number) {
  return requestClient.delete(`/knowledge/content/${id}`);
}

/**
 * 知识库内容详情
 */
async function getKnowledgeContentDetail(id: number) {
  return requestClient.get<KnowledgeContentApi.KnowledgeContent>(
    `/knowledge/content/${id}`,
  );
}

export {
  createKnowledgeContent,
  deleteKnowledgeContent,
  getKnowledgeContentDetail,
  getKnowledgeContentPage,
  updateKnowledgeContent,
};
