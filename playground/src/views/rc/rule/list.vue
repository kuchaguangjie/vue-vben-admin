<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { RcRuleApi } from '#/api';
import type { PageParams } from '#/api/request';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { deleteRcRule, getRcRulePage, updateRcRuleStatus } from '#/api';
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
  deleteApi: deleteRcRule,
  onRefresh: () => gridApi.query(),
});

const { onStatusChange } = useStatusToggle({
  getRowName: (row) => row.name,
  updateStatus: async (data: { id: number; status: number }) => {
    return updateRcRuleStatus(data.id, { status: data.status });
  },
  onRefresh: () => gridApi.query(),
});

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
          return doPageQuery(getRcRulePage, params, formValues);
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
  } as VxeTableGridOptions<RcRuleApi.RcRule>,
});

function onActionClick(e: OnActionClickParams<RcRuleApi.RcRule>) {
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

function onEdit(row: RcRuleApi.RcRule) {
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
    <Grid :table-title="$t('rc.rule.list')">
      <template #toolbar-tools>
        <Button type="primary" @click="onCreate">
          <Plus class="size-5" />
          {{ $t('ui.actionTitle.create', [$t('rc.rule.moduleShort')]) }}
        </Button>
      </template>

      <template #action="{ row }">
        <a-tag :color="row.action === 'pass' ? 'green' : 'red'">
          {{
            row.action === 'pass'
              ? $t('rc.rule.actionPass')
              : $t('rc.rule.actionReject')
          }}
        </a-tag>
      </template>

      <template #riskLevel="{ row }">
        <a-tag :color="getRiskLevelColor(row.riskLevel)">
          {{ getRiskLevelText(row.riskLevel) }}
        </a-tag>
      </template>

      <template #status="{ row }">
        <a-tag
          :color="row.status === 1 ? 'green' : 'default'"
          @click="() => onStatusChange(row.status === 1 ? 0 : 1, row)"
        >
          {{ row.status === 1 ? $t('common.enabled') : $t('common.disabled') }}
        </a-tag>
      </template>
    </Grid>
  </Page>
</template>
