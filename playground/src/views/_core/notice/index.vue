<script setup lang="ts">
import { ref } from 'vue';

import { Page, useVbenModal } from '@vben/common-ui';

import { Button, message, Tag } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getNoticeDetail, getNoticePage, readNotice } from '#/api/core/notice';

const [NoticeModal, modalApi] = useVbenModal();
const currentDetail = ref<any>(null);

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    // 这里的 schema 会自动生成顶部的搜索表单
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
        component: 'Input',
        fieldName: 'category',
        label: '分类',
      },
    ],
    // 回车自动搜索
    submitOnEnter: true,
  },
  gridOptions: {
    columns: [
      { title: '标题', field: 'title', minWidth: 200 },
      { title: '分类', field: 'category', width: 120 },
      {
        title: '状态',
        field: 'status',
        width: 100,
        slots: { default: 'status' },
      },
      {
        title: '操作',
        width: 100,
        fixed: 'right',
        slots: { default: 'action' },
      },
    ],
    proxyConfig: {
      ajax: {
        query: async ({ page }, formData) => {
          // 这里的 formData 自动包含上面 formOptions 里的 status 和 category
          const res = await getNoticePage({
            page: page.currentPage,
            pageSize: page.pageSize,
            ...formData,
          });
          // 对齐 Vben 适配器要求的数据格式
          return res;
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

    // 逻辑：如果是未读，调用已读接口并局部刷新列表
    if (row.status === 0) {
      await readNotice(row.id);
      gridApi.reload();
    }
  } catch {
    message.error('获取详情失败');
  }
}
</script>

<template>
  <Page title="公告">
    <Grid>
      <template #status="{ row }">
        <Tag :color="row.isRead ? 'default' : 'red'">
          {{ row.isRead ? '已读' : '未读' }}
        </Tag>
      </template>

      <template #action="{ row }">
        <Button type="link" @click="handleView(row)">查看</Button>
      </template>
    </Grid>

    <NoticeModal title="公告详情" :footer="false">
      <div v-if="currentDetail" class="max-h-[70vh] overflow-y-auto p-4">
        <h2 class="mb-2 text-xl font-bold">{{ currentDetail.title }}</h2>
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
