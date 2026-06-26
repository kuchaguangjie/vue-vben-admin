import { requestClient } from '#/api/request';

export namespace SystemConfigApi {
  export interface SysConfig {
    createdAt: string;
    id: number;
    key: string;
    remark: string;
    status: number;
    updatedAt: string;
    value: string;
  }

  export interface PageQuery {
    key?: string;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortDesc?: boolean;
    status?: number;
  }
}

async function getPage(params: SystemConfigApi.PageQuery) {
  return requestClient.get<{
    items: SystemConfigApi.SysConfig[];
    total: number;
  }>('/system/config/page', { params });
}

async function getDetail(id: number) {
  return requestClient.get<SystemConfigApi.SysConfig>(`/system/config/${id}`);
}

async function create(data: {
  key: string;
  remark: string;
  status: number;
  value: string;
}) {
  return requestClient.post<SystemConfigApi.SysConfig>('/system/config', data);
}

async function update(data: {
  id: number;
  key: string;
  remark: string;
  status: number;
  value: string;
}) {
  return requestClient.put<SystemConfigApi.SysConfig>(
    `/system/config/${data.id}`,
    data,
  );
}

async function remove(id: number) {
  return requestClient.delete(`/system/config/${id}`);
}

async function updateStatus(data: { id: number; status: number }) {
  return requestClient.put('/system/config/status', data);
}

export { create, getDetail, getPage, remove, update, updateStatus };
