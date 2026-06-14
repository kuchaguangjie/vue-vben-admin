<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { CmTenantReportApi } from '#/api/cm-tenant';

import { Page } from '@vben/common-ui';

import { Tag } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getCmTenantRelation } from '#/api/cm-tenant';
import { usePagerConfig } from '#/utils/pager';

function formatPercent(value: null | number | undefined): string {
  if (value === null || value === undefined) {
    return '-';
  }
  return `${(value * 100).toFixed(2)}%`;
}

function useColumns(): VxeTableGridOptions['columns'] {
  return [
    {
      field: 'id',
      title: '租户ID',
      width: 100,
      sortable: true,
    },
    {
      field: 'name',
      title: '租户名称',
      width: 200,
    },
    {
      field: 'parentId',
      title: '上级租户ID',
      width: 120,
      formatter: ({ cellValue }) => {
        const val = cellValue as number;
        return val > 0 ? val : '-';
      },
    },
    {
      field: 'parentName',
      title: '上级租户名称',
      width: 200,
      formatter: ({ cellValue }) => cellValue || '-',
    },
    {
      field: 'commissionRate',
      title: '租户分佣比例',
      width: 140,
      formatter: ({ cellValue }) => formatPercent(cellValue as null | number),
      slots: { default: 'commissionRate' },
    },
  ];
}

const [Grid] = useVbenVxeGrid({
  gridOptions: {
    columns: useColumns(),
    height: 600,
    keepSource: true,
    pagerConfig: usePagerConfig(),
    proxyConfig: {
      ajax: {
        query: async () => {
          const resp = await getCmTenantRelation();
          return {
            items: resp.items || [],
            total: resp.items?.length || 0,
          };
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
      zoom: true,
    },
  } as VxeTableGridOptions<CmTenantReportApi.TenantRelationItem>,
});
</script>

<template>
  <Page auto-content-height>
    <Grid table-title="租户关系列表">
      <template #commissionRate="{ row }">
        <Tag v-if="row.commissionRate !== null" color="green">
          {{ formatPercent(row.commissionRate) }}
        </Tag>
        <Tag v-else color="default">
          {{ '使用全局默认' }}
        </Tag>
      </template>
    </Grid>
  </Page>
</template>
