import type { Recordable } from '@vben/types';

import type { SystemNoticeApi } from '#/api';

import { requestClient } from '#/api/request';

async function getNoticePageForUser(params: Recordable<any>) {
  return requestClient.get<Array<SystemNoticeApi.SystemNotice>>(
    '/notice/page',
    { params },
  );
}
async function countUnreadNotice() {
  return requestClient.get<any>('/notice/countUnread');
}
async function getNoticeDetailForUser(id: number) {
  return requestClient.get(`/notice/${id}`);
}
async function readNotice(id: number) {
  return requestClient.post(`/notice/read/${id}`);
}

export {
  countUnreadNotice,
  getNoticeDetailForUser,
  getNoticePageForUser,
  readNotice,
};
