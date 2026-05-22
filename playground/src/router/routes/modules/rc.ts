import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'mdi:shield-alert',
      order: 45,
      title: $t('rc.title'),
    },
    name: 'Rc',
    path: '/rc',
    children: [
      {
        path: '/rc/rule-group',
        name: 'RcRuleGroup',
        meta: {
          icon: 'mdi:folder-multiple',
          title: $t('rc.ruleGroup.module'),
        },
        component: () => import('#/views/rc/rule-group/list.vue'),
      },
      {
        path: '/rc/rule',
        name: 'RcRule',
        meta: {
          icon: 'mdi:shield-check',
          title: $t('rc.rule.module'),
        },
        component: () => import('#/views/rc/rule/list.vue'),
      },
      {
        path: '/rc/execution-log',
        name: 'RcExecutionLog',
        meta: {
          icon: 'mdi:history',
          title: $t('rc.executionLog.module'),
        },
        component: () => import('#/views/rc/execution-log/list.vue'),
      },
    ],
  },
];

export default routes;
