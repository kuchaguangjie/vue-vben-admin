<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemLogApi } from '#/api';
import type { PageParams } from '#/api/request';

import { unref } from 'vue';

import { Page } from '@vben/common-ui';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getLogListWithUserCore } from '#/api';
import { doPageQuery } from '#/api/request';
import { usePlatformAdmin } from '#/hooks/common/use-platform-admin';
import { useUserCoreMap } from '#/hooks/common/use-user-core-map';
import { $t } from '#/locales';
import { usePagerConfig } from '#/utils/pager';

import { useColumns, useGridFormSchema } from './data';

const { isPlatformAdmin } = usePlatformAdmin();
const { setUserCoreMap } = useUserCoreMap();

const [Grid] = useVbenVxeGrid({
  formOptions: {
    fieldMappingTime: [['createTime', ['startTime', 'endTime']]],
    schema: useGridFormSchema(unref(isPlatformAdmin)),
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
          const filteredFormValues = { ...formValues };
          if (!unref(isPlatformAdmin)) {
            delete filteredFormValues.tenantId;
          }
          const result = await doPageQuery(
            getLogListWithUserCore,
            params,
            filteredFormValues,
          );
          setUserCoreMap(result.userCoreMap);
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
  } as VxeTableGridOptions<SystemLogApi.SystemLog>,
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
