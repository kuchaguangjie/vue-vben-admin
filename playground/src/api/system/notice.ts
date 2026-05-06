import type { Recordable } from '@vben/types';

import type { CommonType } from '#/api';

import { requestClient } from '#/api/request';

export namespace SystemNoticeApi {
  export interface SystemNoticeCategory {
    id: number;
    name: string;
  }

  export const NoticePushScope = {
    Platform: 1,
    All: 2,
    Tenant: 3,
  } as const;

  export interface SystemNotice {
    categoryId: number;
    categoryList: SystemNoticeCategory[]; // 分类列表
    data: string;
    id: number;
    push: boolean;
    pushScope: number;
    status: number;
    tags: string[];
    targetTenantId: number;
    tenantId: number;
    title: string;
    totalUnread: number; // 总未读数量 (for user)
    version: number;
  }
}

async function getNoticeListWithUserCore(params: Recordable<any>) {
  return requestClient.get<
    CommonType.PageWithUserCore<SystemNoticeApi.SystemNotice>
  >('/system/notice/pageWithUserCore', {
    params,
  });
}

/**
 * 创建公告
 * @param data 公告数据
 */
async function createNotice(data: Omit<SystemNoticeApi.SystemNotice, 'id'>) {
  return requestClient.post('/system/notice', data);
}

/**
 * 更新公告
 *
 * @param id 公告 ID
 * @param data 公告数据
 */
async function updateNotice(
  id: string,
  data: Omit<SystemNoticeApi.SystemNotice, 'id'>,
) {
  return requestClient.put(`/system/notice/${id}`, data);
}

/**
 * 更新公告状态
 * @param data 公告数据
 */
async function updateNoticeStatus(data: CommonType.UpdateStatus) {
  return requestClient.post(`/system/notice/updateStatus`, data);
}

/**
 * 删除公告
 * @param id 公告 ID
 */
async function deleteNotice(id: number) {
  return requestClient.delete(`/system/notice/${id}`);
}

/**
 * 公告 详情
 * @param id 公告 ID
 * @param tenantId 租户 ID（可选）
 */
async function getNoticeDetail(id: number, tenantId?: number) {
  return requestClient.get(`/system/notice/${id}`, {
    params: tenantId ? { tenantId } : undefined,
  });
}

export {
  createNotice,
  deleteNotice,
  getNoticeDetail,
  getNoticeListWithUserCore,
  updateNotice,
  updateNoticeStatus,
};
