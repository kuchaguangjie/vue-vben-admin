<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { getTenantSettings, updateTenantSettings } from '#/api';
import { $t } from '#/locales';

const loading = ref(false);
const saving = ref(false);
const version = ref(0);
const userWithdrawNeedReview = ref<number>();
const userWithdrawAutoPay = ref<number>();

const withdrawNeedReviewOptions = [
  { label: $t('system.tenant.withdrawNeedReviewGlobal'), value: undefined },
  { label: $t('system.tenant.withdrawNeedReviewYes'), value: 1 },
  { label: $t('system.tenant.withdrawNeedReviewNo'), value: 0 },
];

const autoPayOptions = [
  { label: $t('system.tenant.withdrawNeedReviewGlobal'), value: undefined },
  { label: $t('system.tenant.autoPayYes'), value: 1 },
  { label: $t('system.tenant.autoPayNo'), value: 0 },
];

async function loadSettings() {
  loading.value = true;
  try {
    const data = await getTenantSettings();
    version.value = data.version ?? 0;
    userWithdrawNeedReview.value = data.userWithdrawNeedReview;
    userWithdrawAutoPay.value = data.userWithdrawAutoPay;
  } finally {
    loading.value = false;
  }
}

async function handleSave() {
  saving.value = true;
  try {
    await updateTenantSettings({
      version: version.value,
      userWithdrawNeedReview: userWithdrawNeedReview.value,
      userWithdrawAutoPay: userWithdrawAutoPay.value,
    });
    message.success($t('ui.actionSuccess'));
    await loadSettings();
  } finally {
    saving.value = false;
  }
}

onMounted(() => {
  loadSettings();
});
</script>

<template>
  <Page auto-content-height>
    <div class="mx-auto max-w-2xl p-6">
      <h2 class="mb-6 text-xl font-semibold">
        {{ $t('system.tenant.settingsTitle') }}
      </h2>
      <div v-if="loading" class="text-center text-gray-500">
        {{ $t('common.loading') }}
      </div>
      <div v-else class="space-y-6">
        <div class="rounded-lg border border-gray-200 p-5">
          <div class="mb-2 text-sm font-medium text-gray-700">
            {{ $t('system.tenant.withdrawNeedReview') }}
          </div>
          <div class="mb-2 text-xs text-gray-500">
            {{ $t('system.tenant.withdrawNeedReviewDesc') }}
          </div>
          <a-radio-group
            v-model:value="userWithdrawNeedReview"
            :options="withdrawNeedReviewOptions"
          />
        </div>
        <div class="rounded-lg border border-gray-200 p-5">
          <div class="mb-2 text-sm font-medium text-gray-700">
            {{ $t('system.tenant.userWithdrawAutoPay') }}
          </div>
          <div class="mb-2 text-xs text-gray-500">
            {{ $t('system.tenant.autoPayDesc') }}
          </div>
          <a-radio-group
            v-model:value="userWithdrawAutoPay"
            :options="autoPayOptions"
          />
        </div>
        <a-button type="primary" :loading="saving" @click="handleSave">
          {{ $t('ui.actionTitle.save') }}
        </a-button>
      </div>
    </div>
  </Page>
</template>
