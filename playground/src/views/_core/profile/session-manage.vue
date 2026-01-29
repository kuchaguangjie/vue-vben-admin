<script setup lang="ts">
import { onMounted, ref } from 'vue';

// 确保导入 Vben 标准图标组件
import { IconifyIcon } from '@vben/icons';
import { $t } from '@vben/locales';

import { Button } from '@vben-core/shadcn-ui';

import { Badge, List, message, Popconfirm, Tag, Tooltip } from 'ant-design-vue';

import { deleteUserSessionApi, getUserSessionsApi } from '#/api';
import { formatBackendTime } from '#/utils/value-format';

const userSessionsRef = ref([]);
const loading = ref(false);

onMounted(loadUserSessions);

async function loadUserSessions() {
  loading.value = true;
  try {
    const data = await getUserSessionsApi();
    userSessionsRef.value = data?.sessionInfos || [];
  } finally {
    loading.value = false;
  }
}

async function handleDelete(sid: string) {
  await deleteUserSessionApi(sid);
  await loadUserSessions();
  message.success($t('common.messages.success'));
}

// 映射 MDI 图标
function getDeviceIcon(os: string = '') {
  const lowerOS = os.toLowerCase();
  if (lowerOS.includes('win')) return 'mdi:microsoft-windows';
  if (lowerOS.includes('linux')) return 'mdi:linux';
  if (lowerOS.includes('mac')) return 'mdi:apple';
  if (lowerOS.includes('android')) return 'mdi:android';
  if (lowerOS.includes('ios') || lowerOS.includes('iphone'))
    return 'mdi:cellphone-apple';
  return 'mdi:monitor';
}
</script>

<template>
  <div class="m-4 rounded-xl border border-border bg-card p-6 shadow-sm">
    <div
      class="mb-6 flex items-center justify-between border-b border-border pb-4"
    >
      <div class="flex items-center gap-2">
        <IconifyIcon icon="mdi:devices" class="size-6 text-primary" />
        <h2 class="text-lg font-semibold tracking-tight">
          {{ $t('已登录设备') }}
        </h2>
      </div>
      <Badge
        status="processing"
        :text="`共 ${userSessionsRef.length} 个活跃会话`"
      />
    </div>

    <List :data-source="userSessionsRef" :loading="loading">
      <template #renderItem="{ item }">
        <List.Item
          class="group my-1 rounded-lg border border-transparent px-4 transition-all hover:border-border hover:bg-muted/50"
        >
          <List.Item.Meta>
            <template #avatar>
              <div
                class="flex size-12 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary"
              >
                <IconifyIcon :icon="getDeviceIcon(item.os)" class="size-7" />
              </div>
            </template>
            <template #title>
              <div class="flex items-center gap-3">
                <span class="text-base font-medium">{{
                  `${item.os} · ${item.browser}`
                }}</span>
                <Tag
                  v-if="item.isCurrent"
                  color="processing"
                  class="flex items-center gap-1"
                >
                  <IconifyIcon icon="mdi:check-circle" class="size-3" />
                  当前会话
                </Tag>
              </div>
            </template>
            <template #description>
              <div
                class="mt-1 flex flex-col text-sm opacity-80 sm:flex-row sm:gap-6"
              >
                <span class="flex items-center gap-1">
                  <IconifyIcon icon="mdi:ip-network" class="size-3.5" />
                  {{ item.ip }}
                </span>
                <span class="flex items-center gap-1">
                  <IconifyIcon icon="mdi:clock-outline" class="size-3.5" />
                  {{ formatBackendTime(item.createdAt) }}
                </span>
                <Tooltip title="Session ID">
                  <span class="flex cursor-help items-center gap-1">
                    <IconifyIcon icon="mdi:identifier" class="size-3.5" />
                    {{ item.sid }}
                  </span>
                </Tooltip>
              </div>
            </template>
          </List.Item.Meta>

          <template #actions>
            <Popconfirm
              v-if="!item.isCurrent"
              title="确定要强制该设备下线吗？"
              @confirm="handleDelete(item.sid)"
              placement="left"
              ok-danger
            >
              <Button
                variant="outline"
                size="sm"
                class="transition-all hover:bg-destructive hover:text-destructive-foreground"
              >
                <IconifyIcon icon="mdi:logout-variant" class="mr-1 size-4" />
                下线
              </Button>
            </Popconfirm>
          </template>
        </List.Item>
      </template>
    </List>
  </div>
</template>
