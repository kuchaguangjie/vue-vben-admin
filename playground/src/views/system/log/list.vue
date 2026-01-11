<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemUserApi } from '#/api';
import type { PageParams } from '#/api/request';

import { Page } from '@vben/common-ui';
import { LucideCopy } from '@vben/icons';

import { useClipboard } from '@vueuse/core';
import { message, Popover } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { doPageQuery } from '#/api/request';
import { getLogList } from '#/api/system/log';
import { $t } from '#/locales';
import { usePagerConfig } from '#/utils/pager';

import { useColumns, useGridFormSchema } from './data';

const [Grid] = useVbenVxeGrid({
  formOptions: {
    fieldMappingTime: [['createTime', ['startTime', 'endTime']]],
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
        query: async (params: PageParams, formValues) =>
          await doPageQuery(getLogList, params, formValues),
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
  } as VxeTableGridOptions<SystemUserApi.SystemUser>,
});

const { copy } = useClipboard();

// 格式化函数, 确保返回值始终是 字符串
const formatValue = (v: any) => {
  if (v === null) return '';
  if (typeof v === 'object') return JSON.stringify(v, null, 2);
  return String(v);
};
const formatValueSingleLine = (v: any) => {
  if (v === null) return '';
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
};

async function handleCopy(value: any) {
  const text = formatValue(value);
  if (!text) return;
  await copy(text);
  message.success($t('common.messages.copied'));
}
</script>
<template>
  <Page auto-content-height>
    <Grid :table-title="$t('system.log.list')">
      <template #copy_column="{ row, column }">
        <div class="group flex min-h-[24px] items-center justify-between px-2">
          <Popover placement="top" :mouse-enter-delay="0.5">
            <template #content>
              <pre class="m-0 text-[12px] leading-relaxed opacity-90">{{
                formatValue(row[column.field])
              }}</pre>
            </template>

            <div class="flex-1 cursor-help truncate">
              {{ formatValueSingleLine(row[column.field]) }}
            </div>
          </Popover>

          <div
            class="invisible ml-2 flex-shrink-0 cursor-pointer text-primary active:opacity-70 group-hover:visible"
            @click.stop="handleCopy(row[column.field])"
          >
            <LucideCopy class="size-4" />
          </div>
        </div>
      </template>
    </Grid>
  </Page>
</template>
<style scoped>
/* 确保 pre 标签内的文字换行，防止撑爆弹窗 */
pre {
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
