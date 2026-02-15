<script setup lang="ts">
import type { VxeTableGridOptions } from '#/adapter/vxe-table';

import { onMounted, ref } from 'vue';

import { Page, useVbenModal } from '@vben/common-ui';

import { Button, message, Tag } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  countUnreadNotice,
  getNoticeCategoryList,
  getNoticeDetail,
  getNoticePage,
  readNotice,
} from '#/api/core/notice';
import { $t } from '#/locales';
import { formatBackendTime } from '#/utils/value-format';

const [NoticeModal, modalApi] = useVbenModal();
const currentDetail = ref<any>(null);
const unreadCount = ref(0);

// 更新未读总数
async function updateUnreadCount() {
  try {
    const res = await countUnreadNotice();
    unreadCount.value = res.totalUnread || 0;
  } catch (error) {
    console.error('获取未读数失败', error);
  }
}

// 获取分类列表
async function fetchCategories() {
  try {
    const list = await getNoticeCategoryList();
    const options = list.map((item) => ({ label: item, value: item }));
    gridApi.formApi.updateSchema([
      {
        fieldName: 'category',
        componentProps: { options },
      },
    ]);
  } catch {}
}

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    submitOnChange: true,
    schema: [
      {
        component: 'Select',
        componentProps: {
          options: [
            { label: $t('system.notice.readStatusOption.all'), value: null },
            { label: $t('system.notice.readStatusOption.read'), value: 1 },
            { label: $t('system.notice.readStatusOption.unread'), value: 2 },
          ],
        },
        fieldName: 'readStatus',
        label: $t('system.notice.readStatus'),
      },
      {
        component: 'Select',
        fieldName: 'category',
        label: $t('system.notice.category'),
        componentProps: {
          allowClear: true,
        },
      },
    ],
  },
  gridOptions: {
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
    // 【关键修改 1】: 如果不使用工具栏按钮，直接禁用 toolbar 以消除占位
    toolbarConfig: {
      enabled: false,
    },
    // 【关键修改 2】: 最小高度设为 0，防止 Grid 自动撑开
    minHeight: 0,
    size: 'small',
    columns: [
      { title: 'ID', field: 'id', width: 80, sortable: true },
      {
        title: $t('system.notice.title'),
        field: 'title',
        minWidth: 200,
        sortable: true,
      },
      {
        title: $t('system.notice.category'),
        field: 'category',
        width: 120,
        sortable: true,
      },
      {
        title: $t('system.notice.readStatus'),
        field: 'isRead',
        width: 100,
        slots: { default: 'status' },
      },
      {
        title: $t('common.publishedAt'),
        field: 'publishedAt',
        width: 180,
        sortable: true,
        formatter: ({ cellValue }) => formatBackendTime(cellValue),
      },
      {
        title: $t('common.operation'),
        width: 80,
        fixed: 'right',
        slots: { default: 'action' },
      },
    ],
    proxyConfig: {
      ajax: {
        query: async ({ page, sort }, formData) => {
          const params: any = {
            page: page.currentPage,
            pageSize: page.pageSize,
            ...formData,
          };

          if (sort && sort.field) {
            params.sortBy = sort.field;
            params.sortDesc = sort.order === 'desc';
          }

          return await getNoticePage(params);
        },
      },
      // 这里已经删除了 afterQuery，保持“静默”
    },
  } as VxeTableGridOptions,
});

async function handleView(row: any) {
  try {
    const detail = await getNoticeDetail(row.id);
    currentDetail.value = detail;
    modalApi.open();

    if (row.isRead === false || row.readStatus === 2) {
      const res = await readNotice(row.id);
      // 利用 readNotice 返回的 totalUnread 同步，不再发送 countUnread 请求
      if (res && typeof res.totalUnread === 'number') {
        unreadCount.value = res.totalUnread;
      }
      row.isRead = true;
      row.readStatus = 1;
    }
  } catch {
    message.error($t('common.messages.loadFailure'));
  }
}

onMounted(() => {
  fetchCategories();
  updateUnreadCount();
});
</script>

<template>
  <Page :title="$t('system.notice.moduleShort')" content-class="p-2">
    <template #extra>
      <div v-if="unreadCount > 0" class="flex items-center">
        <Tag color="red" class="cursor-default">
          {{ unreadCount }}
          {{ $t('system.notice.readStatusOption.unread') }}
        </Tag>
      </div>
    </template>

    <Grid>
      <template #status="{ row }">
        <Tag :color="row.isRead ? 'default' : 'red'">
          {{
            row.isRead
              ? $t('system.notice.readStatusOption.read')
              : $t('system.notice.readStatusOption.unread')
          }}
        </Tag>
      </template>

      <template #action="{ row }">
        <Button type="link" size="small" @click="handleView(row)">
          {{ $t('common.operationItems.open') }}
        </Button>
      </template>
    </Grid>

    <NoticeModal :title="$t('system.notice.detail')" :footer="false">
      <div v-if="currentDetail" class="max-h-[70vh] overflow-y-auto p-4">
        <div class="mb-4">
          <h2 class="text-xl font-bold">{{ currentDetail.title }}</h2>
          <div class="mt-2 flex items-center gap-3 text-xs text-gray-400">
            <span>ID: {{ currentDetail.id }}</span>
            <span>
              {{ $t('common.publishedAt') }}:
              {{ formatBackendTime(currentDetail.publishedAt) }}
            </span>
          </div>
        </div>
        <div class="mb-4 flex gap-2">
          <Tag v-for="tag in currentDetail.tags" :key="tag" color="blue">
            {{ tag }}
          </Tag>
        </div>
        <hr class="my-4" />
        <div class="prose prose-sm max-w-none dark:prose-invert"></div>
      </div>
    </NoticeModal>
  </Page>
</template>

<style scoped>
/* 【关键修改 3】: 强制移除 Vben 组件内部残留的间距 */
:deep(.vben-vxe-grid) {
  padding-top: 0 !important;
}

:deep(.vben-vxe-grid__form-wrapper) {
  padding-bottom: 0 !important;
  margin-bottom: 0 !important;
}

/* 移除工具栏占位高度 */
:deep(.vxe-tools--wrapper),
:deep(.vxe-toolbar) {
  display: none !important;
  height: 0 !important;
  min-height: 0 !important;
  padding: 0 !important;
  margin: 0 !important;
}

:deep(.ant-form) {
  padding-bottom: 8px !important;
}
</style>
