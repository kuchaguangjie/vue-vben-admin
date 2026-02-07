<script lang="ts" setup>
import type { SystemWsApi } from '#/api/system/ws';

import { onMounted, ref } from 'vue';

import { Page, VbenButton } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { message } from 'ant-design-vue';

import { getWsStat } from '#/api/system/ws';

const displayData = ref<null | SystemWsApi.SystemWsStat>(null);
onMounted(() => {
  handleStat();
});

async function handleStat(showSuccess: boolean = false) {
  displayData.value = await getWsStat();
  if (showSuccess) message.success($t('common.messages.success'));
}
</script>
<template>
  <Page auto-content-height>
    <div class="flex w-full items-center justify-between p-4">
      <VbenButton type="primary" @click="handleStat()">
        {{ $t('system.ws.btnGetStat') }}
      </VbenButton>
    </div>
    <div>
      <div>{{ $t('system.ws.section.stat') }}</div>
      <div>
        {{ $t('system.ws.stat.connCount') }}: {{ displayData?.stat?.connCount }}
      </div>
      <div>
        {{ $t('system.ws.stat.userCount') }}: {{ displayData?.stat?.userCount }}
      </div>
      <div>
        {{ $t('system.ws.stat.sidCount') }}: {{ displayData?.stat?.sidCount }}
      </div>
    </div>
    <div>
      <div>{{ $t('system.ws.section.config') }}</div>
      <div>
        {{ $t('system.ws.config.maxConnPerSid') }}:
        {{ displayData?.config.maxConnPerSid }}
      </div>
    </div>
  </Page>
</template>
<style scoped></style>
