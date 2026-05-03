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

  export interface CreateAndInitTenantReq {
    name: string;
    code: string;
    status: number;
    remark?: string;
    adminUsername: string;
    adminPassword: string;
    adminEmail: string;
    adminNick: string;
    templateId?: number;
    templateCode?: string;
  }

  export interface CreateAndInitTenantResp {
    tenantId: number;
    adminUserId: number;
    adminUsername: string;
  }

  export interface TenantTemplateSimple {
    id: number;
    code: string;
    name: string;
    status: number;
    sortOrder: number;
    description?: string;
  }

  export interface TenantTemplateDetail {
    id: number;
    code: string;
    name: string;
    status: number;
    sortOrder: number;
    description?: string;
    roles: TenantTemplateRole[];
    depts: TenantTemplateDept[];
    roleMenus: TenantTemplateRoleMenu[];
    apiPerms: TenantTemplateApiPerm[];
  }

  export interface TenantTemplateRole {
    id: number;
    templateId: number;
    name: string;
    code: string;
    sortOrder: number;
    dataScope: number;
    isDefault: number;
    description?: string;
  }

  export interface TenantTemplateDept {
    id: number;
    templateId: number;
    parentId: number;
    name: string;
    sortOrder: number;
    status: number;
  }

  export interface TenantTemplateRoleMenu {
    id: number;
    templateId: number;
    roleTemplateCode: string;
    menuPath: string;
  }

  export interface TenantTemplateApiPerm {
    id: number;
    templateId: number;
    roleTemplateCode: string;
    apiMethod: string;
    apiPath: string;
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

async function createAndInitTenant(data: SystemTenantApi.CreateAndInitTenantReq) {
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

async function getTenantTemplateDetail(params: {
  id?: number;
  code?: string;
}) {
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
