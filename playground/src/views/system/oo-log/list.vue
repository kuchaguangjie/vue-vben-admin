<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { PageParams } from '#/api/request';
import type { SystemOOLogApi } from '#/api/system/oo-log';

import { Page } from '@vben/common-ui';

import { Tag } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { doPageQuery } from '#/api/request';
import { getOOLogPage } from '#/api/system/oo-log';
import { $t } from '#/locales';
import { usePagerConfig } from '#/utils/pager';

import { getLevelColor, useColumns, useGridFormSchema } from './data';

const [Grid] = useVbenVxeGrid({
  formOptions: {
    fieldMappingTime: [['timeRange', ['startTime', 'endTime']]],
    schema: useGridFormSchema(),
    submitOnChange: true,
  },
  gridOptions: {
    columns: useColumns(),
    height: 'auto',
    keepSource: true,
    pagerConfig: usePagerConfig(),
    proxyConfig: {
      ajax: {
        query: async (params: PageParams, formValues) => {
          return doPageQuery(getOOLogPage, params, formValues);
        },
      },
    },
    rowConfig: {
      keyField: 'requestId',
    },
    toolbarConfig: {
      custom: true,
      export: false,
      refresh: true,
      search: true,
      zoom: true,
    },
    expandConfig: {
      height: 'auto',
      visible: true,
    },
  } as VxeTableGridOptions<SystemOOLogApi.OOLogItem>,
});

function getExpandContent(row: SystemOOLogApi.OOLogItem) {
  return JSON.stringify(row.raw || {}, null, 2);
}
</script>

<template>
  <Page auto-content-height>
    <Grid :table-title="$t('system.ooLog.title')">
      <template #level="{ row }">
        <Tag :color="getLevelColor(row.level)">
          {{ row.level }}
        </Tag>
      </template>
      <template #userId="{ row }">
        {{ row.userId > 0 ? row.userId : '-' }}
      </template>
      <template #expand="{ row }">
        <div class="bg-gray-50 p-4 dark:bg-gray-900">
          <pre class="whitespace-pre-wrap break-words text-sm">{{
            getExpandContent(row)
          }}</pre>
        </div>
      </template>
    </Grid>
  </Page>
</template>

<style scoped>
pre {
  overflow-wrap: break-word;
  white-space: pre-wrap;
}
</style>
