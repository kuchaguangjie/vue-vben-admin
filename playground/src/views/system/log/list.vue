<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemUserApi } from '#/api';
import type { PageParams } from '#/api/request';

import { Page } from '@vben/common-ui';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getLogTreeWithUserCore } from '#/api';
import { doPageQuery } from '#/api/request';
import { $t } from '#/locales';
import { usePagerConfig } from '#/utils/pager';

import { useColumns, useGridFormSchema, userCoreMapRef } from './data';

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
        query: async (params: PageParams, formValues) => {
          const result = await doPageQuery(
            getLogTreeWithUserCore,
            params,
            formValues,
          );
          userCoreMapRef.value = result.userCoreMap;
          return result;
        },
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
</script>
<template>
  <Page auto-content-height>
    <Grid :table-title="$t('system.log.list')" />
  </Page>
</template>
<style scoped>
/* 确保 pre 标签内的文字换行，防止撑爆弹窗 */
pre {
  overflow-wrap: break-word;
  white-space: pre-wrap;
}
</style>
