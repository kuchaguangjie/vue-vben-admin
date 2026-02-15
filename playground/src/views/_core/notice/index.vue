<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { Page, useVbenModal } from '@vben/common-ui';

import { Button, message, Tag } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  getNoticeCategoryList,
  getNoticeDetail,
  getNoticePage,
  readNotice,
} from '#/api/core/notice';

const [NoticeModal, modalApi] = useVbenModal();
const currentDetail = ref<any>(null);
const categoryOptions = ref<{ label: string; value: string }[]>([]);

// 获取分类列表并更新下拉框
async function fetchCategories() {
  try {
    const list = await getNoticeCategoryList();
    categoryOptions.value = list.map((item) => ({ label: item, value: item }));
    // 更新表单中的下拉选项
    gridApi.formApi.updateSchema([
      {
        fieldName: 'category',
        componentProps: {
          options: categoryOptions.value,
        },
      },
    ]);
  } catch (error) {
    console.error('分类加载失败', error);
  }
}

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    // 自动提交：当表单项值发生变化时自动执行查询
    submitOnChange: true,
    schema: [
      {
        component: 'Select',
        componentProps: {
          options: [
            { label: '全部', value: null },
            { label: '已读', value: 1 },
            { label: '未读', value: 2 },
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
          options: [], // 初始为空，由 fetchCategories 异步填充
          placeholder: '请选择分类',
          allowClear: true,
        },
      },
    ],
  },
  gridOptions: {
    columns: [
      { title: 'ID', field: 'id', width: 80, sortable: true },
      { title: '标题', field: 'title', minWidth: 200, sortable: true },
      { title: '分类', field: 'category', width: 120, sortable: true },
      {
        title: '状态',
        field: 'status',
        width: 100,
        slots: { default: 'status' },
      },
      {
        title: '发布时间',
        field: 'publishedAt',
        width: 180,
        sortable: true,
      },
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
          // Vben 5 会把排序信息放在 sort 对象里
          const params: any = {
            page: page.currentPage,
            pageSize: page.pageSize,
            ...formData,
          };
          if (sort?.field) {
            params.orderField = sort.field;
            params.orderType = sort.order; // 'asc' | 'desc'
          }
          return await getNoticePage(params);
        },
      },
    },
  },
});

async function handleView(row: any) {
  try {
    const detail = await getNoticeDetail(row.id);
    currentDetail.value = detail;
    modalApi.open();

    // 如果未读，调用已读接口
    if (row.status === 0 || !row.isRead) {
      await readNotice(row.id);
      gridApi.reload();
    }
  } catch {
    message.error('详情加载失败');
  }
}

onMounted(() => {
  fetchCategories();
});
</script>

<template>
  <Page title="公告">
    <Grid>
      <template #status="{ row }">
        <Tag :color="row.isRead || row.status === 1 ? 'default' : 'red'">
          {{ row.isRead || row.status === 1 ? '已读' : '未读' }}
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
          <div class="mt-2 flex items-center gap-3 text-xs text-gray-500">
            <span>ID: {{ currentDetail.id }}</span>
            <span>发布于: {{ currentDetail.publishedAt || '未知' }}</span>
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
