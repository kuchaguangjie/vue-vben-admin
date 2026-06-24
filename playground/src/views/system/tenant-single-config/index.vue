<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';

import { Button, message, RadioGroup } from 'ant-design-vue';

import { getTenantSingleConfig, updateTenantSingleConfig } from '#/api';
import { $t } from '#/locales';

const loading = ref(false);
const saving = ref(false);
const version = ref(0);
const userWithdrawNeedReview = ref<number>();
const userWithdrawAutoPay = ref<number>();
const primaryCurrency = ref<string>();

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

const currencyOptions = [
  { label: $t('system.tenant.primaryCurrencyGlobal'), value: undefined },
  { label: 'CNY', value: 'CNY' },
  { label: 'USD', value: 'USD' },
];

async function loadSettings() {
  loading.value = true;
  try {
    const data = await getTenantSingleConfig();
    version.value = data.version ?? 0;
    userWithdrawNeedReview.value = data.userWithdrawNeedReview ?? undefined;
    userWithdrawAutoPay.value = data.userWithdrawAutoPay ?? undefined;
    primaryCurrency.value = data.primaryCurrency ?? undefined;
  } finally {
    loading.value = false;
  }
}

async function handleSave() {
  saving.value = true;
  try {
    await updateTenantSingleConfig({
      version: version.value,
      userWithdrawNeedReview: userWithdrawNeedReview.value,
      userWithdrawAutoPay: userWithdrawAutoPay.value,
      primaryCurrency: primaryCurrency.value,
    });
    message.success($t('ui.actionMessage.updateSuccess'));
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
        {{ $t('system.tenantSingleConfig.module') }}
      </h2>
      <div v-if="loading" class="text-center text-gray-500">
        {{ $t('common.messages.loading') }}
      </div>
      <div v-else class="space-y-6">
        <div class="rounded-lg border border-gray-200 p-5">
          <h3 class="mb-3 text-base font-medium text-gray-800">
            {{ $t('system.tenantSingleConfig.currencySection') }}
          </h3>
          <div class="mb-2 text-sm font-medium text-gray-700">
            {{ $t('system.tenant.primaryCurrency') }}
          </div>
          <div class="mb-2 text-xs text-gray-500">
            {{ $t('system.tenant.primaryCurrencyDesc') }}
          </div>
          <RadioGroup
            v-model:value="primaryCurrency"
            :options="currencyOptions"
          />
        </div>
        <div class="rounded-lg border border-gray-200 p-5">
          <h3 class="mb-3 text-base font-medium text-gray-800">
            {{ $t('system.tenantSingleConfig.withdrawSection') }}
          </h3>
          <div class="mb-2 text-sm font-medium text-gray-700">
            {{ $t('system.tenant.withdrawNeedReview') }}
          </div>
          <div class="mb-2 text-xs text-gray-500">
            {{ $t('system.tenant.withdrawNeedReviewDesc') }}
          </div>
          <RadioGroup
            v-model:value="userWithdrawNeedReview"
            :options="withdrawNeedReviewOptions"
          />
          <div class="mt-4 text-sm font-medium text-gray-700">
            {{ $t('system.tenant.userWithdrawAutoPay') }}
          </div>
          <div class="mb-2 mt-1 text-xs text-gray-500">
            {{ $t('system.tenant.autoPayDesc') }}
          </div>
          <RadioGroup
            v-model:value="userWithdrawAutoPay"
            :options="autoPayOptions"
          />
        </div>
        <Button type="primary" :loading="saving" @click="handleSave">
          {{ $t('ui.actionTitle.save') }}
        </Button>
      </div>
    </div>
  </Page>
</template>
