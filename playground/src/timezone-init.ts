import { setTimezoneHandler } from '@vben/stores';

import {
  getTimezoneApi,
  setTimezoneApi,
  timezoneOptionsQueryOptions,
} from '#/api';
import { queryClient } from '#/api/query-client';

/**
 * 初始化时区处理，通过API保存时区设置
 */
export function initTimezone() {
  setTimezoneHandler({
    getTimezone() {
      return getTimezoneApi();
    },
    setTimezone(timezone: string) {
      return setTimezoneApi(timezone);
    },
    getTimezoneOptions() {
      // 走 queryClient.fetchQuery：时区选项数据稳定，
      // 长缓存 (30min) 内重复请求只触发一次后端调用，自动去重。
      return queryClient.fetchQuery(timezoneOptionsQueryOptions());
    },
  });
}
