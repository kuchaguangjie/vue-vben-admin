<script setup lang="ts">
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import type { SystemNoticeApi } from '#/api';

import { onMounted, ref } from 'vue';

import { Page, useVbenModal } from '@vben/common-ui';

import { Button, message, Tag } from 'ant-design-vue';
import {
  getNoticeDetailForUser,
  getNoticePageForUser,
  readNotice,
} from '#/api/core/notice';
import { $t } from '#/locales';
import { formatBackendTime } from '#/utils/value-format';

const [NoticeModal, modalApi] = useVbenModal();
const currentDetail = ref<any>(null);
const unreadCount = ref(0);

const categoryMap = ref<Record<number, string>>({}); // id > name
function categoryIdToMap(id: number): string {
  return categoryMap.value[id] || '';
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
        fieldName: 'categoryId',
        label: $t('system.notice.category'),
        componentProps: {
          allowClear: true,
          placeholder: $t('common.messages.pleaseSelect'),
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
    toolbarConfig: {
      enabled: false,
    },
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
        field: 'categoryId',
        width: 120,
        sortable: true,
        formatter: ({ cellValue }) => categoryIdToMap(cellValue),
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
            includeTotalUnread: true, // 请求总未读数
          };

          if (sort && sort.field) {
            params.sortBy = sort.field;
            params.sortDesc = sort.order === 'desc';
          }

          const result = await getNoticePageForUser(params);

          // 1. 同步全站未读总数
          if (result && typeof result.totalUnread === 'number') {
            unreadCount.value = result.totalUnread;
          }

          // 2. 动态填充分类下拉框
          if (result?.categoryList) {
            for (const item of result.categoryList) {
              categoryMap.value[item.id] = item.name;
            }
            const options = result.categoryList.map(
              (item: SystemNoticeApi.SystemNoticeCategory) => ({
                label: item.name,
                value: item.id,
              }),
            );
            gridApi.formApi.updateSchema([
              {
                fieldName: 'categoryId',
                componentProps: { options },
              },
            ]);
            // 如果分类列表是动态可变的，可以去掉 isCategoryFilled 的判断，每次都更新
          }

          return result;
        },
      },
    },
  } as VxeTableGridOptions,
});

async function handleView(row: any) {
  try {
    const detail = await getNoticeDetailForUser(row.id);
    currentDetail.value = detail;
    modalApi.open();

    if (row.isRead === false || row.readStatus === 2) {
      const res = await readNotice(row.id);
      // 直接同步 read 接口返回的最新未读数
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
  // 保持沉默，所有数据初始加载都交给 Grid 的 ajax.query
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
              {{ $t('system.notice.category') }}:
              {{ categoryIdToMap(currentDetail.categoryId) }}
            </span>
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
        <div
          class="prose prose-sm max-w-none dark:prose-invert"
          v-html="currentDetail.data"
        ></div>
      </div>
    </NoticeModal>
  </Page>
</template>
