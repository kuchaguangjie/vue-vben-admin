import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'mdi:wallet-outline',
      order: 80,
      title: $t('finance.title'),
    },
    name: 'Finance',
    path: '/finance',
    children: [
      {
        path: '/finance/currency',
        name: 'FinanceCurrency',
        meta: {
          icon: 'mdi:cash-multiple',
          title: $t('finance.currency.module'),
        },
        component: () => import('#/views/finance/currency/list.vue'),
      },
      {
        path: '/finance/wallet-tx',
        name: 'FinanceWalletTx',
        meta: {
          icon: 'mdi:format-list-bulleted',
          title: $t('finance.walletTx.module'),
        },
        component: () => import('#/views/finance/wallet-tx/list.vue'),
      },
      {
        path: '/finance/pay-order',
        name: 'FinancePayOrder',
        meta: {
          icon: 'mdi:credit-card-outline',
          title: $t('finance.payOrder.module'),
        },
        component: () => import('#/views/finance/pay-order/list.vue'),
      },
      {
        path: '/finance/platform-finance',
        name: 'FinancePlatformFinance',
        meta: {
          icon: 'mdi:chart-line',
          title: $t('finance.platformFinance.module'),
        },
        component: () => import('#/views/finance/platform-finance/index.vue'),
      },
    ],
  },
];

export default routes;
