import type { Recordable } from '@vben/types';

import type { CommonType } from '#/api';

import { requestClient } from '#/api/request';

export namespace KnowledgeCategoryApi {
  export interface KnowledgeCategory {
    code: string;
    createdAt: string;
    createdBy: number;
    description: string;
    id: number;
    name: string;
    sortOrder: number;
    status: number;
    tenantId?: number;
    updatedAt: string;
    updatedBy: number;
  }
}

/**
 * 获取知识库分类分页列表
 */
async function getKnowledgeCategoryPage(params: Recordable<any>) {
  return requestClient.get<
    CommonType.Page<KnowledgeCategoryApi.KnowledgeCategory>
  >('/knowledge/category/page', { params });
}

/**
 * 获取知识库分类列表
 */
async function getKnowledgeCategoryList(params?: Recordable<any>) {
  return requestClient.get<KnowledgeCategoryApi.KnowledgeCategory[]>(
    '/knowledge/category/list',
    { params },
  );
}

/**
 * 创建知识库分类
 */
async function createKnowledgeCategory(
  data: Omit<KnowledgeCategoryApi.KnowledgeCategory, 'id'>,
) {
  return requestClient.post('/knowledge/category', data);
}

/**
 * 更新知识库分类
 */
async function updateKnowledgeCategory(
  id: string,
  data: Omit<KnowledgeCategoryApi.KnowledgeCategory, 'id'>,
) {
  return requestClient.put(`/knowledge/category/${id}`, data);
}

/**
 * 删除知识库分类
 */
async function deleteKnowledgeCategory(id: number) {
  return requestClient.delete(`/knowledge/category/${id}`);
}

/**
 * 知识库分类详情
 */
async function getKnowledgeCategoryDetail(id: number) {
  return requestClient.get<KnowledgeCategoryApi.KnowledgeCategory>(
    `/knowledge/category/${id}`,
  );
}

export {
  createKnowledgeCategory,
  deleteKnowledgeCategory,
  getKnowledgeCategoryDetail,
  getKnowledgeCategoryList,
  getKnowledgeCategoryPage,
  updateKnowledgeCategory,
};
