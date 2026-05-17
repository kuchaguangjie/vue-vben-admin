<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { KnowledgeContentApi } from '#/api';
import type { PageParams } from '#/api/request';

import { onMounted } from 'vue';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, message, Tag } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteKnowledgeContent,
  getKnowledgeCategoryList,
  getKnowledgeContentPage,
} from '#/api';
import { doPageQuery } from '#/api/request';
import { useDeleteAction } from '#/hooks/common/use-delete-action';
import { $t } from '#/locales';
import { usePagerConfig } from '#/utils/pager';

import {
  categoryList,
  categoryMap,
  categoryOptions,
  useColumns,
  useGridFormSchema,
} from './data';
import Detail from './modules/detail.vue';
import Form from './modules/form.vue';

const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: Form,
  destroyOnClose: true,
});
const [DetailDrawer, detailDrawerApi] = useVbenDrawer({
  destroyOnClose: true,
  connectedComponent: Detail,
});

const { onDelete } = useDeleteAction({
  getRowName: (row) => row.title,
  deleteApi: deleteKnowledgeContent,
  onRefresh: () => gridApi.query(),
});

async function loadCategoryOptions() {
  try {
    const result = await getKnowledgeCategoryList();
    categoryList.value = result;
    categoryOptions.value = result.map((item) => ({
      label: item.name,
      value: item.id,
    }));
    const map: Record<number, string> = {};
    for (const item of result) {
      map[item.id] = item.name;
    }
    categoryMap.value = map;
  } catch {
    message.error($t('ui.message.loadFailed'));
  }
}

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useGridFormSchema(),
    submitOnChange: true,
  },
  gridOptions: {
    columns: useColumns(onActionClick, onPreview),
    height: 'auto',
    keepSource: true,
    pagerConfig: usePagerConfig(),
    proxyConfig: {
      ajax: {
        query: async (params: PageParams, formValues) => {
          return doPageQuery(getKnowledgeContentPage, params, formValues);
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
  } as VxeTableGridOptions<KnowledgeContentApi.KnowledgeContent>,
});

function onActionClick(
  e: OnActionClickParams<KnowledgeContentApi.KnowledgeContent>,
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

function onEdit(row: KnowledgeContentApi.KnowledgeContent) {
  formDrawerApi.setData(row).open();
}

function onRefresh() {
  gridApi.query();
}

function onCreate() {
  formDrawerApi.setData({}).open();
}

function onPreview(row: any) {
  detailDrawerApi.setData(row).open();
}

onMounted(() => {
  loadCategoryOptions();
});
</script>

<template>
  <Page auto-content-height>
    <FormDrawer @success="onRefresh" />
    <DetailDrawer />
    <Grid :table-title="$t('knowledge.content.list')">
      <template #toolbar-tools>
        <Button type="primary" @click="onCreate">
          <Plus class="size-5" />
          {{
            $t('ui.actionTitle.create', [$t('knowledge.content.moduleShort')])
          }}
        </Button>
      </template>

      <template #status="{ row }">
        <Tag
          :color="
            row.status === 1 ? 'green' : row.status === 0 ? 'default' : 'orange'
          "
        >
          {{
            row.status === 0
              ? $t('knowledge.content.statusDraft')
              : row.status === 1
                ? $t('knowledge.content.statusPublished')
                : $t('knowledge.content.statusArchived')
          }}
        </Tag>
      </template>

      <template #isPrivate="{ row }">
        <span :class="row.isPrivate ? 'text-green-600' : 'text-gray-500'">
          {{
            row.isPrivate
              ? $t('knowledge.content.yes')
              : $t('knowledge.content.no')
          }}
        </span>
      </template>
    </Grid>
  </Page>
</template>
