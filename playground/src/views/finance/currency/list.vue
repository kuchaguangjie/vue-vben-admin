<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { FinanceCurrencyApi } from '#/api/finance';
import type { PageParams } from '#/api/request';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteCurrency,
  getCurrencyPage,
  updateCurrencyStatus,
} from '#/api/finance';
import { doPageQuery } from '#/api/request';
import { useDeleteAction } from '#/hooks/common/use-delete-action';
import { useStatusToggle } from '#/hooks/common/use-status-toggle';
import { $t } from '#/locales';
import { usePagerConfig } from '#/utils/pager';

import { useColumns, useGridFormSchema } from './data';
import Detail from './modules/detail.vue';
import Form from './modules/form.vue';

const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: Form,
  destroyOnClose: true,
});

const [DetailDrawer, detailDrawerApi] = useVbenDrawer({
  connectedComponent: Detail,
  destroyOnClose: true,
});

const { onDelete } = useDeleteAction({
  getRowName: (row) => row.name,
  deleteApi: deleteCurrency,
  onRefresh: () => gridApi.query(),
});

const { onStatusChange } = useStatusToggle({
  getRowName: (row) => row.name,
  statusMap: {
    false: $t('common.disabled'),
    true: $t('common.enabled'),
  },
  updateStatus: ({ id, status }) =>
    updateCurrencyStatus({ id, enabled: status as boolean }),
  onRefresh: () => gridApi.query(),
});

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useGridFormSchema(),
    submitOnChange: true,
  },
  gridOptions: {
    columns: useColumns(onActionClick, onPreview, onStatusChange),
    height: 'auto',
    keepSource: true,
    pagerConfig: usePagerConfig(),
    proxyConfig: {
      ajax: {
        query: async (params: PageParams, formValues) => {
          return doPageQuery(getCurrencyPage, params, formValues);
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
  } as VxeTableGridOptions<FinanceCurrencyApi.Currency>,
});

function onActionClick(e: OnActionClickParams<FinanceCurrencyApi.Currency>) {
  switch (e.code) {
    case 'delete': {
      onDelete(e.row);
      break;
    }
    case 'edit': {
      onEdit(e.row);
      break;
    }
  }
}

function onPreview(row: FinanceCurrencyApi.Currency) {
  detailDrawerApi.setData(row).open();
}

function onEdit(row: FinanceCurrencyApi.Currency) {
  formDrawerApi.setData(row).open();
}

function onRefresh() {
  gridApi.query();
}

function onCreate() {
  formDrawerApi.setData({}).open();
}
</script>
<template>
  <Page auto-content-height>
    <FormDrawer @success="onRefresh" />
    <DetailDrawer />
    <Grid :table-title="$t('finance.currency.list')">
      <template #toolbar-tools>
        <Button type="primary" @click="onCreate">
          <Plus class="size-5" />
          {{
            $t('ui.actionTitle.create', [$t('finance.currency.moduleShort')])
          }}
        </Button>
      </template>
    </Grid>
  </Page>
</template>
