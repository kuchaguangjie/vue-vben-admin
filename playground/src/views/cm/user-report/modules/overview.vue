<script lang="ts" setup>
import type { CmReportApi } from '#/api/cm/report';

import { computed, ref, watch } from 'vue';

import { Card, Col, Row, Select, Statistic, Tag } from 'ant-design-vue';

import { getCmCommissionStatistics } from '#/api/cm/report';
import { getTenantAll } from '#/api/system/tenant';
import { usePlatformAdmin } from '#/hooks/common/use-platform-admin';
import { $t } from '#/locales';

const { isPlatformAdmin } = usePlatformAdmin();

const statistics = ref<CmReportApi.CommissionStatistics | null>(null);
const statsLoading = ref(false);
const selectedCurrency = ref('CNY');
const selectedTenantId = ref(-1);

const tenants = ref<Array<{ id: number; name: string }>>([]);

const currencyOptions = [
  { label: 'CNY', value: 'CNY' },
  { label: 'USD', value: 'USD' },
];

const tenantOptions = computed(() => {
  return [
    { label: $t('cm.report.allTenant'), value: -1 },
    { label: $t('cm.report.platform'), value: 0 },
    ...tenants.value.map((t) => ({ label: t.name, value: t.id })),
  ];
});

const frozenStyle = { color: '#fa8c16' };
const settledStyle = { color: '#52c41a' };
const cancelledStyle = { color: '#f5222d' };

async function loadTenants() {
  if (!isPlatformAdmin.value) return;
  try {
    tenants.value = await getTenantAll();
  } catch {
    tenants.value = [];
  }
}

async function loadStatistics() {
  statsLoading.value = true;
  try {
    const params: CmReportApi.CommissionStatisticsParams = {
      currency: selectedCurrency.value,
    };
    if (selectedTenantId.value !== -1) {
      params.tenantId = selectedTenantId.value;
    }
    statistics.value = await getCmCommissionStatistics(params);
  } finally {
    statsLoading.value = false;
  }
}

watch(selectedCurrency, () => {
  loadStatistics();
});

watch(selectedTenantId, () => {
  loadStatistics();
});

loadTenants();
loadStatistics();
</script>

<template>
  <div class="mb-4 flex items-center gap-4">
    <Select
      v-model:value="selectedCurrency"
      :options="currencyOptions"
      :placeholder="$t('cm.report.currency')"
      style="width: 120px"
    />
    <Select
      v-if="isPlatformAdmin"
      v-model:value="selectedTenantId"
      :options="tenantOptions"
      :placeholder="$t('cm.report.tenantFilter')"
      style="width: 180px"
    />
  </div>

  <Row :gutter="16" class="mb-4">
    <Col :span="4">
      <Card :loading="statsLoading">
        <Statistic
          :title="$t('cm.report.totalAmount')"
          :value="statistics?.totalAmount ?? 0"
          :precision="2"
        />
      </Card>
    </Col>
    <Col :span="4">
      <Card :loading="statsLoading">
        <Statistic
          :title="$t('cm.report.totalOrders')"
          :value="statistics?.totalOrders ?? 0"
        />
      </Card>
    </Col>
    <Col :span="4">
      <Card :loading="statsLoading">
        <Statistic
          :title="$t('cm.report.totalBeneficiaries')"
          :value="statistics?.totalBeneficiaries ?? 0"
        />
      </Card>
    </Col>
    <Col :span="4">
      <Card :loading="statsLoading">
        <Statistic
          :title="$t('cm.report.frozenAmount')"
          :value="statistics?.frozenAmount ?? 0"
          :precision="2"
          :value-style="frozenStyle"
        />
      </Card>
    </Col>
    <Col :span="4">
      <Card :loading="statsLoading">
        <Statistic
          :title="$t('cm.report.settledAmount')"
          :value="statistics?.settledAmount ?? 0"
          :precision="2"
          :value-style="settledStyle"
        />
      </Card>
    </Col>
    <Col :span="4">
      <Card :loading="statsLoading">
        <Statistic
          :title="$t('cm.report.cancelledAmount')"
          :value="statistics?.cancelledAmount ?? 0"
          :precision="2"
          :value-style="cancelledStyle"
        />
      </Card>
    </Col>
  </Row>

  <Row :gutter="16">
    <Col :span="12">
      <Card :title="$t('cm.report.levelDistribution')">
        <template v-if="statistics?.levelStats?.length">
          <div
            v-for="stat in statistics.levelStats"
            :key="stat.level"
            class="mb-2 flex items-center justify-between"
          >
            <Tag color="blue">
              {{ $t('cm.report.levelN', [stat.level]) }}
            </Tag>
            <span>
              {{ stat.amount.toFixed(2) }}
              ({{ stat.count }}{{ $t('cm.report.orders') }})
            </span>
          </div>
        </template>
        <div v-else class="text-center text-gray-400">
          {{ $t('cm.report.noData') }}
        </div>
      </Card>
    </Col>
    <Col :span="12">
      <Card :title="$t('cm.report.sceneDistribution')">
        <template v-if="statistics?.sceneStats?.length">
          <div
            v-for="stat in statistics.sceneStats"
            :key="stat.sceneKey"
            class="mb-2 flex items-center justify-between"
          >
            <Tag color="purple">{{ stat.sceneKey }}</Tag>
            <span>
              {{ stat.amount.toFixed(2) }}
              ({{ stat.count }}{{ $t('cm.report.orders') }})
            </span>
          </div>
        </template>
        <div v-else class="text-center text-gray-400">
          {{ $t('cm.report.noData') }}
        </div>
      </Card>
    </Col>
  </Row>
</template>
