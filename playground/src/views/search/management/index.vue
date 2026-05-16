<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';
import { IconifyIcon } from '@vben/icons';

import {
  Button,
  Card,
  Descriptions,
  message,
  Modal,
  Space,
  Tag,
} from 'ant-design-vue';

import {
  getIndexStats,
  rebuildIndex,
  SearchKnowledgeApi,
  syncAllKnowledge,
} from '#/api/search/knowledge';
import { $t } from '#/locales';

const loading = ref(false);
const syncing = ref(false);
const rebuilding = ref(false);
const stats = ref<SearchKnowledgeApi.IndexStats>();

async function loadStats() {
  loading.value = true;
  try {
    stats.value = await getIndexStats();
  } catch (error) {
    message.error($t('search.management.loadStatsFailed'));
    console.error('Failed to load index stats:', error);
  } finally {
    loading.value = false;
  }
}

async function handleSyncAll() {
  if (syncing.value) return;

  syncing.value = true;
  try {
    const result = await syncAllKnowledge();
    message.success(
      $t('search.management.syncSuccess', {
        success: result.syncedCount,
        failed: result.failedCount,
      }),
    );
    if (result.failedCount > 0 && result.failedIds) {
      console.warn('Failed document IDs:', result.failedIds);
    }
    await loadStats();
  } catch (error) {
    message.error($t('search.management.syncFailed'));
    console.error('Sync failed:', error);
  } finally {
    syncing.value = false;
  }
}

function handleRebuildIndex() {
  Modal.confirm({
    title: $t('search.management.confirmRebuild'),
    content: $t('search.management.rebuildConfirmMessage'),
    okText: $t('search.management.confirmRebuildButton'),
    cancelText: $t('search.management.cancelButton'),
    okType: 'danger',
    async onOk() {
      rebuilding.value = true;
      try {
        const result = await rebuildIndex();
        message.success(
          $t('search.management.rebuildSuccess', {
            success: result.syncedCount,
            failed: result.failedCount,
          }),
        );
        if (result.failedCount > 0 && result.failedIds) {
          console.warn('Failed document IDs:', result.failedIds);
        }
        await loadStats();
      } catch (error) {
        message.error($t('search.management.rebuildFailed'));
        console.error('Rebuild failed:', error);
      } finally {
        rebuilding.value = false;
      }
    },
  });
}

function formatSize(bytes?: number): string {
  if (!bytes) return '-';
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString();
}

onMounted(() => {
  loadStats();
});
</script>

<template>
  <Page auto-content-height>
    <Card
      :title="$t('search.management.indexStatus')"
      class="mb-4"
      :loading="loading"
    >
      <template #extra>
        <Button @click="loadStats" :loading="loading">
          <IconifyIcon icon="mdi:refresh" class="mr-1" />
          {{ $t('search.management.refresh') }}
        </Button>
      </template>

      <Descriptions :column="2" bordered>
        <Descriptions.Item :label="$t('search.management.indexName')">
          <Tag color="blue">{{ stats?.indexUid || '-' }}</Tag>
        </Descriptions.Item>
        <Descriptions.Item :label="$t('search.management.documentCount')">
          <Tag color="green">{{ stats?.numberOfDocuments || 0 }}</Tag>
        </Descriptions.Item>
        <Descriptions.Item :label="$t('search.management.indexSize')">
          {{ formatSize(stats?.fieldDistributionSize) }}
        </Descriptions.Item>
        <Descriptions.Item :label="$t('search.management.fieldCount')">
          {{ stats?.fieldCount || 0 }}
        </Descriptions.Item>
        <Descriptions.Item :label="$t('search.management.lastUpdated')">
          {{ formatDate(stats?.updatedAt) }}
        </Descriptions.Item>
        <Descriptions.Item :label="$t('search.management.status')">
          <Tag color="success">{{ $t('search.management.normal') }}</Tag>
        </Descriptions.Item>
      </Descriptions>
    </Card>

    <Card :title="$t('search.management.indexManagement')" class="mb-4">
      <p class="mb-4 text-gray-600">
        {{ $t('search.management.managementDescription') }}
      </p>

      <Space size="large">
        <Button
          type="primary"
          size="large"
          @click="handleSyncAll"
          :loading="syncing"
        >
          <IconifyIcon icon="mdi:database-sync" class="mr-1" />
          {{ $t('search.management.syncAll') }}
        </Button>

        <Button
          danger
          size="large"
          @click="handleRebuildIndex"
          :loading="rebuilding"
        >
          <IconifyIcon icon="mdi:database-refresh" class="mr-1" />
          {{ $t('search.management.rebuildIndex') }}
        </Button>
      </Space>

      <div class="mt-4 space-y-2 text-sm text-gray-500">
        <p>
          <IconifyIcon
            icon="mdi:information-outline"
            class="mr-1 text-blue-500"
          />
          <strong>{{ $t('search.management.syncAll') }}：</strong>
          {{ $t('search.management.syncAllDescription') }}
        </p>
        <p>
          <IconifyIcon icon="mdi:alert-outline" class="mr-1 text-orange-500" />
          <strong>{{ $t('search.management.rebuildIndex') }}：</strong>
          {{ $t('search.management.rebuildIndexDescription') }}
        </p>
      </div>
    </Card>
  </Page>
</template>
