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
            { label: '全部', value: null },
            { label: '已读', value: 1 },
            { label: '未读', value: 2 }, // 修正：后端通常 0 是未读，如果是 2 请按实际修改
          ],
        },
        fieldName: 'readStatus',
        label: '状态',
      },
      {
        component: 'Select',
        fieldName: 'category',
        label: '分类',
        componentProps: {
          placeholder: '请选择分类',
          allowClear: true,
        },
      },
    ],
  },
  gridOptions: {
    // 关键：开启远程排序
    sortConfig: {
      remote: true, // 远程排序
      trigger: 'default', // 点击表头触发
      orders: ['asc', 'desc', null], // 排序顺序
    },
    // 启用远程模式
    remote: {
      sort: true, // 远程排序
    },
    // 排序变化事件
    onSortChange() {
      gridApi.query();
    },
    toolbarConfig: {
      slots: {
        buttons: 'toolbar-buttons', // 自定义工具栏左侧按钮
      },
    },
    columns: [
      { title: 'ID', field: 'id', width: 80, sortable: true },
      { title: '标题', field: 'title', minWidth: 200, sortable: true },
      { title: '分类', field: 'category', width: 120, sortable: true },
      {
        title: '状态',
        field: 'isRead',
        width: 100,
        slots: { default: 'status' },
      },
      { title: '发布时间', field: 'publishedAt', width: 180, sortable: true },
      {
        title: '操作',
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

          // 排序处理：点击排序图标时会触发此 query
          if (sort && sort.field) {
            params.sortBy = sort.field;
            params.sortDesc = sort.order === 'desc';
          }

          return await getNoticePage(params);
        },
      },
      afterQuery: () => {
        updateUnreadCount();
      },
    },
  } as VxeTableGridOptions,
});

async function handleView(row: any) {
  try {
    const detail = await getNoticeDetail(row.id);
    currentDetail.value = detail;
    modalApi.open();

    // 如果未读则标记已读
    if (row.isRead === false || row.status === 0) {
      await readNotice(row.id);
      row.isRead = true;
      row.status = 1;
      updateUnreadCount();
    }
  } catch {
    message.error('详情加载失败');
  }
}

onMounted(() => {
  fetchCategories();
  updateUnreadCount();
});
</script>

<template>
  <Page title="公告">
    <template #extra>
      <div v-if="unreadCount > 0" class="flex items-center">
        <Tag color="red" class="cursor-default">
          {{ unreadCount }} 条未读消息
        </Tag>
      </div>
    </template>

    <Grid>
      <template #status="{ row }">
        <Tag :color="row.isRead ? 'default' : 'red'">
          {{ row.isRead ? '已读' : '未读' }}
        </Tag>
      </template>

      <template #action="{ row }">
        <Button type="link" size="small" @click="handleView(row)">查看</Button>
      </template>
    </Grid>

    <NoticeModal title="公告详情" :footer="false">
      <div v-if="currentDetail" class="max-h-[70vh] overflow-y-auto p-4">
        <div class="mb-4">
          <h2 class="text-xl font-bold">{{ currentDetail.title }}</h2>
          <div class="mt-2 flex items-center gap-3 text-xs text-gray-400">
            <span>ID: {{ currentDetail.id }}</span>
            <span>发布时间: {{ currentDetail.publishedAt }}</span>
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
