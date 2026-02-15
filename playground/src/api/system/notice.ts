import type { Recordable } from '@vben/types';

import type { CommonType } from '#/api';

import { requestClient } from '#/api/request';

export namespace SystemNoticeApi {
  export interface SystemNotice {
    [key: string]: any;

    category: string;
    data: string;
    id: number;
    push: boolean;
    status: number;
    tags: string[];
    title: string;
    version: number;
  }
}

/**
 * 获取公告列表数据
 */
async function getNoticeList(params: Recordable<any>) {
  return requestClient.get<Array<SystemNoticeApi.SystemNotice>>(
    '/system/notice/page',
    { params },
  );
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
 * create 公告前 获取数据.
 */
async function preCreateNotice() {
  return requestClient.get(`/system/notice/preCreate`);
}

/**
 * update 公告前 获取数据.
 */
async function preUpdateNotice(noticeId: number) {
  return requestClient.get(`/system/notice/preUpdate?id=${noticeId}`);
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
  getNoticeList,
  preCreateNotice,
  preUpdateNotice,
  updateNotice,
  updateNoticeStatus,
};
