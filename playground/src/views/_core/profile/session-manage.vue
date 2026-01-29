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
          <div class="flex w-full items-center">
            <div
              class="mr-4 flex size-12 flex-shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary"
            >
              <IconifyIcon :icon="getDeviceIcon(item.os)" class="size-7" />
            </div>

            <div class="flex-1">
              <div class="mb-1 flex items-center gap-3">
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

              <div
                class="grid grid-cols-1 gap-x-4 text-sm opacity-80 lg:grid-cols-4"
              >
                <span class="flex items-center gap-1 truncate" title="IP 地址">
                  <IconifyIcon
                    icon="mdi:ip-network"
                    class="size-3.5 flex-shrink-0"
                  />
                  <span class="truncate">{{ item.ip }}</span>
                </span>

                <span class="flex items-center gap-1 truncate" title="地理位置">
                  <IconifyIcon icon="mdi:city" class="size-3.5 flex-shrink-0" />
                  <span class="truncate">{{
                    `${item.city || 'Local'} (${item.cityCn || '局域网'})`
                  }}</span>
                </span>

                <span class="flex items-center gap-1 truncate" title="登录时间">
                  <IconifyIcon
                    icon="mdi:clock-outline"
                    class="size-3.5 flex-shrink-0"
                  />
                  <span class="truncate text-xs">{{
                    formatBackendTime(item.createdAt)
                  }}</span>
                </span>

                <Tooltip title="Session ID">
                  <span class="flex cursor-help items-center gap-1 truncate">
                    <IconifyIcon
                      icon="mdi:identifier"
                      class="size-3.5 flex-shrink-0"
                    />
                    <span class="truncate font-mono text-[10px]">{{
                      item.sid
                    }}</span>
                  </span>
                </Tooltip>
              </div>
            </div>

            <div class="ml-4 w-24 text-right">
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
            </div>
          </div>
        </List.Item>
      </template>
    </List>
  </div>
</template>
