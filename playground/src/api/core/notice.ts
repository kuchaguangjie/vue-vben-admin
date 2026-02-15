import type { Recordable } from '@vben/types';

import type { SystemNoticeApi } from '#/api';

import { requestClient } from '#/api/request';

async function getNoticePage(params: Recordable<any>) {
  return requestClient.get<Array<SystemNoticeApi.SystemNotice>>(
    '/notice/page',
    { params },
  );
}
async function getNoticeCategoryList() {
  return requestClient.get<Array<string>>('/notice/categoryList');
}
async function getNoticeDetail(id: number) {
  return requestClient.get(`/notice/${id}`);
}
async function readNotice(id: number) {
  return requestClient.post(`/notice/read/${id}`);
}

export { getNoticeCategoryList, getNoticeDetail, getNoticePage, readNotice };
