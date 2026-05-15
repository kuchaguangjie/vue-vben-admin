<script lang="ts" setup>
import type { VbenFormSchema } from '#/adapter/form';

import { onMounted, ref } from 'vue';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { IconifyIcon } from '@vben/icons';

import { Button, Card, Empty, message, Space, Tag } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { SearchApi, searchKnowledge } from '#/api';

import { categoryOptions, loadCategoryOptions } from '../content/data';
import Detail from '../content/modules/detail.vue';

const [DetailDrawer, detailDrawerApi] = useVbenDrawer({
  destroyOnClose: true,
  connectedComponent: Detail,
});

const searching = ref(false);

const searchFormSchema: VbenFormSchema[] = [
  {
    component: 'Input',
    fieldName: 'q',
    label: '关键词',
    componentProps: {
      placeholder: '请输入搜索关键词',
      allowClear: true,
    },
    rules: 'required',
  },
  {
    component: 'Select',
    fieldName: 'categoryId',
    label: '分类',
    componentProps: {
      options: categoryOptions,
      allowClear: true,
      placeholder: '请选择分类',
    },
  },
  {
    component: 'Input',
    fieldName: 'tags',
    label: '标签',
    componentProps: {
      placeholder: '多个标签用逗号分隔',
      allowClear: true,
    },
  },
  {
    component: 'Select',
    fieldName: 'status',
    label: '状态',
    componentProps: {
      allowClear: true,
      options: [
        { label: '草稿', value: 0 },
        { label: '已发布', value: 1 },
        { label: '已归档', value: 2 },
      ],
      placeholder: '请选择状态',
    },
  },
];

const [SearchForm, searchFormApi] = useVbenForm({
  schema: searchFormSchema,
  showDefaultActions: false,
});

const searchResult = ref<SearchApi.KnowledgeSearchResult>({
  hits: [],
  total: 0,
  page: 1,
  pageSize: 20,
  processingTimeMs: 0,
});

async function handleSearch() {
  const values = await searchFormApi.getValues();
  if (!values.q || !values.q.trim()) {
    message.warning('请输入搜索关键词');
    return;
  }

  searching.value = true;
  try {
    const result = await searchKnowledge({
      ...values,
      tags: values.tags
        ? values.tags
            .split(',')
            .map((t: string) => t.trim())
            .filter(Boolean)
        : undefined,
      page: 1,
      pageSize: 20,
      highlight: true,
    });
    searchResult.value = result;
    message.success(
      `找到 ${result.total} 条结果，耗时 ${result.processingTimeMs}ms`,
    );
  } catch (error) {
    message.error('搜索失败，请稍后重试');
    console.error('搜索失败:', error);
  } finally {
    searching.value = false;
  }
}

async function handleReset() {
  await searchFormApi.resetForm();
  searchResult.value = {
    hits: [],
    total: 0,
    page: 1,
    pageSize: 20,
    processingTimeMs: 0,
  };
}

function onPreview(row: any) {
  detailDrawerApi.setData(row).open();
}

function renderHighlight(text: string, formatted?: string) {
  if (formatted) {
    return formatted;
  }
  return text;
}

onMounted(() => {
  loadCategoryOptions();
});
</script>

<template>
  <Page auto-content-height>
    <DetailDrawer />

    <Card class="mb-4">
      <div class="flex items-center gap-4">
        <div class="flex-1">
          <SearchForm :model="{}" />
        </div>
        <Space>
          <Button type="primary" @click="handleSearch" :loading="searching">
            <IconifyIcon icon="mdi:magnify" class="size-5" />
            搜索
          </Button>
          <Button @click="handleReset"> 重置 </Button>
        </Space>
      </div>
    </Card>

    <Card v-if="searchResult.total > 0" class="mb-4">
      <template #title>
        <span>
          搜索结果 (共 {{ searchResult.total }} 条，耗时
          {{ searchResult.processingTimeMs }}ms)
        </span>
      </template>

      <div class="space-y-4">
        <div
          v-for="item in searchResult.hits"
          :key="item.id"
          class="cursor-pointer rounded-lg border p-4 transition-all hover:border-blue-400 hover:shadow-md"
          @click="onPreview(item)"
        >
          <div class="mb-2 flex items-start justify-between">
            <h3 class="text-lg font-medium text-blue-600">
              <!-- eslint-disable-next-line vue/no-v-html -->
              <span
                v-html="renderHighlight(item.title, item._formatted?.title)"
              >
              </span>
            </h3>
            <Space size="small">
              <Tag v-if="item.categoryName" color="blue">
                {{ item.categoryName }}
              </Tag>
              <Tag v-if="item.language" color="green">
                {{ item.language }}
              </Tag>
              <Tag :color="item.isPrivate ? 'orange' : 'default'">
                {{ item.isPrivate ? '私有' : '公开' }}
              </Tag>
            </Space>
          </div>

          <p class="mb-3 line-clamp-2 text-gray-600">
            <!-- eslint-disable-next-line vue/no-v-html -->
            <span
              v-html="renderHighlight(item.summary, item._formatted?.summary)"
            ></span>
          </p>

          <div class="flex items-center justify-between text-sm text-gray-500">
            <Space size="small" class="flex-wrap">
              <Tag v-for="tag in item.tags" :key="tag" size="small">
                {{ tag }}
              </Tag>
            </Space>
            <Space size="small">
              <span>浏览: {{ item.viewCount }}</span>
              <span>优先级: {{ item.priority }}</span>
              <span>更新: {{ item.updatedAt }}</span>
            </Space>
          </div>
        </div>
      </div>
    </Card>

    <Empty
      v-else-if="
        !searching && searchResult.total === 0 && searchResult.hits.length === 0
      "
      description="暂无搜索结果"
      class="py-12"
    >
      <template #image>
        <IconifyIcon
          icon="mdi:file-search-outline"
          class="size-16 text-gray-400"
        />
      </template>
    </Empty>
  </Page>
</template>
