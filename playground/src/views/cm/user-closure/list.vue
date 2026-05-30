<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { CmUserClosureApi } from '#/api/cm/user-closure';
import type { PageParams } from '#/api/request';

import { Page, useVbenDrawer, useVbenModal } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, message, Modal, Tag } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getCmUserClosurePage, unbindParent } from '#/api/cm/user-closure';
import { doPageQuery } from '#/api/request';
import { $t } from '#/locales';
import { usePagerConfig } from '#/utils/pager';

import { useColumns, useGridFormSchema } from './data';
import BindForm from './modules/bind-form.vue';
import RelationModal from './modules/relation-modal.vue';

const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: BindForm,
  destroyOnClose: true,
});

const [RelationModalComp, relationModalApi] = useVbenModal({
  connectedComponent: RelationModal,
  destroyOnClose: true,
});

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useGridFormSchema(),
    submitOnChange: true,
  },
  gridOptions: {
    columns: useColumns(),
    height: 'auto',
    keepSource: true,
    pagerConfig: usePagerConfig(),
    proxyConfig: {
      ajax: {
        query: async (params: PageParams, formValues) => {
          return doPageQuery(getCmUserClosurePage, params, formValues);
        },
      },
    },
    rowConfig: {
      keyField: 'descendantId',
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
  } as VxeTableGridOptions<CmUserClosureApi.CmUserClosureRow>,
});

function onUnbind(row: CmUserClosureApi.CmUserClosureRow) {
  Modal.confirm({
    title: $t('cm.userClosure.unbindConfirmTitle'),
    content: $t('cm.userClosure.unbindConfirmContent', [
      row.descendantUsername || String(row.descendantId),
      row.ancestorUsername || String(row.ancestorId),
    ]),
    onOk: async () => {
      try {
        await unbindParent({ userId: row.descendantId });
        message.success($t('cm.userClosure.unbindSuccess'));
        gridApi.query();
      } catch {
        // error handled by global interceptor
      }
    },
  });
}

function onViewRelation(row: CmUserClosureApi.CmUserClosureRow) {
  relationModalApi.setData({ userId: row.descendantId }).open();
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
    <RelationModalComp />
    <Grid :table-title="$t('cm.userClosure.list')">
      <template #toolbar-tools>
        <Button type="primary" @click="onCreate">
          <Plus class="size-5" />
          {{ $t('ui.actionTitle.create', [$t('cm.userClosure.moduleShort')]) }}
        </Button>
      </template>

      <template #distance="{ row }">
        <Tag :color="row.distance === 1 ? 'blue' : 'default'">
          {{ $t('cm.userClosure.levelN', [row.distance]) }}
        </Tag>
      </template>

      <template #operation="{ row }">
        <Button type="link" size="small" @click="onViewRelation(row)">
          {{ $t('common.view') }}
        </Button>
        <Button type="link" size="small" danger @click="onUnbind(row)">
          {{ $t('common.unbind') }}
        </Button>
      </template>
    </Grid>
  </Page>
</template>
