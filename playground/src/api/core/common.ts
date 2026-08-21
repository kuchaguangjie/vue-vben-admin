import { queryOptions } from '@tanstack/vue-query';

import { requestClient } from '#/api/request';

export namespace CommonApi {
  export interface I18nInfoResp {
    appName: string;
    filePrefixList: string[];
    fileSuffix: string;
    i18n: any;
    langList: string[];
    saasEnabled: boolean;
  }
}

export async function getI18nInfoApi() {
  return requestClient.get<CommonApi.I18nInfoResp>('/i18n/info');
}

/**
 * 应用配置（含 i18n 信息）queryOptions 工厂
 *
 * 全局只读、变更极少；登录后由路由守卫调用一次，后续切页可直接命中缓存。
 */
export function i18nInfoQueryOptions() {
  return queryOptions({
    queryFn: () => getI18nInfoApi(),
    queryKey: ['app', 'i18nInfo'] as const,
    staleTime: 5 * 60 * 1000,
  });
}
