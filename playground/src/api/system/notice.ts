import type { Recordable } from '@vben/types';

import type { CommonType } from '#/api';

import { requestClient } from '#/api/request';

export namespace SystemNoticeApi {
  export interface SystemNoticeCategory {
    id: number;
    name: string;
  }

  export interface SystemNotice {
    categoryId: number;
    categoryList: SystemNoticeCategory[]; // 分类列表
    data: string;
    id: number;
    push: boolean;
    status: number;
    tags: string[];
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
 */
async function getNoticeDetail(id: number) {
  return requestClient.get(`/system/notice/${id}`);
}

export {
  createNotice,
  deleteNotice,
  getNoticeDetail,
  getNoticeListWithUserCore,
  updateNotice,
  updateNoticeStatus,
};
