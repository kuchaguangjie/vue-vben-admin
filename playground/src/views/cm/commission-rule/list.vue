<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { CmCommissionRuleApi } from '#/api/cm/commission-rule';
import type { PageParams } from '#/api/request';

import { ref } from 'vue';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, message, Modal } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteCmCommissionRule,
  getCmCommissionRulePage,
  updateCmCommissionRuleStatus,
} from '#/api/cm/commission-rule';
import { doPageQuery } from '#/api/request';
import { $t } from '#/locales';
import { usePagerConfig } from '#/utils/pager';

import { useColumns, useGridFormSchema } from './data';
import Form from './modules/form.vue';

const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: Form,
  destroyOnClose: true,
});

const isToggling = ref(false);
const isDeleting = ref(false);

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useGridFormSchema(),
    submitOnChange: true,
  },
  gridOptions: {
    columns: useColumns(onActionClick, onStatusChange),
    height: 'auto',
    keepSource: true,
    pagerConfig: usePagerConfig(),
    proxyConfig: {
      ajax: {
        query: async (params: PageParams, formValues) => {
          return doPageQuery(getCmCommissionRulePage, params, formValues);
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
  } as VxeTableGridOptions<CmCommissionRuleApi.CmCommissionRule>,
});

function onActionClick(
  e: OnActionClickParams<CmCommissionRuleApi.CmCommissionRule>,
) {
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

function onEdit(row: CmCommissionRuleApi.CmCommissionRule) {
  formDrawerApi.setData(row).open();
}

function onDelete(row: CmCommissionRuleApi.CmCommissionRule) {
  Modal.confirm({
    title: $t('ui.messageBox.confirmTitle'),
    content: $t('ui.messageBox.deleteConfirm', [row.sceneKey]),
    onOk: async () => {
      isDeleting.value = true;
      try {
        await deleteCmCommissionRule(row.id);
        message.success($t('common.deleteSuccess'));
        gridApi.query();
      } finally {
        isDeleting.value = false;
      }
    },
  });
}

async function onStatusChange(
  row: CmCommissionRuleApi.CmCommissionRule,
  value: number,
) {
  isToggling.value = true;
  try {
    await updateCmCommissionRuleStatus({ id: row.id, status: value });
    message.success($t('common.updateSuccess'));
    gridApi.query();
  } finally {
    isToggling.value = false;
  }
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
    <Grid :table-title="$t('cm.commissionRule.list')">
      <template #toolbar-tools>
        <Button type="primary" @click="onCreate">
          <Plus class="size-5" />
          {{
            $t('ui.actionTitle.create', [$t('cm.commissionRule.moduleShort')])
          }}
        </Button>
      </template>
    </Grid>
  </Page>
</template>
