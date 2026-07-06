<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import { Page, VbenButton } from '@vben/common-ui';

import { Card, Divider, message, Tag } from 'ant-design-vue';

import { getMemStatus, loadMemAll } from '#/api/system/mem';
import { $t } from '#/locales';
import { formatBackendTime } from '#/utils/value-format';

const displayData = ref<any>(null);
onMounted(() => {
  handleStatus();
});

async function handleStatus(showSuccess: boolean = false) {
  displayData.value = await getMemStatus();
  if (showSuccess) message.success($t('common.messages.success'));
}

async function handleLoad() {
  await loadMemAll();
  message.success($t('system.mem.loadSuccess'));
  // 失败时 (e.g http 500), 自动从 显示错误提示 (result.message);
  await handleStatus(); // 刷新状态
}
</script>
<template>
  <Page auto-content-height>
    <div class="flex w-full items-center justify-between p-4">
      <VbenButton type="primary" @click="handleStatus(true)">
        {{ $t('system.mem.btnGetStatus') }}
      </VbenButton>
      <VbenButton type="primary" @click="handleLoad()">
        {{ $t('system.mem.btnLoadAll') }}
      </VbenButton>
    </div>

    <div class="p-4">
      <div class="mb-4 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <span class="font-bold text-gray-700 dark:text-gray-200">
            {{ $t('system.mem.globalStatus') }}:
          </span>
          <Tag :color="displayData?.config.enable ? 'green' : 'red'">
            {{
              displayData?.config.enable
                ? $t('system.mem.enabled')
                : $t('system.mem.disabled')
            }}
          </Tag>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-500 dark:text-gray-400">
            {{ $t('system.mem.autoLoadInterval') }}:
          </span>
          <Tag v-if="displayData?.config?.autoLoadInterval > 0" color="blue">
            {{ displayData.config.autoLoadInterval }}s
          </Tag>
          <Tag v-else color="default">
            {{ $t('system.mem.disabled') }}
          </Tag>
        </div>
      </div>

      <Divider>{{ $t('system.mem.moduleStatus') }}</Divider>

      <div
        class="grid grid-cols-1 gap-4 md:grid-cols-2"
        v-if="displayData?.config.enable"
      >
        <Card
          v-for="(enable, key) in displayData?.config.modules"
          :key="key"
          size="small"
          :title="key?.toUpperCase()"
        >
          <template #extra>
            <Tag :color="enable ? 'blue' : 'default'">
              {{
                enable ? $t('system.mem.enabled') : $t('system.mem.disabled')
              }}
            </Tag>
          </template>
          <p class="text-sm text-gray-500" v-if="displayData?.status[key]">
            {{ $t('common.updatedAt') }}:
            <span class="font-bold">{{
              formatBackendTime(displayData?.status[key]?.updatedAt)
            }}</span>
          </p>
        </Card>
      </div>
    </div>
  </Page>
</template>
<style scoped></style>
