<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { KnowledgeContentApi } from '#/api';
import type { PageParams } from '#/api/request';

import { onMounted, ref } from 'vue';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, message, Modal, Popconfirm, Tag } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteKnowledgeContent,
  getKnowledgeCategoryList,
  getKnowledgeContentPage,
  rebuildIndex,
  syncAllKnowledge,
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

const syncing = ref(false);
const rebuilding = ref(false);

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

async function handleSyncAll() {
  if (syncing.value) return;

  syncing.value = true;
  try {
    const result = await syncAllKnowledge();
    message.success(
      `全量同步完成！成功：${result.syncedCount} 条，失败：${result.failedCount} 条`,
    );
    if (result.failedCount > 0) {
      console.warn('同步失败的文档ID:', result.failedIds);
    }
  } catch (error) {
    message.error('全量同步失败，请稍后重试');
    console.error('同步失败:', error);
  } finally {
    syncing.value = false;
  }
}

async function handleRebuildIndex() {
  if (rebuilding.value) return;

  Modal.confirm({
    title: '确认重建索引',
    content:
      '重建索引会删除现有的所有索引数据并重新同步全部知识库文档。此操作可能需要较长时间，确定要继续吗？',
    okText: '确认重建',
    cancelText: '取消',
    okType: 'danger',
    async onOk() {
      rebuilding.value = true;
      try {
        const result = await rebuildIndex();
        message.success(
          `索引重建完成！成功：${result.syncedCount} 条，失败：${result.failedCount} 条`,
        );
        if (result.failedCount > 0) {
          console.warn('同步失败的文档ID:', result.failedIds);
        }
      } catch (error) {
        message.error('索引重建失败，请稍后重试');
        console.error('重建失败:', error);
      } finally {
        rebuilding.value = false;
      }
    },
  });
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

        <Button
          type="default"
          @click="handleSyncAll"
          :loading="syncing"
          class="btn-space"
        >
          <IconifyIcon icon="mdi:database-sync" class="size-5" />
          全量索引
        </Button>

        <Popconfirm
          title="确认重建索引"
          description="此操作会删除现有索引并重新同步所有文档，确定要继续吗？"
          ok-text="确认"
          cancel-text="取消"
          ok-type="danger"
          @confirm="handleRebuildIndex"
        >
          <Button type="default" danger :loading="rebuilding" class="btn-space">
            <IconifyIcon icon="mdi:database-refresh" class="size-5" />
            重建索引
          </Button>
        </Popconfirm>
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

<style lang="scss" scoped>
.btn-space {
  margin-left: 8px;
}
</style>
