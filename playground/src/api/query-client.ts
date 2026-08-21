import { QueryClient } from '@tanstack/vue-query';

/**
 * 全局 QueryClient 单例
 *
 * 设计原则（项目背景：admin 后台并发不高，更看重数据实时准确）：
 * - staleTime: 5s —— 短去重窗口，避免同一时刻多个组件并发请求；
 *   超过 5s 后再次访问会自动重拉，保证数据新鲜度。
 * - gcTime: 5min —— 缓存回收周期，与 staleTime 解耦。
 * - refetchOnWindowFocus: false —— 关闭窗口聚焦自动后台刷新，
 *   避免给后台管理引入不必要的静默请求（用户切换回来时如已 stale，
 *   会因 refetchOnMount 默认行为而在重新进入页面时刷新，足够实时）。
 * - refetchOnReconnect: true —— 网络恢复后刷新，符合实时性诉求。
 * - retry: 1 —— 失败重试一次，避免后端偶发抖动直接影响用户。
 *
 * 用法：
 * - 组件 setup 内：`useQuery(userInfoQueryOptions())` 等工厂函数。
 * - 非 setup 上下文（store action / router guard / effectScope）：
 *   `await queryClient.fetchQuery(userInfoQueryOptions())` 命中缓存即返回，
 *   超过 staleTime 自动重拉，享受与组件相同的去重和缓存能力。
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5000,
    },
  },
});
