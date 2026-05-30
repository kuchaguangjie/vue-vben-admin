<script lang="ts" setup>
import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { CmReportApi } from '#/api/cm/report';
import type { PageParams } from '#/api/request';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getCmAccountPage } from '#/api/cm/report';
import { doPageQuery } from '#/api/request';
import { $t } from '#/locales';
import { usePagerConfig } from '#/utils/pager';

function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'InputNumber',
      fieldName: 'userId',
      label: $t('cm.report.userId'),
      componentProps: {
        allowClear: true,
        placeholder: $t('cm.report.userId'),
        style: 'width: 100%',
      },
    },
  ];
}

function useColumns(): VxeTableGridOptions['columns'] {
  return [
    {
      field: 'userId',
      title: $t('cm.report.userId'),
      width: 100,
    },
    {
      field: 'username',
      title: $t('cm.report.username'),
      width: 140,
    },
    {
      field: 'nick',
      title: $t('cm.report.nick'),
      width: 140,
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
          return doPageQuery(getCmAccountPage, params, formValues);
        },
      },
    },
    rowConfig: {
      keyField: 'userId',
    },
    toolbarConfig: {
      custom: true,
      export: false,
      refresh: true,
      search: true,
      zoom: true,
    },
  } as VxeTableGridOptions<CmReportApi.AccountRow>,
});
</script>

<template>
  <AccountGrid :table-title="$t('cm.report.accountList')" />
</template>
