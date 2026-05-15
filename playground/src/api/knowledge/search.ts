import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace SearchApi {
  export interface KnowledgeSearchResult {
    hits: KnowledgeSearchHit[];
    page: number;
    pageSize: number;
    processingTimeMs: number;
    total: number;
  }

  export interface KnowledgeSearchHit {
    _formatted?: Recordable<string>;
    categoryId: number;
    categoryName: string;
    createdAt: string;
    format: string;
    id: number;
    isPrivate: boolean;
    language: string;
    priority: number;
    publishedAt: string;
    status: number;
    summary: string;
    tags: string[];
    tenantId: number;
    title: string;
    updatedAt: string;
    viewCount: number;
  }

  export interface KnowledgeSearchReq {
    categoryId?: number;
    format?: string;
    highlight?: boolean;
    isPrivate?: boolean;
    language?: string;
    page?: number;
    pageSize?: number;
    q: string;
    sortBy?: string;
    sortDesc?: boolean;
    status?: number;
    tags?: string[];
  }

  export interface KnowledgeSyncResult {
    failedCount: number;
    failedIds: number[];
    syncedCount: number;
  }
}

/**
 * 搜索知识库
 */
async function searchKnowledge(params: SearchApi.KnowledgeSearchReq) {
  return requestClient.get<SearchApi.KnowledgeSearchResult>(
    '/search/knowledge',
    {
      params,
    },
  );
}

/**
 * 全量同步知识库到索引
 */
async function syncAllKnowledge(categoryId?: number) {
  return requestClient.post<SearchApi.KnowledgeSyncResult>(
    '/search/knowledge/sync/all',
    {
      categoryId,
    },
  );
}

/**
 * 重建索引（删除后重新创建并全量同步）
 */
async function rebuildIndex() {
  return requestClient.post<SearchApi.KnowledgeSyncResult>(
    '/search/index/rebuild',
  );
}

export { rebuildIndex, searchKnowledge, syncAllKnowledge };
