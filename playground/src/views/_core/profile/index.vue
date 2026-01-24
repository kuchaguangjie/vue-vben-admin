<script setup lang="ts">
import { ref } from 'vue';

import { Profile } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { useUserStore } from '@vben/stores';

import ProfileBase from './base-setting.vue';
import ProfileNotificationSetting from './notification-setting.vue';
import ProfilePasswordSetting from './password-setting.vue';
import ProfileSecuritySetting from './security-setting.vue';

const userStore = useUserStore();

const tabsValue = ref<string>('basic');

const tabs = ref([
  {
    label: $t('usercenter.tab.basicInfo'),
    value: 'basic',
  },
  {
    value: 'password',
    label: $t('usercenter.tab.updatePassword'),
  },
  /*
  {
    label: $t('usercenter.tab.security'),
    value: 'security',
  },
  {
    value: 'notice',
    label: $t('usercenter.tab.notify'),
  },
  */
]);
</script>
<template>
  <Profile
    v-model:model-value="tabsValue"
    title="个人中心"
    :user-info="userStore.userInfo"
    :tabs="tabs"
  >
    <template #content>
      <ProfileBase v-if="tabsValue === 'basic'" />
      <ProfileSecuritySetting v-if="tabsValue === 'security'" />
      <ProfilePasswordSetting v-if="tabsValue === 'password'" />
      <ProfileNotificationSetting v-if="tabsValue === 'notice'" />
    </template>
  </Profile>
</template>
