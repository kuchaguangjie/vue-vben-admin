<script lang="ts" setup>
import { defineAsyncComponent, onMounted, ref } from 'vue';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { IconifyIcon } from '@vben/icons';

import { Button, Card, Empty, message, Space, Tag } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { searchKnowledge, SearchKnowledgeApi } from '#/api';
import { $t } from '#/locales';

import { loadCategoryOptions, useSearchFormSchema } from '../data';

const Detail = defineAsyncComponent(
  () => import('../../knowledge/content/modules/detail.vue'),
);

const [DetailDrawer, detailDrawerApi] = useVbenDrawer({
  destroyOnClose: true,
  connectedComponent: Detail,
});

const searching = ref(false);

const searchFormSchema = useSearchFormSchema();

const [SearchForm, searchFormApi] = useVbenForm({
  schema: searchFormSchema,
  showDefaultActions: false,
});

const searchResult = ref<SearchKnowledgeApi.KnowledgeSearchResult>({
  hits: [],
  total: 0,
  page: 1,
  pageSize: 20,
  processingTimeMs: 0,
});

async function handleSearch() {
  const values = await searchFormApi.getValues();
  if (!values.q || !values.q.trim()) {
    message.warning($t('search.knowledge.pleaseEnterKeyword'));
    return;
  }

  searching.value = true;
  try {
    const result = await searchKnowledge({
      ...values,
      tags: values.tags && values.tags.length > 0 ? values.tags : undefined,
      page: 1,
      pageSize: 20,
      highlight: true,
    });
    searchResult.value = result;
    message.success(
      $t('search.knowledge.searchSuccess', {
        totalCount: result.total,
        timeSpent: result.processingTimeMs,
      }),
    );
  } catch (error) {
    message.error($t('search.knowledge.searchFailed'));
    console.error('Search failed:', error);
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
            {{ $t('search.knowledge.search') }}
          </Button>
          <Button @click="handleReset">
            {{ $t('search.knowledge.reset') }}
          </Button>
        </Space>
      </div>
    </Card>

    <Card v-if="searchResult.total > 0" class="mb-4">
      <template #title>
        <span>
          {{
            $t('search.knowledge.totalResults', {
              totalCount: searchResult.total,
              timeSpent: searchResult.processingTimeMs,
            })
          }}
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
                {{
                  item.isPrivate
                    ? $t('search.knowledge.private')
                    : $t('search.knowledge.public')
                }}
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
              <span>
                {{ $t('search.knowledge.views') }}: {{ item.viewCount }}
              </span>
              <span>
                {{ $t('search.knowledge.priority') }}: {{ item.priority }}
              </span>
              <span>
                {{ $t('search.knowledge.updated') }}: {{ item.updatedAt }}
              </span>
            </Space>
          </div>
        </div>
      </div>
    </Card>

    <Empty
      v-else-if="
        !searching && searchResult.total === 0 && searchResult.hits.length === 0
      "
      :description="$t('search.knowledge.noResults')"
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
