import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'mdi:robot',
      order: 10,
      title: $t('ai.title'),
    },
    name: 'AI',
    path: '/ai',
    children: [
      {
        path: '/ai/provider',
        name: 'AIProvider',
        meta: {
          icon: 'mdi:server-network',
          title: $t('ai.provider.module'),
        },
        component: () => import('#/views/ai/provider/list.vue'),
      },
      {
        path: '/ai/model',
        name: 'AIModel',
        meta: {
          icon: 'mdi:brain',
          title: $t('ai.model.module'),
        },
        component: () => import('#/views/ai/model/list.vue'),
      },
      {
        path: '/ai/stat',
        name: 'AIChatStat',
        meta: {
          icon: 'mdi:bar-chart',
          title: $t('ai.stat.module'),
        },
        component: () => import('#/views/ai/stat/index.vue'),
      },
    ],
  },
];

export default routes;
