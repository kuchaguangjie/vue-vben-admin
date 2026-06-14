<script lang="ts" setup>
import { ref } from 'vue';

import { Page } from '@vben/common-ui';

import { TabPane, Tabs } from 'ant-design-vue';

import { $t } from '#/locales';

import AccountGrid from './modules/account-grid.vue';
import LogGrid from './modules/log-grid.vue';
import Overview from './modules/overview.vue';

const activeTab = ref('overview');
</script>

<template>
  <Page auto-content-height>
    <Tabs
      v-model:active-key="activeTab"
      :animated="false"
      :destroy-inactive-tab-pane="true"
    >
      <TabPane key="overview" :tab="$t('cm.report.overview')">
        <Overview v-if="activeTab === 'overview'" />
      </TabPane>

      <TabPane key="log" :tab="$t('cm.report.logTab')">
        <LogGrid v-if="activeTab === 'log'" />
      </TabPane>

      <TabPane key="account" :tab="$t('cm.report.accountTab')">
        <AccountGrid v-if="activeTab === 'account'" />
      </TabPane>
    </Tabs>
  </Page>
</template>
