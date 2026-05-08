import type { Recordable } from '@vben/types';

import type { CommonType } from '#/api';

import { requestClient } from '#/api/request';

export namespace SystemNoticeApi {
  export interface SystemNoticeCategory {
    id: number;
    name: string;
    tenantId?: number;
  }

  export interface SystemNotice {
    categoryId: number;
    categoryList: SystemNoticeCategory[]; // 分类列表
    data: string;
    id: number;
    push: boolean;
    status: number;
    tags: string[];
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
 */
async function getNoticeDetail(id: number) {
  return requestClient.get(`/system/notice/${id}`);
}

// ==================== 公告分类管理 ====================

/**
 * 获取公告分类分页列表
 */
async function getNoticeCategoryPage(params: Recordable<any>) {
  return requestClient.get<
    CommonType.Page<SystemNoticeApi.SystemNoticeCategory>
  >('/system/noticeCategory/page', { params });
}

/**
 * 创建公告分类
 */
async function createNoticeCategory(
  data: Omit<SystemNoticeApi.SystemNoticeCategory, 'id'>,
) {
  return requestClient.post('/system/noticeCategory', data);
}

/**
 * 更新公告分类
 */
async function updateNoticeCategory(
  id: string,
  data: Omit<SystemNoticeApi.SystemNoticeCategory, 'id'>,
) {
  return requestClient.put(`/system/noticeCategory/${id}`, data);
}

/**
 * 删除公告分类
 */
async function deleteNoticeCategory(id: number) {
  return requestClient.delete(`/system/noticeCategory/${id}`);
}

/**
 * 公告分类 详情
 */
async function getNoticeCategoryDetail(id: number) {
  return requestClient.get(`/system/noticeCategory/${id}`);
}

export {
  createNotice,
  createNoticeCategory,
  deleteNotice,
  deleteNoticeCategory,
  getNoticeCategoryDetail,
  getNoticeCategoryPage,
  getNoticeDetail,
  getNoticeListWithUserCore,
  updateNotice,
  updateNoticeCategory,
  updateNoticeStatus,
};
