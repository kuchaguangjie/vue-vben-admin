import type { Recordable } from '@vben/types';

import type { CommonType } from '#/api';

import { requestClient } from '#/api/request';

export namespace SystemTenantApi {
  export interface SystemTenant {
    [key: string]: any;

    code: string;
    createdAt?: string;
    createdBy?: number;
    id: number;
    name: string;
    remark?: string;
    status: number;
    updatedAt?: string;
    updatedBy?: number;
    version?: number;
  }
}

async function getTenantList(params: Recordable<any>) {
  return requestClient.get<CommonType.Page<SystemTenantApi.SystemTenant>>(
    '/system/tenant/page',
    {
      params,
    },
  );
}

async function getTenantAll() {
  return requestClient.get<Array<SystemTenantApi.SystemTenant>>(
    '/system/tenant/all',
  );
}

async function createTenant(data: Omit<SystemTenantApi.SystemTenant, 'id'>) {
  return requestClient.post('/system/tenant', data);
}

async function updateTenant(
  id: string,
  data: Omit<SystemTenantApi.SystemTenant, 'code' | 'id'>,
) {
  return requestClient.put(`/system/tenant/${id}`, data);
}

async function updateTenantStatus(data: CommonType.UpdateStatus) {
  return requestClient.post(`/system/tenant/updateStatus`, data);
}

async function getDetailTenant(id: number) {
  return requestClient.get(`/system/tenant/${id}`);
}

export {
  createTenant,
  getDetailTenant,
  getTenantAll,
  getTenantList,
  updateTenant,
  updateTenantStatus,
};
