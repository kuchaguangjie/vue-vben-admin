import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

namespace SearchKnowledgeApi {
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
    skippedCount: number;
    syncedCount: number;
  }

  export interface IndexStats {
    documentCount: number;
    fieldCount: number;
    fieldDistributionSize: number;
    indexName: string;
    isIndexing: boolean;
    isReady: boolean;
    lastDocUpdatedAt: string;
    lastSyncAt: string;
    tenantId: number;
  }
}

// Provide a runtime value for SearchKnowledgeApi
export const SearchKnowledgeApi = {};

/**
 * 搜索知识库
 */
async function searchKnowledge(params: SearchKnowledgeApi.KnowledgeSearchReq) {
  return requestClient.get<SearchKnowledgeApi.KnowledgeSearchResult>(
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
  return requestClient.post<SearchKnowledgeApi.KnowledgeSyncResult>(
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
  return requestClient.post<SearchKnowledgeApi.KnowledgeSyncResult>(
    '/search/index/rebuild',
  );
}

/**
 * 获取索引统计信息
 */
async function getIndexStats() {
  return requestClient.get<SearchKnowledgeApi.IndexStats>(
    '/search/index/stats',
  );
}

export { getIndexStats, rebuildIndex, searchKnowledge, syncAllKnowledge };
