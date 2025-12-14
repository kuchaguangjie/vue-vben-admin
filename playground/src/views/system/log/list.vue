<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import { getUserList, type SystemUserApi } from '#/api';

import { Page } from '@vben/common-ui';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getLogList } from '#/api/system/log';
import { $t } from '#/locales';

import { useColumns, useGridFormSchema } from './data';
import { doPageQuery, type PageParams } from '#/api/request';

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
</script>
<template>
  <Page auto-content-height>
    <Grid :table-title="$t('system.log.list')" />
  </Page>
</template>
