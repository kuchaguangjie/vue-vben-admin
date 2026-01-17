<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import { Page, VbenButton } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { Divider, message } from 'ant-design-vue';

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
    <Divider>{{ $t('system.casbin.manualStatus.title') }}</Divider>
    <div class="flex w-full items-center justify-between p-4">
      <VbenButton type="primary" @click="handleManualStatus(true)">
        {{ $t('system.casbin.manualStatus.btnGetStatus') }}
      </VbenButton>
      <VbenButton type="primary" @click="handleLoad()">
        {{ $t('system.casbin.manualStatus.btnLoad') }}
      </VbenButton>
    </div>

    <div>
      <div>
        {{ $t('system.casbin.manualStatus.loadCount') }}:
        {{ manualStatusData?.loadCount }}
      </div>
      <div v-if="manualStatusData?.loadCount > 0">
        {{ $t('system.casbin.manualStatus.loadAt') }}:
        {{ formatBackendTime(manualStatusData?.loadAt) }}
      </div>
    </div>

    <Divider>{{ $t('system.casbin.stat.title') }}</Divider>
    <div class="flex w-full items-center justify-between p-4">
      <VbenButton type="primary" @click="handleStat()">
        {{ $t('system.casbin.stat.btnStat') }}
      </VbenButton>
    </div>

    <div v-if="statData">
      <div>
        {{ $t('system.casbin.stat.statAt') }}:
        {{ formatBackendTime(statData?.statAt) }}
      </div>
      <div>
        {{ $t('system.casbin.stat.ruleCount') }}: {{ statData?.ruleCount }}
      </div>
      <div>
        {{ $t('system.casbin.stat.gRuleCount') }}: {{ statData?.gRuleCount }}
      </div>
      <div>
        {{ $t('system.casbin.stat.pRuleCount') }}: {{ statData?.pRuleCount }}
      </div>
      <div>
        {{ $t('system.casbin.stat.subCount') }}: {{ statData?.subCount }}
      </div>
      <div>
        {{ $t('system.casbin.stat.roleSubCount') }}:
        {{ statData?.roleSubCount }}
      </div>
      <div>
        {{ $t('system.casbin.stat.userSubCount') }}:
        {{ statData?.userSubCount }}
      </div>
    </div>
  </Page>
</template>
<style scoped></style>
