<script lang="ts" setup>
import type { EchartsUIType } from '@vben/plugins/echarts';

import type { SystemAiChatStatApi } from '#/api/ai';

import { computed, onMounted, ref, watch } from 'vue';

import { AnalysisChartCard } from '@vben/common-ui';
import {
  SvgBellIcon,
  SvgCakeIcon,
  SvgCardIcon,
  SvgDownloadIcon,
} from '@vben/icons';
import { EchartsUI, useEcharts } from '@vben/plugins/echarts';
import { useUserStore } from '@vben/stores';

import { Select } from 'ant-design-vue';

import { getChatStatOverview } from '#/api/ai';
import { getTenantAll } from '#/api/system/tenant';
import { usePlatformAdmin } from '#/hooks/common/use-platform-admin';
import { $t } from '#/locales';

const statData = ref<null | SystemAiChatStatApi.ChatStatOverviewResp>(null);
const loading = ref(true);

const { isPlatformAdmin } = usePlatformAdmin();
const userStore = useUserStore();
const tenants = ref<Array<{ id: number; name: string }>>([]);
const selectedTenantId = ref(0);

const tenantOptions = computed(() => {
  if (!isPlatformAdmin.value) {
    return [];
  }
  return [
    { label: $t('common.platform'), value: 0 },
    ...tenants.value.map((t) => ({ label: t.name, value: t.id })),
  ];
});

const convChartRef = ref<EchartsUIType>();
const tokenChartRef = ref<EchartsUIType>();
const { renderEcharts: renderConvChart } = useEcharts(convChartRef);
const { renderEcharts: renderTokenChart } = useEcharts(tokenChartRef);

function formatNumber(num: number): string {
  if (num >= 10_000) {
    return `${(num / 10_000).toFixed(1)}万`;
  }
  return num.toString();
}

function renderConversationTrend() {
  if (!statData.value?.conversationTrend) return;
  const data = statData.value.conversationTrend;
  const xData = data.map((item) => item.date);
  const yData = data.map((item) => item.count);

  renderConvChart({
    grid: {
      bottom: 40,
      containLabel: true,
      left: '3%',
      right: '3%',
      top: '10%',
    },
    series: [
      {
        areaStyle: {
          opacity: 0.3,
        },
        data: yData,
        itemStyle: {
          color: '#5ab1ef',
        },
        smooth: true,
        type: 'line',
      },
    ],
    tooltip: {
      axisPointer: {
        lineStyle: {
          color: '#5ab1ef',
          width: 1,
        },
      },
      trigger: 'axis',
    },
    xAxis: {
      axisLabel: {
        rotate: 45,
        fontSize: 10,
      },
      axisTick: {
        show: false,
      },
      boundaryGap: false,
      data: xData,
      type: 'category',
    },
    yAxis: {
      axisTick: {
        show: false,
      },
      splitLine: {
        lineStyle: {
          type: 'dashed',
        },
      },
      type: 'value',
    },
  });
}

function renderTokenTrend() {
  if (!statData.value?.tokenTrend) return;
  const data = statData.value.tokenTrend;
  const xData = data.map((item) => item.date);
  const yData = data.map((item) => item.count);

  renderTokenChart({
    grid: {
      bottom: 40,
      containLabel: true,
      left: '3%',
      right: '3%',
      top: '10%',
    },
    series: [
      {
        areaStyle: {
          opacity: 0.3,
        },
        data: yData,
        itemStyle: {
          color: '#019680',
        },
        smooth: true,
        type: 'line',
      },
    ],
    tooltip: {
      axisPointer: {
        lineStyle: {
          color: '#019680',
          width: 1,
        },
      },
      trigger: 'axis',
    },
    xAxis: {
      axisLabel: {
        rotate: 45,
        fontSize: 10,
      },
      axisTick: {
        show: false,
      },
      boundaryGap: false,
      data: xData,
      type: 'category',
    },
    yAxis: {
      axisTick: {
        show: false,
      },
      splitLine: {
        lineStyle: {
          type: 'dashed',
        },
      },
      type: 'value',
    },
  });
}

async function loadTenants() {
  if (!isPlatformAdmin.value) return;
  try {
    tenants.value = await getTenantAll();
  } catch {
    tenants.value = [];
  }
}

async function fetchStatData() {
  loading.value = true;
  try {
    const params: SystemAiChatStatApi.ChatStatFilterReq = {
      tenantId: isPlatformAdmin.value
        ? selectedTenantId.value
        : userStore.userInfo?.tenantId,
    };
    statData.value = await getChatStatOverview(params);
    renderConversationTrend();
    renderTokenTrend();
  } finally {
    loading.value = false;
  }
}

watch(selectedTenantId, () => {
  fetchStatData();
});

onMounted(() => {
  loadTenants();
  fetchStatData();
});
</script>

<template>
  <div class="p-5">
    <div class="mb-4 flex items-center gap-4">
      <Select
        v-if="isPlatformAdmin"
        v-model:value="selectedTenantId"
        :options="tenantOptions"
        :placeholder="$t('ai.stat.tenantFilter')"
        style="width: 180px"
      />
    </div>
    <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <div
        v-for="item in [
          {
            title: $t('ai.stat.totalConversations'),
            icon: SvgCardIcon,
            today: statData?.todayConversations ?? 0,
            total: statData?.totalConversations ?? 0,
          },
          {
            title: $t('ai.stat.totalMessages'),
            icon: SvgBellIcon,
            today: statData?.todayMessages ?? 0,
            total: statData?.totalMessages ?? 0,
          },
          {
            title: $t('ai.stat.totalTokensUsed'),
            icon: SvgDownloadIcon,
            today: statData?.todayTokensUsed ?? 0,
            total: statData?.totalTokensUsed ?? 0,
          },
          {
            title: $t('ai.stat.activeUsers'),
            icon: SvgCakeIcon,
            today: 0,
            total: statData?.activeUsers ?? 0,
          },
        ]"
        :key="item.title"
        class="rounded-lg border border-gray-200 bg-gray-50 p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
      >
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-gray-600 dark:text-gray-300">{{
            item.title
          }}</span>
          <component
            :is="item.icon"
            class="h-5 w-5 text-gray-400 dark:text-gray-500"
          />
        </div>
        <div v-if="item.today > 0" class="mt-3">
          <span class="text-xs text-gray-500 dark:text-gray-400">{{
            $t('ai.stat.today')
          }}</span>
          <span class="ml-2 text-lg font-bold text-gray-800 dark:text-gray-200">
            {{ formatNumber(item.today) }}
          </span>
        </div>
        <div class="mt-2">
          <span class="text-xs text-gray-500 dark:text-gray-400">{{
            $t('ai.stat.total')
          }}</span>
          <span class="ml-2 text-lg font-bold text-gray-800 dark:text-gray-200">
            {{ formatNumber(item.total) }}
          </span>
        </div>
      </div>
    </div>

    <div class="mt-5 w-full">
      <AnalysisChartCard title="对话趋势" class="mt-5">
        <EchartsUI ref="convChartRef" />
      </AnalysisChartCard>
    </div>

    <div class="mt-5 w-full">
      <AnalysisChartCard title="Token 使用趋势" class="mt-5">
        <EchartsUI ref="tokenChartRef" />
      </AnalysisChartCard>
    </div>

    <div class="mt-5 w-full">
      <AnalysisChartCard title="模型使用分布" class="mt-5">
        <div v-if="loading" class="flex h-40 items-center justify-center">
          <span>加载中...</span>
        </div>
        <div
          v-else-if="
            !statData?.modelDistribution ||
            statData.modelDistribution.length === 0
          "
          class="flex h-40 items-center justify-center text-gray-400"
        >
          {{ $t('ai.stat.noData') }}
        </div>
        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr>
                <th class="border-b px-4 py-3 text-left">
                  {{ $t('ai.model.code') }}
                </th>
                <th class="border-b px-4 py-3 text-left">
                  {{ $t('ai.model.name') }}
                </th>
                <th class="border-b px-4 py-3 text-right">
                  {{ $t('ai.stat.conversationCount') }}
                </th>
                <th class="border-b px-4 py-3 text-right">
                  {{ $t('ai.stat.messageCount') }}
                </th>
                <th class="border-b px-4 py-3 text-right">
                  {{ $t('ai.stat.tokenUsed') }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in statData.modelDistribution"
                :key="item.modelCode"
                class="hover:bg-gray-50"
              >
                <td class="border-b px-4 py-3">{{ item.modelCode }}</td>
                <td class="border-b px-4 py-3">
                  {{ item.modelName || item.modelCode }}
                </td>
                <td class="border-b px-4 py-3 text-right">
                  {{ formatNumber(item.conversationCount) }}
                </td>
                <td class="border-b px-4 py-3 text-right">
                  {{ formatNumber(item.messageCount) }}
                </td>
                <td class="border-b px-4 py-3 text-right">
                  {{ formatNumber(item.tokenUsed) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </AnalysisChartCard>
    </div>
  </div>
</template>
