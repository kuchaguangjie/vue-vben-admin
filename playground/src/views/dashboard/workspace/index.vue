<script lang="ts" setup>
import type { DashboardApi } from '#/api/dashboard';

import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import { Page } from '@vben/common-ui';
import { preferences } from '@vben/preferences';
import { useUserStore } from '@vben/stores';

import { Avatar, Button, Select } from 'ant-design-vue';

import { getDashboardOverview } from '#/api/dashboard';
import { getTenantAll } from '#/api/system/tenant';
import { usePlatformAdmin } from '#/hooks/common/use-platform-admin';
import { $t } from '#/locales';

const userStore = useUserStore();
const router = useRouter();
const { isPlatformAdmin } = usePlatformAdmin();
const tenants = ref<Array<{ id: number; name: string }>>([]);
const selectedTenantId = ref(0);

const tenantOptions = computed(() => [
  { label: $t('common.platform'), value: 0 },
  ...tenants.value.map((tenant) => ({ label: tenant.name, value: tenant.id })),
]);

const overview = ref<DashboardApi.OverviewResp>({
  latestNotices: [],
  monthlyRevenue: 0,
  pendingWithdrawCount: 0,
  tenantCount: 0,
  userCount: 0,
  knowledgeStats: {
    totalCount: 0,
    tenantCount: 0,
    personalCount: 0,
  },
});
const loading = ref(false);

async function fetchOverview() {
  loading.value = true;
  try {
    const resp = await getDashboardOverview(
      isPlatformAdmin.value ? { tenantId: selectedTenantId.value } : undefined,
    );
    // #region debug-point A:overview-response
    fetch('http://127.0.0.1:7777/event', {
      method: 'POST',
      body: JSON.stringify({
        sessionId: 'workspace-tenant-switch',
        runId: 'pre',
        hypothesisId: 'A',
        location: 'workspace/index.vue:49',
        msg: '[DEBUG] dashboard overview response',
        data: {
          latestNotices: resp.latestNotices,
          knowledgeStats: resp.knowledgeStats,
          tenantId: selectedTenantId.value,
        },
        ts: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    overview.value = resp;
  } finally {
    loading.value = false;
  }
}

async function loadTenants() {
  if (!isPlatformAdmin.value) return;
  try {
    tenants.value = await getTenantAll();
  } catch {
    tenants.value = [];
  }
}

watch(selectedTenantId, fetchOverview);

onMounted(() => {
  loadTenants();
  fetchOverview();
});

function formatAmount(val: number): string {
  return val.toFixed(2);
}

const quickNavItems = [
  {
    color: '#3fb27f',
    icon: 'i-ion:people-outline',
    title: $t('system.user.title'),
    url: '/system/user',
  },
  {
    color: '#e18525',
    icon: 'i-ion:business-outline',
    title: $t('system.tenant.title'),
    url: '/system/tenant',
  },
  {
    color: '#bf0c2c',
    icon: 'i-ion:wallet-outline',
    title: $t('cm.tenantWithdraw.module'),
    url: '/cm-tenant/withdraw',
  },
  {
    color: '#00d8ff',
    icon: 'i-ion:stats-chart-outline',
    title: $t('finance.platformFinance.module'),
    url: '/finance/platform',
  },
];

function navTo(url: string) {
  router.push(url);
}
</script>

<template>
  <Page auto-content-height>
    <div class="p-4">
      <div class="mb-6 flex items-center">
        <Avatar
          :src="userStore.userInfo?.avatar || preferences.app.defaultAvatar"
          :size="64"
          class="mr-4"
        />
        <div class="mr-auto">
          <div class="text-2xl font-semibold">
            早安, {{ userStore.userInfo?.realName }}
          </div>
          <div class="text-sm text-muted-foreground">开始您一天的工作吧！</div>
        </div>
        <Select
          v-if="isPlatformAdmin"
          v-model:value="selectedTenantId"
          :options="tenantOptions"
          :placeholder="$t('ai.stat.tenantFilter')"
          style="width: 180px"
        />
      </div>

      <div class="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div
          class="rounded-lg border bg-card p-4 text-card-foreground shadow-sm"
        >
          <div class="text-sm font-medium text-muted-foreground">
            {{ $t('system.user.count') }}
          </div>
          <div class="mt-1 text-2xl font-bold">
            {{ overview.userCount }}
          </div>
        </div>
        <div
          class="rounded-lg border bg-card p-4 text-card-foreground shadow-sm"
        >
          <div class="text-sm font-medium text-muted-foreground">
            {{ $t('system.tenant.count') }}
          </div>
          <div class="mt-1 text-2xl font-bold">
            {{ overview.tenantCount }}
          </div>
        </div>
        <div
          class="rounded-lg border bg-card p-4 text-card-foreground shadow-sm"
        >
          <div class="text-sm font-medium text-muted-foreground">
            {{ $t('finance.monthlyRevenue') }}
          </div>
          <div class="mt-1 text-2xl font-bold">
            ¥{{ formatAmount(overview.monthlyRevenue) }}
          </div>
        </div>
        <div
          class="rounded-lg border bg-card p-4 text-card-foreground shadow-sm"
        >
          <div class="text-sm font-medium text-muted-foreground">
            {{ $t('cm.withdraw.pending') }}
          </div>
          <div class="mt-1 text-2xl font-bold text-orange-500">
            {{ overview.pendingWithdrawCount }}
          </div>
          <div class="mt-2">
            <Button
              type="link"
              size="small"
              class="p-0"
              @click="navTo('/cm-tenant/withdraw')"
            >
              {{ $t('ui.action.view') }}
            </Button>
          </div>
        </div>
        <div
          class="rounded-lg border bg-card p-4 text-card-foreground shadow-sm"
        >
          <div class="text-sm font-medium text-muted-foreground">
            {{ $t('knowledge.title') }}
          </div>
          <div class="mt-1 text-2xl font-bold">
            {{ overview.knowledgeStats.totalCount }}
          </div>
          <div class="mt-2 text-xs text-muted-foreground">
            {{ $t('knowledge.tenantCount') }}:
            {{ overview.knowledgeStats.tenantCount }} |
            {{ $t('knowledge.personalCount') }}:
            {{ overview.knowledgeStats.personalCount }}
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div
          class="rounded-lg border bg-card p-4 text-card-foreground shadow-sm lg:col-span-2"
        >
          <h3 class="mb-4 text-base font-semibold">
            {{ $t('ui.quickNav') }}
          </h3>
          <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div
              v-for="item in quickNavItems"
              :key="item.url"
              class="flex cursor-pointer flex-col items-center rounded-lg border p-4 transition-colors hover:bg-accent"
              @click="navTo(item.url)"
            >
              <div
                class="mb-2 flex h-12 w-12 items-center justify-center rounded-full"
                :style="{ backgroundColor: `${item.color}20` }"
              >
                <span
                  class="text-xl"
                  :class="item.icon"
                  :style="{ color: item.color }"
                ></span>
              </div>
              <span class="text-sm font-medium">{{ item.title }}</span>
            </div>
          </div>
        </div>

        <div
          class="rounded-lg border bg-card p-4 text-card-foreground shadow-sm"
        >
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-base font-semibold">
              {{ $t('cm.withdraw.pending') }}
            </h3>
            <Button
              type="link"
              size="small"
              @click="navTo('/cm-tenant/withdraw')"
            >
              {{ $t('ui.action.view') }}
            </Button>
          </div>
          <div
            v-if="overview.pendingWithdrawCount === 0"
            class="py-4 text-center text-sm text-muted-foreground"
          >
            {{ $t('cm.withdraw.noPending') }}
          </div>
          <div v-else class="py-4 text-center">
            <div class="text-5xl font-bold text-orange-500">
              {{ overview.pendingWithdrawCount }}
            </div>
            <div class="mt-2 text-sm text-muted-foreground">
              {{ $t('cm.withdraw.pending') }}
            </div>
          </div>
        </div>
      </div>

      <div
        class="mt-4 rounded-lg border bg-card p-4 text-card-foreground shadow-sm"
      >
        <h3 class="mb-4 text-base font-semibold">
          {{ $t('ui.latestNotices') }}
        </h3>
        <div
          v-if="overview.latestNotices.length === 0"
          class="py-4 text-center text-sm text-muted-foreground"
        >
          {{ $t('ui.noData') }}
        </div>
        <div v-else class="space-y-2">
          <div
            v-for="notice in overview.latestNotices"
            :key="notice.id"
            class="flex items-center justify-between border-b pb-2 last:border-b-0 last:pb-0"
          >
            <span class="text-sm">{{ notice.title }}</span>
            <span class="text-xs text-muted-foreground">{{
              notice.createdAt
            }}</span>
          </div>
        </div>
      </div>
    </div>
  </Page>
</template>
