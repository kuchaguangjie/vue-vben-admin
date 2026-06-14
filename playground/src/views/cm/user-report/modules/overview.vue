<script lang="ts" setup>
import type { CmReportApi } from '#/api/cm/report';

import { ref } from 'vue';

import { Card, Col, Row, Statistic, Tag } from 'ant-design-vue';

import { getCmCommissionStatistics } from '#/api/cm/report';
import { $t } from '#/locales';

const statistics = ref<CmReportApi.CommissionStatistics | null>(null);
const statsLoading = ref(false);

const frozenStyle = { color: '#fa8c16' };
const settledStyle = { color: '#52c41a' };
const cancelledStyle = { color: '#f5222d' };

async function loadStatistics() {
  statsLoading.value = true;
  try {
    statistics.value = await getCmCommissionStatistics({});
  } finally {
    statsLoading.value = false;
  }
}

loadStatistics();
</script>

<template>
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
