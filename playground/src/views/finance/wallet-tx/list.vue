<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { FinanceWalletTxApi } from '#/api';
import type { PageParams } from '#/api/request';

import { unref } from 'vue';

import { Page, useVbenDrawer } from '@vben/common-ui';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getWalletTxPageWithUserCore } from '#/api';
import { doPageQuery } from '#/api/request';
import { usePlatformAdmin } from '#/hooks/common/use-platform-admin';
import { $t } from '#/locales';
import { usePagerConfig } from '#/utils/pager';

import { useColumns, useGridFormSchema, userCoreMapRef } from './data';
import Detail from './modules/detail.vue';

const { isPlatformAdmin } = usePlatformAdmin();

const [DetailDrawer, detailDrawerApi] = useVbenDrawer({
  connectedComponent: Detail,
  destroyOnClose: true,
});

function onPreview(row: any) {
  detailDrawerApi.setData(row).open();
}

const [Grid] = useVbenVxeGrid({
  formOptions: {
    fieldMappingTime: [['createTime', ['startTime', 'endTime']]],
    schema: useGridFormSchema(unref(isPlatformAdmin)),
    submitOnChange: true,
  },
  gridOptions: {
    columns: useColumns(onPreview),
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
            getWalletTxPageWithUserCore,
            params,
            filteredFormValues,
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
  } as VxeTableGridOptions<FinanceWalletTxApi.WalletTx>,
});
</script>
<template>
  <Page auto-content-height>
    <DetailDrawer />
    <Grid :table-title="$t('finance.walletTx.list')" />
  </Page>
</template>
