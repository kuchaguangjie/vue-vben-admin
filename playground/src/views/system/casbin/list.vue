<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import { Page, VbenButton } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { Divider, message } from 'ant-design-vue';

import { getCasbinStatus, loadCasbin } from '#/api/system/casbin';

const displayData = ref<any>(null);
onMounted(() => {
  handleStatus();
});

async function handleStatus(showSuccess: boolean = false) {
  displayData.value = await getCasbinStatus();
  if (showSuccess) message.success($t('common.messages.success'));
}

async function handleLoad() {
  await loadCasbin();
  message.success($t('system.casbin.loadSuccess'));
  // 失败时 (e.g http 500), 自动从 显示错误提示 (result.message);
  await handleStatus(); // 刷新状态
}
</script>
<template>
  <Page auto-content-height>
    <div class="flex w-full items-center justify-between p-4">
      <VbenButton type="primary" @click="handleStatus(true)">
        {{ $t('system.casbin.btnGetStatus') }}
      </VbenButton>
      <VbenButton type="primary" @click="handleLoad()">
        {{ $t('system.casbin.btnLoad') }}
      </VbenButton>
    </div>

    <Divider>{{ $t('system.casbin.status') }}</Divider>
  </Page>
</template>
<style scoped></style>
