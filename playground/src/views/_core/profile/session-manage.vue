<script setup lang="ts">
import type { UserApi } from '#/api';

import { onMounted, ref } from 'vue';

import { IconifyIcon } from '@vben/icons';
import { $t } from '@vben/locales';

import { Button } from '@vben-core/shadcn-ui';

import { message, Popconfirm, Tag } from 'ant-design-vue';

import { deleteUserSessionApi, getUserSessionsApi } from '#/api';
import { formatBackendTime } from '#/utils/value-format';

// 在声明 ref 时使用泛型，解决 TS 报错
const userSessionsRef = ref<UserApi.UserSession[]>([]);
const loading = ref(false);

onMounted(loadUserSessions);

async function loadUserSessions() {
  loading.value = true;
  try {
    const data = await getUserSessionsApi();
    userSessionsRef.value = data || [];
  } finally {
    loading.value = false;
  }
}

async function handleDelete(sid: string) {
  await deleteUserSessionApi(sid);
  await loadUserSessions();
  message.success($t('common.messages.success'));
}

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
          {{ $t('profile.tabSession.title', { num: userSessionsRef.length }) }}
        </h2>
      </div>
    </div>

    <div
      v-if="loading"
      class="flex flex-col items-center justify-center py-12 text-muted-foreground"
    >
      <IconifyIcon icon="mdi:loading" class="size-8 animate-spin" />
      <span class="mt-2 text-sm">{{ $t('common.messages.loading') }}</span>
    </div>

    <div
      v-else-if="userSessionsRef.length === 0"
      class="py-12 text-center text-muted-foreground"
    >
      {{ $t('common.noData') }}
    </div>

    <div v-else class="flex flex-col border-t border-border">
      <div
        v-for="(item, index) in userSessionsRef"
        :key="item.sid"
        class="group flex items-center border-b border-border px-4 py-4 transition-all even:bg-muted/80 hover:bg-primary/[0.03]"
      >
        <div
          class="mr-4 w-2.5 flex-shrink-0 text-center font-mono text-xs opacity-40 group-hover:text-primary"
        >
          {{ index + 1 }}
        </div>

        <div
          class="mr-4 flex size-12 flex-shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary"
        >
          <IconifyIcon :icon="getDeviceIcon(item.os)" class="size-7" />
        </div>

        <div class="min-w-0 flex-1">
          <div class="mb-1 flex items-center">
            <span
              class="mr-4 inline-block w-48 flex-shrink-0 truncate text-base font-medium"
            >
              {{ `${item.os} (${item.device}) · ${item.browser}` }}
            </span>

            <div class="mr-4 flex min-w-0 flex-1 items-center">
              <span
                class="inline-flex max-w-[120px] items-center gap-1 truncate rounded bg-muted/60 px-1.5 font-mono text-[10px] opacity-40"
                :title="$t('profile.tabSession.hover.sid')"
              >
                <IconifyIcon
                  icon="mdi:identifier"
                  class="size-3 flex-shrink-0"
                />
                {{ item.sid }}
              </span>
            </div>

            <div class="flex w-44 flex-shrink-0 items-center">
              <Tag
                v-if="item.isCurrent"
                color="processing"
                class="m-0 flex items-center gap-1 border-none bg-transparent p-0 text-primary"
              >
                <IconifyIcon
                  icon="mdi:check-circle"
                  class="size-3.5 flex-shrink-0"
                />
                <span class="text-xs font-medium">{{
                  $t('profile.tabSession.currentSession')
                }}</span>
              </Tag>
            </div>
          </div>

          <div class="flex items-center text-sm text-muted-foreground/80">
            <span
              class="mr-4 flex w-48 flex-shrink-0 items-center gap-1"
              :title="$t('profile.tabSession.hover.ip')"
            >
              <IconifyIcon
                icon="mdi:ip-network"
                class="size-3.5 flex-shrink-0"
              />
              <span class="truncate">{{ item.ip }}</span>
            </span>

            <span
              class="mr-4 flex min-w-0 flex-1 items-center gap-1"
              :title="$t('profile.tabSession.hover.city')"
            >
              <IconifyIcon icon="mdi:city" class="size-3.5 flex-shrink-0" />
              <span class="truncate">
                {{
                  item.city
                    ? `${item.city} (${item.cityCn})`
                    : $t('profile.tabSession.defaultCity')
                }}
              </span>
            </span>

            <span
              class="flex w-44 flex-shrink-0 items-center gap-1"
              :title="$t('profile.tabSession.hover.loginAt')"
            >
              <IconifyIcon
                icon="mdi:clock-outline"
                class="size-3.5 flex-shrink-0"
              />
              <span class="truncate text-xs">{{
                formatBackendTime(item.createdAt)
              }}</span>
            </span>
          </div>
        </div>

        <div class="ml-4 w-24 flex-shrink-0 text-right">
          <Popconfirm
            v-if="!item.isCurrent"
            :title="$t('profile.tabSession.confirmOffline')"
            @confirm="handleDelete(item.sid)"
            placement="left"
            ok-danger
          >
            <Button
              variant="outline"
              size="sm"
              class="bg-background transition-all hover:bg-destructive hover:text-destructive-foreground"
            >
              <IconifyIcon icon="mdi:logout-variant" class="mr-1 size-4" />
              {{ $t('profile.tabSession.offline') }}
            </Button>
          </Popconfirm>
        </div>
      </div>
    </div>
  </div>
</template>
