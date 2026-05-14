import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'mdi:bookshelf',
      order: 50,
      title: $t('knowledge.title'),
    },
    name: 'Knowledge',
    path: '/knowledge',
    children: [
      {
        path: '/knowledge/category',
        name: 'KnowledgeCategory',
        meta: {
          icon: 'mdi:folder',
          title: $t('knowledge.category.module'),
        },
        component: () => import('#/views/knowledge/category/list.vue'),
      },
      {
        path: '/knowledge/content',
        name: 'KnowledgeContent',
        meta: {
          icon: 'mdi:file-document',
          title: $t('knowledge.content.module'),
        },
        component: () => import('#/views/knowledge/content/list.vue'),
      },
    ],
  },
];

export default routes;
