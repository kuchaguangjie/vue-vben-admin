<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { RcRuleGroupApi } from '#/api';
import type { PageParams } from '#/api/request';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, Tag } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteRcRuleGroup,
  getRcRuleGroupPage,
  updateRcRuleGroupStatus,
} from '#/api';
import { doPageQuery } from '#/api/request';
import { useDeleteAction } from '#/hooks/common/use-delete-action';
import { useStatusToggle } from '#/hooks/common/use-status-toggle';
import { $t } from '#/locales';
import { usePagerConfig } from '#/utils/pager';

import { useColumns, useGridFormSchema } from './data';
import Form from './modules/form.vue';

const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: Form,
  destroyOnClose: true,
});

const { onDelete } = useDeleteAction({
  getRowName: (row) => row.name,
  deleteApi: deleteRcRuleGroup,
  onRefresh: () => gridApi.query(),
});

const { onStatusChange } = useStatusToggle({
  getRowName: (row) => row.name,
  updateStatus: async (data: { id: number; status: number }) => {
    return updateRcRuleGroupStatus(data.id, { status: data.status });
  },
  onRefresh: () => gridApi.query(),
});

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useGridFormSchema(),
    submitOnChange: true,
  },
  gridOptions: {
    columns: useColumns(onActionClick),
    height: 'auto',
    keepSource: true,
    pagerConfig: usePagerConfig(),
    proxyConfig: {
      ajax: {
        query: async (params: PageParams, formValues) => {
          return doPageQuery(getRcRuleGroupPage, params, formValues);
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
  } as VxeTableGridOptions<RcRuleGroupApi.RcRuleGroup>,
});

function onActionClick(e: OnActionClickParams<RcRuleGroupApi.RcRuleGroup>) {
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

function onEdit(row: RcRuleGroupApi.RcRuleGroup) {
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
    <Grid :table-title="$t('rc.ruleGroup.list')">
      <template #toolbar-tools>
        <Button type="primary" @click="onCreate">
          <Plus class="size-5" />
          {{ $t('ui.actionTitle.create', [$t('rc.ruleGroup.moduleShort')]) }}
        </Button>
      </template>

      <template #status="{ row }">
        <Tag
          :color="row.status === 1 ? 'green' : 'default'"
          @click="() => onStatusChange(row.status === 1 ? 0 : 1, row)"
        >
          {{ row.status === 1 ? $t('common.enabled') : $t('common.disabled') }}
        </Tag>
      </template>
    </Grid>
  </Page>
</template>
