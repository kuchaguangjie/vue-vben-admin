import { computed } from 'vue';

import { useAccessStore } from '@vben/stores';

import { useWebSocket } from '@vueuse/core';

/**
 * WebSocket 处理逻辑 (VueUse 重构版)
 */
export function useWs() {
  const accessStore = useAccessStore();

  // 1. 动态计算 URL，确保 Token 更新时能重新准备
  const wsUrl = computed(() => {
    const token = accessStore.accessToken;
    return token ? `${import.meta.env.VITE_GLOB_WS_URL}/ws?token=${token}` : '';
  });

  // 2. 初始化 useWebSocket
  const { status, send, close, open } = useWebSocket(wsUrl.value, {
    // 基础配置
    immediate: false, // 不要在导入时立即连接，由我们手动触发或根据 Token 触发
    autoReconnect: {
      retries: 10, // 重连尝试次数
      delay: 6000, // 每次重连间隔, in ms;
    },

    heartbeat: false, // 前端主动心跳; 如果后端 主动 ping, 则这里不要 重复开启;

    // 监听连接成功
    onConnected() {
      // eslint-disable-next-line no-console
      console.info('[WS] Connected');
    },

    // 监听连接断开
    onDisconnected() {
      // eslint-disable-next-line no-console
      console.info('[WS] Disconnected');
    },

    // 处理 data frame
    onMessage(_ws, event) {
      try {
        const msg = JSON.parse(event.data);
        // 处理业务数据
        handleBusinessData(msg);
      } catch (error) {
        console.error('[WS] Message parse error', error);
      }
    },
  });

  // 3. 业务数据处理
  function handleBusinessData(data: any) {
    // eslint-disable-next-line no-console
    console.info('[WS] Received Business Data:', data);
    // 这里可以配合 Pinia 或 mitt 处理
  }

  /**
   * 手动触发连接
   */
  function connect() {
    if (!wsUrl.value) return; // 有 token 才 连接;
    open();
  }

  return { connect, send, status, close };
}
