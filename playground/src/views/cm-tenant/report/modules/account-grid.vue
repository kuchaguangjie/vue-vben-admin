<script lang="ts" setup>
import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { CmTenantReportApi } from '#/api/cm-tenant';
import type { PageParams } from '#/api/request';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getCmTenantAccountPage } from '#/api/cm-tenant';
import { doPageQuery } from '#/api/request';
import { $t } from '#/locales';
import { usePagerConfig } from '#/utils/pager';

function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'InputNumber',
      fieldName: 'tenantId',
      label: '租户ID',
      componentProps: {
        allowClear: true,
        placeholder: '租户ID',
        style: 'width: 100%',
      },
    },
  ];
}

function useColumns(): VxeTableGridOptions['columns'] {
  return [
    {
      field: 'ownerId',
      title: '租户ID',
      width: 100,
      formatter: ({ cellValue }) => {
        const val = cellValue as number;
        return val === 0 ? '平台' : val;
      },
    },
    {
      field: 'tenantName',
      title: '租户名称',
      width: 200,
    },
    {
      field: 'totalIncome',
      title: $t('cm.report.totalIncome'),
      width: 140,
      formatter: ({ cellValue }) => cellValue?.toFixed(2),
    },
    {
      field: 'availableAmount',
      title: $t('cm.report.availableAmount'),
      width: 140,
      formatter: ({ cellValue }) => cellValue?.toFixed(2),
    },
    {
      field: 'frozenAmount',
      title: $t('cm.report.frozenAmount'),
      width: 140,
      formatter: ({ cellValue }) => cellValue?.toFixed(2),
    },
    {
      field: 'withdrawnAmount',
      title: $t('cm.report.withdrawnAmount'),
      width: 140,
      formatter: ({ cellValue }) => cellValue?.toFixed(2),
    },
    {
      field: 'createdAt',
      title: $t('common.createdAt'),
      width: 160,
      sortable: true,
    },
  ];
}

const [AccountGrid] = useVbenVxeGrid({
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
          return doPageQuery(getCmTenantAccountPage, params, formValues);
        },
      },
    },
    rowConfig: {
      keyField: 'ownerId',
    },
    toolbarConfig: {
      custom: true,
      export: false,
      refresh: true,
      zoom: true,
    },
  } as VxeTableGridOptions<CmTenantReportApi.TenantAccountRow>,
});
</script>

<template>
  <AccountGrid table-title="租户分佣账户" />
</template>
