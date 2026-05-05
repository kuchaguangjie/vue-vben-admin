import type { Recordable } from '@vben/types';

import type { CommonType } from '#/api';

import { requestClient } from '#/api/request';

export namespace SystemTenantApi {
  export const _ = true;
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

  export interface CreateAndInitTenantReq {
    adminEmail: string;
    adminNick: string;
    adminPassword: string;
    adminUsername: string;
    code: string;
    name: string;
    remark?: string;
    status: number;
    templateCode?: string;
    templateId?: number;
  }

  export interface CreateAndInitTenantResp {
    adminUserId: number;
    adminUsername: string;
    tenantId: number;
  }

  export interface TenantTemplateSimple {
    code: string;
    description?: string;
    id: number;
    name: string;
    sortOrder: number;
    status: number;
  }

  export interface TenantTemplateDetail {
    apiPerms: TenantTemplateApiPerm[];
    code: string;
    depts: TenantTemplateDept[];
    description?: string;
    id: number;
    name: string;
    roleMenus: TenantTemplateRoleMenu[];
    roles: TenantTemplateRole[];
    sortOrder: number;
    status: number;
  }

  export interface TenantTemplateRole {
    code: string;
    dataScope: number;
    description?: string;
    id: number;
    isDefault: number;
    name: string;
    sortOrder: number;
    templateId: number;
  }

  export interface TenantTemplateDept {
    id: number;
    name: string;
    parentId: number;
    sortOrder: number;
    status: number;
    templateId: number;
  }

  export interface TenantTemplateRoleMenu {
    id: number;
    menuPath: string;
    roleTemplateCode: string;
    templateId: number;
  }

  export interface TenantTemplateApiPerm {
    apiMethod: string;
    apiPath: string;
    id: number;
    roleTemplateCode: string;
    templateId: number;
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

async function createAndInitTenant(
  data: SystemTenantApi.CreateAndInitTenantReq,
) {
  return requestClient.post<SystemTenantApi.CreateAndInitTenantResp>(
    '/system/tenant/createAndInit',
    data,
  );
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

async function getTenantTemplateList() {
  return requestClient.get<Array<SystemTenantApi.TenantTemplateSimple>>(
    '/system/tenant/template/list',
  );
}

async function getTenantTemplateDetail(params: { code?: string; id?: number }) {
  return requestClient.get<SystemTenantApi.TenantTemplateDetail>(
    '/system/tenant/template/detail',
    { params },
  );
}

export {
  createAndInitTenant,
  createTenant,
  getDetailTenant,
  getTenantAll,
  getTenantList,
  getTenantTemplateDetail,
  getTenantTemplateList,
  updateTenant,
  updateTenantStatus,
};
