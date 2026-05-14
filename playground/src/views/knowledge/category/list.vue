<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { KnowledgeCategoryApi } from '#/api';
import type { PageParams } from '#/api/request';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { deleteKnowledgeCategory, getKnowledgeCategoryPage } from '#/api';
import { doPageQuery } from '#/api/request';
import { useDeleteAction } from '#/hooks/common/use-delete-action';
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
  deleteApi: deleteKnowledgeCategory,
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
          return doPageQuery(getKnowledgeCategoryPage, params, formValues);
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
  } as VxeTableGridOptions<KnowledgeCategoryApi.KnowledgeCategory>,
});

function onActionClick(
  e: OnActionClickParams<KnowledgeCategoryApi.KnowledgeCategory>,
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

function onEdit(row: KnowledgeCategoryApi.KnowledgeCategory) {
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
    <Grid :table-title="$t('knowledge.category.list')">
      <template #toolbar-tools>
        <Button type="primary" @click="onCreate">
          <Plus class="size-5" />
          {{
            $t('ui.actionTitle.create', [$t('knowledge.category.moduleShort')])
          }}
        </Button>
      </template>

      <template #status="{ row }">
        <a-tag :color="row.status === 1 ? 'green' : 'default'">
          {{ row.status === 1 ? $t('common.enabled') : $t('common.disabled') }}
        </a-tag>
      </template>
    </Grid>
  </Page>
</template>
