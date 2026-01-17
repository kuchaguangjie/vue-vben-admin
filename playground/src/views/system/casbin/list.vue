<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import { Page, VbenButton } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { Card, message } from 'ant-design-vue';

import {
  getCasbinManualStatus,
  getCasbinStat,
  loadCasbin,
} from '#/api/system/casbin';
import { formatBackendTime } from '#/utils/value-format';

const manualStatusData = ref<any>(null);
const statData = ref<any>(null);
onMounted(() => {
  handleManualStatus();
});

async function handleManualStatus(showSuccess: boolean = false) {
  manualStatusData.value = await getCasbinManualStatus();
  if (showSuccess) message.success($t('common.messages.success'));
}

async function handleLoad() {
  await loadCasbin();
  message.success($t('system.casbin.manualStatus.loadSuccess'));
  // 失败时 (e.g http 500), 自动从 显示错误提示 (result.message);
  await handleManualStatus(); // 刷新状态
}

async function handleStat() {
  statData.value = await getCasbinStat();
  message.success($t('common.messages.success'));
}
</script>
<template>
  <Page auto-content-height>
    <Card :title="$t('system.casbin.manualStatus.title')" class="mb-4">
      <template #extra>
        <div class="flex items-center gap-3">
          <VbenButton
            size="sm"
            class="h-8 border-white/10 bg-white/5 px-4 text-xs font-medium hover:bg-white/10"
            @click="handleManualStatus(true)"
          >
            {{ $t('system.casbin.manualStatus.btnGetStatus') }}
          </VbenButton>
          <VbenButton
            size="sm"
            type="primary"
            class="h-8 px-4 text-xs font-medium"
            @click="handleLoad()"
          >
            {{ $t('system.casbin.manualStatus.btnLoad') }}
          </VbenButton>
        </div>
      </template>

      <div class="flex justify-center py-6">
        <table class="border-separate border-spacing-x-6 border-spacing-y-3">
          <tbody>
            <tr>
              <td
                class="text-vben-text-secondary text-right align-middle text-sm"
              >
                {{ $t('system.casbin.manualStatus.loadCount') }}:
              </td>
              <td class="text-center align-middle">
                <span
                  class="block text-4xl font-bold leading-none text-blue-500"
                >
                  {{ manualStatusData?.loadCount || 0 }}
                </span>
              </td>
            </tr>

            <tr>
              <td
                class="text-vben-text-secondary text-right align-middle text-sm"
              >
                {{ $t('system.casbin.manualStatus.loadAt') }}:
              </td>
              <td class="text-center align-middle">
                <span
                  class="text-vben-text-primary block font-mono text-lg font-medium leading-none"
                >
                  {{
                    manualStatusData?.loadAt
                      ? formatBackendTime(manualStatusData.loadAt)
                      : '-'
                  }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>

    <Card :title="$t('system.casbin.stat.title')">
      <template #extra>
        <VbenButton type="primary" ghost @click="handleStat()">
          {{ $t('system.casbin.stat.btnStat') }}
        </VbenButton>
      </template>

      <div v-if="statData" class="space-y-6">
        <div class="flex items-center gap-2 text-sm text-gray-400">
          <span class="icon-[ant-design--clock-circle-outlined]"></span>
          {{ $t('system.casbin.stat.statAt') }}:
          {{ formatBackendTime(statData.statAt) }}
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div
            class="bg-vben-background-secondary rounded-lg border-l-4 border-blue-500 p-4"
          >
            <div class="text-vben-text-secondary text-xs uppercase">
              {{ $t('system.casbin.stat.ruleCount') }}
            </div>
            <div class="mt-1 text-2xl font-semibold">
              {{ statData.ruleCount }}
            </div>
          </div>
          <div
            class="bg-vben-background-secondary rounded-lg border-l-4 border-purple-500 p-4"
          >
            <div class="text-vben-text-secondary text-xs uppercase">
              {{ $t('system.casbin.stat.gRuleCount') }}
            </div>
            <div class="mt-1 text-2xl font-semibold">
              {{ statData.gRuleCount }}
            </div>
          </div>
          <div
            class="bg-vben-background-secondary rounded-lg border-l-4 border-green-500 p-4"
          >
            <div class="text-vben-text-secondary text-xs uppercase">
              {{ $t('system.casbin.stat.pRuleCount') }}
            </div>
            <div class="mt-1 text-2xl font-semibold">
              {{ statData.pRuleCount }}
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div
            class="flex flex-col items-center justify-center rounded-xl border bg-slate-50/5 p-6 dark:bg-white/5"
          >
            <div class="text-4xl font-light">{{ statData.subCount }}</div>
            <div class="text-vben-text-secondary mt-1 text-xs">
              {{ $t('system.casbin.stat.subCount') }}
            </div>
          </div>
          <div
            class="flex flex-col items-center justify-center rounded-xl border bg-slate-50/5 p-6 dark:bg-white/5"
          >
            <div class="text-4xl font-light text-blue-400">
              {{ statData.roleSubCount }}
            </div>
            <div class="text-vben-text-secondary mt-1 text-xs">
              {{ $t('system.casbin.stat.roleSubCount') }}
            </div>
          </div>
          <div
            class="flex flex-col items-center justify-center rounded-xl border bg-slate-50/5 p-6 dark:bg-white/5"
          >
            <div class="text-4xl font-light text-orange-400">
              {{ statData.userSubCount }}
            </div>
            <div class="text-vben-text-secondary mt-1 text-xs">
              {{ $t('system.casbin.stat.userSubCount') }}
            </div>
          </div>
        </div>
      </div>
      <div v-else class="text-vben-text-secondary py-12 text-center">
        {{ $t('system.casbin.stat.needClick') }}
      </div>
    </Card>
  </Page>
</template>
<style scoped></style>
