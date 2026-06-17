<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { FinancePayOrderApi } from '#/api/finance/pay-order';
import type { PageParams } from '#/api/request';

import { unref } from 'vue';

import { Page, useVbenDrawer } from '@vben/common-ui';

import { Tag } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getPayOrderPageWithUserCore } from '#/api/finance/pay-order';
import { doPageQuery } from '#/api/request';
import { usePlatformAdmin } from '#/hooks/common/use-platform-admin';
import { $t } from '#/locales';
import { usePagerConfig } from '#/utils/pager';

import {
  getStatusColor,
  useColumns,
  useGridFormSchema,
  userCoreMapRef,
} from './data';
import Detail from './modules/detail.vue';

const { isPlatformAdmin } = usePlatformAdmin();

const [DetailDrawer, detailDrawerApi] = useVbenDrawer({
  connectedComponent: Detail,
  destroyOnClose: true,
});

function onPreview(row: any) {
  detailDrawerApi.setData(row).open();
}

const statusTextMap: Record<string, string> = {
  pending: $t('finance.payOrder.statusPending'),
  paid: $t('finance.payOrder.statusPaid'),
  failed: $t('finance.payOrder.statusFailed'),
  expired: $t('finance.payOrder.statusExpired'),
  refunded: $t('finance.payOrder.statusRefunded'),
};

const [Grid] = useVbenVxeGrid({
  formOptions: {
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
            getPayOrderPageWithUserCore,
            params,
            filteredFormValues,
          );
          userCoreMapRef.value = result.userCoreMap ?? {};
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
  } as VxeTableGridOptions<FinancePayOrderApi.PayOrder>,
});
</script>
<template>
  <Page auto-content-height>
    <DetailDrawer />
    <Grid :table-title="$t('finance.payOrder.list')">
      <template #status="{ row }">
        <Tag :color="getStatusColor(row.status)">
          {{ statusTextMap[row.status] ?? row.status }}
        </Tag>
      </template>
    </Grid>
  </Page>
</template>
