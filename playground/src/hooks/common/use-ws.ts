import { computed, h } from 'vue';

import { $t } from '@vben/locales'; // 确保引入了路由实例
import { useAccessStore } from '@vben/stores';

import { useWebSocket } from '@vueuse/core';
import { message, notification } from 'ant-design-vue';

import { notifications } from '#/hooks/common/use-notify';
import { router } from '#/router';
import { useAuthStore } from '#/store';

const wsApiPath = '/';

const authStore = useAuthStore();

/**
 * WebSocket 处理逻辑 (VueUse 重构版)
 */
export function useWs() {
  const accessStore = useAccessStore();

  // 1. 动态计算 URL，确保 Token 更新时能重新准备
  const wsUrl = computed(() => {
    const token = accessStore.accessToken;
    return token
      ? `${import.meta.env.VITE_GLOB_WS_URL}${wsApiPath}?token=${token}`
      : '';
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
    onDisconnected(_, event) {
      console.warn('[WS] Disconnected');
      message.error(
        $t('common.messages.wsConnFailed', {
          error: `(${event.code}) ${event.reason}`,
        }),
      );
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
  async function handleBusinessData(msg: any) {
    // console.debug('[WS] Received Business Data:', msg);
    switch (msg.action) {
      case 'hello': {
        // eslint-disable-next-line no-console
        console.info('[WS] hello');
        break;
      }
      case 'kickout': {
        console.warn('[WS] kicked out');
        await authStore.logout(); // 下线
        break;
      }
      case 'notice': {
        notifications.value.push({
          id: `notice:${msg.data.id}`,
          avatar: 'lucide:megaphone',
          date: '',
          isRead: false,
          link: '/notice',
          message: `${msg.data.title}`,
          title: '收到了 1个新公告',
        });
        notification.info({
          message: `${$t('system.notice.moduleShort')} 【${msg.data.title}】`,
          description: () =>
            h('div', [
              `${$t('system.notice.jumpTip.part1')} `,
              h(
                'a',
                {
                  class: 'text-primary underline cursor-pointer',
                  onClick: async (e: Event) => {
                    e.preventDefault();
                    await router.push({
                      // path: '/notice',
                      name: 'Notice',
                    });

                    notification.destroy();
                  },
                },
                `[${$t('system.notice.moduleShort')}]`,
              ),
              ` ${$t('system.notice.jumpTip.part2')}`,
            ]),
          duration: 10,
        });
        break;
      }
      default: {
        console.warn('[WS] unknown action:', msg.action);
        break;
      }
    }
  }

  function connect() {
    if (!wsUrl.value) return; // 有 token 才 连接;
    open();
  }

  return { connect, send, status, close };
}
