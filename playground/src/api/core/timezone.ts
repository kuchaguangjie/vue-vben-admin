import { queryOptions } from '@tanstack/vue-query';

import { requestClient } from '#/api/request';

/**
 * 获取系统支持的时区列表
 */
export async function getTimezoneOptionsApi() {
  return await requestClient.get<
    {
      label: string;
      value: string;
    }[]
  >('/timezone/getTimezoneOptions');
}

/**
 * 系统时区选项列表 queryOptions 工厂
 *
 * 全局只读、几乎不变，长缓存即可。
 */
export function timezoneOptionsQueryOptions() {
  return queryOptions({
    queryFn: () => getTimezoneOptionsApi(),
    queryKey: ['timezone', 'options'] as const,
    staleTime: 30 * 60 * 1000,
  });
}

/**
 * 获取用户时区
 */
export async function getTimezoneApi(): Promise<null | string | undefined> {
  return requestClient.get<null | string | undefined>('/timezone/getTimezone');
}
/**
 * 设置用户时区
 * @param timezone 时区
 */
export async function setTimezoneApi(timezone: string): Promise<void> {
  return requestClient.post('/timezone/setTimezone', { timezone });
}
