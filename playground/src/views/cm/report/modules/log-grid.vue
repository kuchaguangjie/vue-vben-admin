<script lang="ts" setup>
import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { CmReportApi } from '#/api/cm/report';
import type { PageParams } from '#/api/request';

import { Tag } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getCmCommissionLogPage } from '#/api/cm/report';
import { doPageQuery } from '#/api/request';
import { $t } from '#/locales';
import { usePagerConfig } from '#/utils/pager';

const statusMap: Record<number, { color: string; label: string }> = {
  1: { color: 'orange', label: $t('cm.report.frozen') },
  2: { color: 'green', label: $t('cm.report.settled') },
  3: { color: 'red', label: $t('cm.report.cancelled') },
};

function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'orderNo',
      label: $t('cm.report.orderNo'),
      componentProps: {
        allowClear: true,
        placeholder: $t('cm.report.orderNo'),
        style: 'width: 100%',
      },
    },
    {
      component: 'InputNumber',
      fieldName: 'beneficiaryId',
      label: $t('cm.report.beneficiaryId'),
      componentProps: {
        allowClear: true,
        placeholder: $t('cm.report.beneficiaryId'),
        style: 'width: 100%',
      },
    },
    {
      component: 'InputNumber',
      fieldName: 'buyerId',
      label: $t('cm.report.buyerId'),
      componentProps: {
        allowClear: true,
        placeholder: $t('cm.report.buyerId'),
        style: 'width: 100%',
      },
    },
    {
      component: 'Select',
      fieldName: 'status',
      label: $t('common.status'),
      componentProps: {
        allowClear: true,
        options: [
          { label: $t('cm.report.frozen'), value: 1 },
          { label: $t('cm.report.settled'), value: 2 },
          { label: $t('cm.report.cancelled'), value: 3 },
        ],
        placeholder: $t('common.status'),
        style: 'width: 100%',
      },
    },
  ];
}

function useColumns(): VxeTableGridOptions['columns'] {
  return [
    {
      field: 'orderNo',
      title: $t('cm.report.orderNo'),
      width: 160,
    },
    {
      field: 'beneficiaryName',
      title: $t('cm.report.beneficiary'),
      width: 160,
    },
    {
      field: 'buyerName',
      title: $t('cm.report.buyer'),
      width: 160,
    },
    {
      field: 'sceneKey',
      title: $t('cm.report.sceneKey'),
      width: 120,
    },
    {
      field: 'orderAmount',
      title: $t('cm.report.orderAmount'),
      width: 120,
      formatter: ({ cellValue }) => cellValue?.toFixed(2),
    },
    {
      field: 'commissionRate',
      title: $t('cm.report.commissionRate'),
      width: 100,
      formatter: ({ cellValue }) => `${(cellValue * 100).toFixed(2)}%`,
    },
    {
      field: 'amount',
      title: $t('cm.report.amount'),
      width: 120,
      formatter: ({ cellValue }) => cellValue?.toFixed(2),
    },
    {
      field: 'level',
      title: $t('cm.report.level'),
      width: 80,
      formatter: ({ cellValue }) => $t('cm.report.levelN', [cellValue]),
    },
    {
      field: 'status',
      title: $t('common.status'),
      width: 100,
      slots: { default: 'status' },
    },
    {
      field: 'createdAt',
      title: $t('common.createdAt'),
      width: 160,
      sortable: true,
    },
  ];
}

const [LogGrid] = useVbenVxeGrid({
  formOptions: {
    schema: useGridFormSchema(),
    submitOnChange: true,
  },
  gridOptions: {
    columns: useColumns(),
    height: 600,
    keepSource: true,
    pagerConfig: usePagerConfig(),
    proxyConfig: {
      ajax: {
        query: async (params: PageParams, formValues) => {
          return doPageQuery(getCmCommissionLogPage, params, formValues);
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
  } as VxeTableGridOptions<CmReportApi.CommissionLogRow>,
});
</script>

<template>
  <LogGrid :table-title="$t('cm.report.logList')">
    <template #status="{ row }">
      <Tag v-if="statusMap[row.status]" :color="statusMap[row.status]?.color">
        {{ statusMap[row.status]?.label }}
      </Tag>
    </template>
  </LogGrid>
</template>
