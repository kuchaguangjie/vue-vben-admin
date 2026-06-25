<script lang="ts" setup>
import type { EchartsUIType } from '@vben/plugins/echarts';

import type { PlatformFinanceApi } from '#/api/finance/platform-finance';

import { computed, onMounted, ref, watch } from 'vue';

import { Page } from '@vben/common-ui';
import { EchartsUI, useEcharts } from '@vben/plugins/echarts';

import { DatePicker, Select } from 'ant-design-vue';

import { getPlatformFinanceOverview } from '#/api/finance/platform-finance';
import { $t } from '#/locales';

const chartRef = ref<EchartsUIType>();
const { renderEcharts } = useEcharts(chartRef);

const loading = ref(false);
const overview = ref<null | PlatformFinanceApi.OverviewResp>(null);
const startDate = ref<string>('');
const endDate = ref<string>('');
const currency = ref<string>('');
const availableCurrencies = ref<string[]>([]);

function formatAmount(val: number): string {
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(2)}M`;
  if (val >= 10_000) return `${(val / 10_000).toFixed(2)}W`;
  return val.toFixed(2);
}

async function fetchOverview() {
  loading.value = true;
  try {
    const res = await getPlatformFinanceOverview({
      currency: currency.value || undefined,
      endDate: endDate.value || undefined,
      startDate: startDate.value || undefined,
    });
    overview.value = res;
    availableCurrencies.value = res.availableCurrencies ?? [];
    if (!currency.value && availableCurrencies.value.length > 0) {
      currency.value = availableCurrencies.value[0];
    }
    renderChart();
  } finally {
    loading.value = false;
  }
}

function renderChart() {
  if (!overview.value?.monthlyTrend?.length) return;

  const months = overview.value.monthlyTrend.map((item) => item.month);
  const grossRevenue = overview.value.monthlyTrend.map(
    (item) => item.grossRevenue,
  );
  const platformIncome = overview.value.monthlyTrend.map(
    (item) => item.platformIncome,
  );
  const commissionExpense = overview.value.monthlyTrend.map(
    (item) => item.commissionExpense,
  );

  renderEcharts({
    grid: {
      bottom: 0,
      containLabel: true,
      left: '1%',
      right: '1%',
      top: '2%',
    },
    legend: {
      data: [
        $t('finance.platformFinance.grossRevenue'),
        $t('finance.platformFinance.platformIncome'),
        $t('finance.platformFinance.commissionExpense'),
      ],
    },
    series: [
      {
        areaStyle: { opacity: 0.15 },
        data: grossRevenue,
        itemStyle: { color: '#5470c6' },
        name: $t('finance.platformFinance.grossRevenue'),
        smooth: true,
        type: 'line',
      },
      {
        areaStyle: { opacity: 0.15 },
        data: platformIncome,
        itemStyle: { color: '#91cc75' },
        name: $t('finance.platformFinance.platformIncome'),
        smooth: true,
        type: 'line',
      },
      {
        areaStyle: { opacity: 0.15 },
        data: commissionExpense,
        itemStyle: { color: '#ee6666' },
        name: $t('finance.platformFinance.commissionExpense'),
        smooth: true,
        type: 'line',
      },
    ],
    tooltip: {
      trigger: 'axis',
    },
    xAxis: {
      axisTick: { show: false },
      boundaryGap: false,
      data: months,
      type: 'category',
    },
    yAxis: {
      type: 'value',
    },
  });
}

const cardItems = computed(() => {
  if (!overview.value) return [];
  const o = overview.value;
  const cur = currency.value || '';
  return [
    {
      title: `${$t('finance.platformFinance.grossRevenue')}${cur ? ` (${cur})` : ''}`,
      value: formatAmount(o.grossRevenue),
      extra: `${$t('finance.platformFinance.grossRevenueCount')}: ${o.grossRevenueCount}`,
    },
    {
      title: `${$t('finance.platformFinance.platformIncome')}${cur ? ` (${cur})` : ''}`,
      value: formatAmount(o.platformIncome),
      extra: '',
    },
    {
      title: `${$t('finance.platformFinance.totalCommissionExpense')}${cur ? ` (${cur})` : ''}`,
      value: formatAmount(o.totalCommissionExpense),
      extra: `User: ${formatAmount(o.userCommissionExpense)} / Tenant Share: ${formatAmount(o.tenantShareExpense)} / Tenant: ${formatAmount(o.tenantCommissionExpense)}`,
    },
    {
      title: `${$t('finance.platformFinance.frozenAmount')}${cur ? ` (${cur})` : ''}`,
      value: formatAmount(o.frozenAmount),
      extra: `${$t('finance.platformFinance.settledAmount')}: ${formatAmount(o.settledAmount)} / ${$t('finance.platformFinance.canceledAmount')}: ${formatAmount(o.canceledAmount)}`,
    },
  ];
});

onMounted(() => {
  fetchOverview();
});

watch([startDate, endDate, currency], () => {
  fetchOverview();
});
</script>

<template>
  <Page auto-content-height>
    <div class="p-4">
      <!-- Filters -->
      <div class="mb-4 flex flex-wrap items-center gap-4">
        <DatePicker
          v-model:value="startDate"
          :placeholder="$t('finance.platformFinance.startDate')"
          style="width: 160px"
        />
        <DatePicker
          v-model:value="endDate"
          :placeholder="$t('finance.platformFinance.endDate')"
          style="width: 160px"
        />
        <Select
          v-model:value="currency"
          :placeholder="$t('finance.platformFinance.currency')"
          style="width: 120px"
        >
          <Select.Option v-for="c in availableCurrencies" :key="c" :value="c">
            {{ c }}
          </Select.Option>
        </Select>
      </div>

      <!-- Overview Cards -->
      <div class="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div
          v-for="item in cardItems"
          :key="item.title"
          class="rounded-lg border bg-card p-4 text-card-foreground shadow-sm"
        >
          <div class="text-sm font-medium text-muted-foreground">
            {{ item.title }}
          </div>
          <div class="mt-1 text-2xl font-bold">
            {{ item.value }}
          </div>
          <div v-if="item.extra" class="mt-1 text-xs text-muted-foreground">
            {{ item.extra }}
          </div>
        </div>
      </div>

      <!-- Monthly Trend Chart -->
      <div class="rounded-lg border bg-card p-4 shadow-sm">
        <h3 class="mb-4 text-base font-semibold">
          {{ $t('finance.platformFinance.monthlyTrend') }}
        </h3>
        <EchartsUI ref="chartRef" style="height: 360px" />
      </div>

      <!-- Currency Breakdown -->
      <div
        v-if="overview?.currencyBreakdown?.length"
        class="mt-4 rounded-lg border bg-card p-4 shadow-sm"
      >
        <h3 class="mb-4 text-base font-semibold">
          {{ $t('finance.platformFinance.currencyBreakdown') }}
        </h3>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead>
              <tr class="border-b">
                <th class="py-2 font-medium">
                  {{ $t('finance.platformFinance.currency') }}
                </th>
                <th class="py-2 font-medium">
                  {{ $t('finance.platformFinance.grossRevenue') }}
                </th>
                <th class="py-2 font-medium">
                  {{ $t('finance.platformFinance.platformIncome') }}
                </th>
                <th class="py-2 font-medium">
                  {{ $t('finance.platformFinance.commissionExpense') }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in overview.currencyBreakdown"
                :key="item.currency"
                class="border-b"
              >
                <td class="py-2">{{ item.currency }}</td>
                <td class="py-2">{{ formatAmount(item.grossRevenue) }}</td>
                <td class="py-2">{{ formatAmount(item.platformIncome) }}</td>
                <td class="py-2">{{ formatAmount(item.commissionExpense) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </Page>
</template>
