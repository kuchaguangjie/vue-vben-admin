import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'mdi:account-cash',
      order: 50,
      title: $t('cm.title'),
    },
    name: 'Cm',
    path: '/cm',
    children: [
      {
        path: '/cm/commission-rule',
        name: 'CmCommissionRule',
        meta: {
          icon: 'mdi:percent',
          title: $t('cm.commissionRule.module'),
        },
        component: () => import('#/views/cm/commission-rule/list.vue'),
      },
      {
        path: '/cm/user-closure',
        name: 'CmUserClosure',
        meta: {
          icon: 'mdi:account-supervisor',
          title: $t('cm.userClosure.module'),
        },
        component: () => import('#/views/cm/user-closure/list.vue'),
      },
    ],
  },
];

export default routes;
