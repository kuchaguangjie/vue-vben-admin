<script lang="ts" setup>
import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { CmReportApi } from '#/api/cm/report';
import type { PageParams } from '#/api/request';

import { unref } from 'vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getCmAccountPage } from '#/api/cm/report';
import { doPageQuery } from '#/api/request';
import { usePlatformAdmin } from '#/hooks/common/use-platform-admin';
import { $t } from '#/locales';
import { usePagerConfig } from '#/utils/pager';

const { isPlatformAdmin } = usePlatformAdmin();

function useGridFormSchema(): VbenFormSchema[] {
  const schema: VbenFormSchema[] = [];
  if (unref(isPlatformAdmin)) {
    schema.push({
      component: 'InputNumber',
      fieldName: 'tenantId',
      label: $t('system.tenant.id'),
      componentProps: {
        allowClear: true,
        placeholder: $t('system.tenant.id'),
        style: 'width: 100%',
      },
    });
  }
  schema.push(
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
    {
      component: 'Select',
      fieldName: 'currency',
      label: $t('cm.report.currency'),
      componentProps: {
        allowClear: true,
        options: [
          { label: 'CNY', value: 'CNY' },
          { label: 'USD', value: 'USD' },
        ],
        placeholder: $t('cm.report.currency'),
        style: 'width: 100%',
      },
    },
  );
  return schema;
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
      field: 'tenantName',
      title: $t('system.tenant.name'),
      width: 120,
    },
    {
      field: 'currency',
      title: $t('cm.report.currency'),
      width: 80,
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
          const result = await doPageQuery(
            getCmAccountPage,
            params,
            formValues,
          );
          if (result.items) {
            result.items = result.items.map((item: CmReportApi.AccountRow) => ({
              ...item,
              _rowKey: `${item.userId}_${item.currency}`,
            }));
          }
          return result;
        },
      },
    },
    rowConfig: {
      keyField: '_rowKey',
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
