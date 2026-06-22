import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'ion:settings-outline',
      order: 9997,
      title: $t('system.title'),
    },
    name: 'System',
    path: '/system',
    children: [
      {
        path: '/system/role',
        name: 'SystemRole',
        meta: {
          icon: 'mdi:account-group',
          title: $t('system.role.title'),
        },
        component: () => import('#/views/system/role/list.vue'),
      },
      {
        path: '/system/menu',
        name: 'SystemMenu',
        meta: {
          icon: 'mdi:menu',
          title: $t('system.menu.title'),
        },
        component: () => import('#/views/system/menu/list.vue'),
      },
      {
        path: '/system/dept',
        name: 'SystemDept',
        meta: {
          icon: 'charm:organisation',
          title: $t('system.dept.title'),
        },
        component: () => import('#/views/system/dept/list.vue'),
      },
      {
        path: '/system/user',
        name: 'SystemUser',
        meta: {
          icon: 'mdi:account',
          title: $t('system.user.title'),
        },
        component: () => import('#/views/system/user/list.vue'),
      },
      {
        path: '/system/log',
        name: 'SystemLog',
        meta: {
          icon: 'mdi:account',
          title: $t('system.log.title'),
        },
        component: () => import('#/views/system/log/list.vue'),
      },
      {
        path: '/system/tenant',
        name: 'SystemTenant',
        meta: {
          icon: 'mdi:domain',
          title: $t('system.tenant.title'),
        },
        component: () => import('#/views/system/tenant/list.vue'),
      },
      {
        path: '/system/tenant-settings',
        name: 'SystemTenantSettings',
        meta: {
          icon: 'mdi:cog',
          title: $t('system.tenant.settingsTitle'),
        },
        component: () => import('#/views/system/tenant-settings/index.vue'),
      },
      {
        path: '/system/notice',
        name: 'SystemNotice',
        meta: {
          icon: 'mdi:bell',
          title: $t('system.notice.module'),
        },
        component: () => import('#/views/system/notice/list.vue'),
      },
      {
        path: '/system/notice-category',
        name: 'SystemNoticeCategory',
        meta: {
          icon: 'mdi:folder',
          title: $t('system.noticeCategory.module'),
        },
        component: () => import('#/views/system/notice-category/list.vue'),
      },
      {
        path: '/system/gen',
        name: 'SystemGen',
        meta: {
          icon: 'mdi:code-tags',
          title: $t('system.gen.module'),
        },
        component: () => import('#/views/system/gen/list.vue'),
      },
      {
        path: '/system/api-key',
        name: 'SystemApiKey',
        meta: {
          icon: 'mdi:key',
          title: $t('system.apiKey.module'),
        },
        component: () => import('#/views/system/api-key/list.vue'),
      },
    ],
  },
];

export default routes;
