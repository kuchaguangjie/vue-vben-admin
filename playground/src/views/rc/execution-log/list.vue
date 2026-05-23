<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { RcExecutionLogApi } from '#/api';
import type { PageParams } from '#/api/request';

import { ref } from 'vue';

import { Page, useVbenModal } from '@vben/common-ui';
import { RotateCw, X } from '@vben/icons';

import { Button, InputNumber, message, Modal, Tag } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  cleanOldRcExecutionLogs,
  deleteRcExecutionLog,
  getRcExecutionLogPage,
  getRcExecutionLogStatistics,
} from '#/api';
import { doPageQuery } from '#/api/request';
import { useDeleteAction } from '#/hooks/common/use-delete-action';
import { $t } from '#/locales';
import { usePagerConfig } from '#/utils/pager';

import { useColumns, useGridFormSchema } from './data';

const statistics = ref<Record<string, any>>({});

const [CleanModal, cleanModalApi] = useVbenModal({
  dataTransfer: {},
  destroyOnClose: true,
  title: $t('rc.executionLog.cleanOldLogs'),
});

const cleanDays = ref(30);

const { onDelete } = useDeleteAction({
  getRowName: (row) => String(row.id),
  deleteApi: deleteRcExecutionLog,
  onRefresh: () => {
    gridApi.query();
    loadStatistics();
  },
});

function getResultColor(result: string) {
  return result === 'pass' ? 'green' : 'red';
}

function getResultText(result: string) {
  return result === 'pass'
    ? $t('rc.rule.actionPass')
    : $t('rc.rule.actionReject');
}

function getRiskLevelColor(riskLevel: string) {
  switch (riskLevel) {
    case 'critical': {
      return 'red-inverse';
    }
    case 'high': {
      return 'red';
    }
    case 'low': {
      return 'green';
    }
    case 'medium': {
      return 'orange';
    }
    default: {
      return 'default';
    }
  }
}

function getRiskLevelText(riskLevel: string) {
  switch (riskLevel) {
    case 'critical': {
      return $t('rc.rule.riskLevelCritical');
    }
    case 'high': {
      return $t('rc.rule.riskLevelHigh');
    }
    case 'low': {
      return $t('rc.rule.riskLevelLow');
    }
    case 'medium': {
      return $t('rc.rule.riskLevelMedium');
    }
    default: {
      return riskLevel;
    }
  }
}

async function loadStatistics() {
  try {
    statistics.value = await getRcExecutionLogStatistics(7);
  } catch {
    console.error('Failed to load statistics');
  }
}

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useGridFormSchema(),
    submitOnChange: false,
  },
  gridOptions: {
    columns: useColumns(onActionClick),
    height: 'auto',
    keepSource: true,
    pagerConfig: usePagerConfig(),
    proxyConfig: {
      ajax: {
        query: async (params: PageParams, formValues) => {
          return doPageQuery(getRcExecutionLogPage, params, formValues);
        },
      },
    },
    rowConfig: {
      keyField: 'id',
    },
    toolbarConfig: {
      custom: true,
      export: false,
      refresh: true,
      search: true,
      zoom: true,
    },
    sortConfig: {
      remote: true,
      trigger: 'default',
      orders: ['asc', 'desc', null],
    },
    remote: {
      sort: true,
    },
    onSortChange() {
      gridApi.query();
    },
  } as VxeTableGridOptions<RcExecutionLogApi.RcExecutionLog>,
});

function onActionClick(
  e: OnActionClickParams<RcExecutionLogApi.RcExecutionLog>,
) {
  switch (e.code) {
    case 'delete': {
      onDelete(e.row);
      break;
    }
  }
}

function onRefresh() {
  gridApi.query();
  loadStatistics();
}

async function onCleanOldLogs() {
  try {
    await cleanModalApi.open();
  } catch {
    console.error('Failed to open clean modal');
  }
}

async function handleClean() {
  Modal.confirm({
    title: $t('ui.dialog.confirmTitle'),
    content: $t('rc.executionLog.confirmClean', [cleanDays.value]),
    onOk: async () => {
      try {
        await cleanOldRcExecutionLogs({ days: cleanDays.value });
        message.success($t('ui.message.success'));
        cleanModalApi.close();
        onRefresh();
      } catch {
        message.error($t('ui.message.failed'));
      }
    },
  });
}

loadStatistics();
</script>

<template>
  <Page auto-content-height>
    <CleanModal @confirm="handleClean">
      <div class="flex items-center gap-4">
        <span>{{ $t('rc.executionLog.cleanDays') }}:</span>
        <InputNumber v-model:value="cleanDays" :min="1" :max="365" />
      </div>
    </CleanModal>

    <div
      class="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4"
      v-if="Object.keys(statistics).length > 0"
    >
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <div class="text-gray-500 dark:text-gray-400">
          {{ $t('rc.executionLog.totalCount') }}
        </div>
        <div class="text-2xl font-bold">
          {{ statistics.total ?? 0 }}
        </div>
      </div>
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <div class="text-gray-500 dark:text-gray-400">
          {{ $t('rc.executionLog.passCount') }}
        </div>
        <div class="text-2xl font-bold text-green-600">
          {{ statistics.passCount ?? 0 }}
        </div>
      </div>
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <div class="text-gray-500 dark:text-gray-400">
          {{ $t('rc.executionLog.rejectCount') }}
        </div>
        <div class="text-2xl font-bold text-red-600">
          {{ statistics.rejectCount ?? 0 }}
        </div>
      </div>
      <div class="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
        <div class="text-gray-500 dark:text-gray-400">
          {{ $t('rc.executionLog.avgExecutionTime') }}
        </div>
        <div class="text-2xl font-bold">
          {{ statistics.avgExecutionTime ?? 0 }} ms
        </div>
      </div>
    </div>

    <Grid :table-title="$t('rc.executionLog.list')">
      <template #toolbar-tools>
        <Button @click="onRefresh">
          <RotateCw class="size-5" />
          {{ $t('common.refresh') }}
        </Button>
        <Button danger disabled @click="onCleanOldLogs">
          <X class="size-5" />
          {{ $t('rc.executionLog.cleanOldLogs') }}
        </Button>
      </template>

      <template #result="{ row }">
        <Tag :color="getResultColor(row.result)">
          {{ getResultText(row.result) }}
        </Tag>
      </template>

      <template #riskLevel="{ row }">
        <Tag :color="getRiskLevelColor(row.riskLevel)">
          {{ getRiskLevelText(row.riskLevel) }}
        </Tag>
      </template>
    </Grid>
  </Page>
</template>
