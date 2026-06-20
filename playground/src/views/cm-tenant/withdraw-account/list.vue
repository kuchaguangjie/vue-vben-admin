<script lang="ts" setup>
import type { CmTenantWithdrawAccountApi } from '#/api/cm-tenant';
import type { PageParams } from '#/api/request';

import { unref } from 'vue';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, Tag } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { deleteWithdrawAccount, getWithdrawAccountList } from '#/api/cm-tenant';
import { useDeleteAction } from '#/hooks/common/use-delete-action';
import { usePlatformAdmin } from '#/hooks/common/use-platform-admin';
import { $t } from '#/locales';
import { usePagerConfig } from '#/utils/pager';

import { useColumns, useGridFormSchema } from './data';
import Form from './modules/form.vue';

const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: Form,
  destroyOnClose: true,
});

const { onDelete } = useDeleteAction({
  getRowName: (row) => row.payChannel,
  deleteApi: deleteWithdrawAccount,
  onRefresh: () => gridApi.query(),
});

const { isPlatformAdmin } = usePlatformAdmin();

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
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
        query: async (_params: PageParams, formValues) => {
          const resp = await getWithdrawAccountList();
          let items = resp.list || [];
          if (unref(isPlatformAdmin) && formValues.tenantId) {
            items = items.filter(
              (item) => item.tenantId === Number(formValues.tenantId),
            );
          }
          return {
            items,
            total: items.length,
          };
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
      zoom: true,
    },
  },
});

function onEdit(row: CmTenantWithdrawAccountApi.WithdrawAccount) {
  formDrawerApi.setData(row).open();
}

function onCreate() {
  formDrawerApi.setData({}).open();
}

function onRefresh() {
  gridApi.query();
}

function getPayChannelLabel(channel: string): string {
  const map: Record<string, string> = {
    alipay: $t('cm.tenantWithdrawAccount.payChannelAlipay'),
    bank: $t('cm.tenantWithdrawAccount.payChannelBank'),
    wechat: $t('cm.tenantWithdrawAccount.payChannelWechat'),
  };
  return map[channel] || channel;
}
</script>

<template>
  <Page auto-content-height>
    <FormDrawer @success="onRefresh" />
    <Grid :table-title="$t('cm.tenantWithdrawAccount.module')">
      <template #toolbar-tools>
        <Button
          v-access:code="['Cm:TenantWithdrawAccount:Create']"
          type="primary"
          @click="onCreate"
        >
          <Plus class="size-5" />
          {{
            $t('ui.actionTitle.create', [
              $t('cm.tenantWithdrawAccount.moduleShort'),
            ])
          }}
        </Button>
      </template>

      <template #payChannel="{ row }">
        {{ getPayChannelLabel(row.payChannel) }}
      </template>

      <template #isDefault="{ row }">
        <Tag v-if="row.isDefault" color="green">
          {{ $t('common.yes') }}
        </Tag>
        <Tag v-else color="default">
          {{ $t('common.no') }}
        </Tag>
      </template>

      <template #action="{ row }">
        <Button
          v-access:code="['Cm:TenantWithdrawAccount:Edit']"
          type="link"
          size="small"
          @click="onEdit(row)"
        >
          {{ $t('common.edit') }}
        </Button>
        <Button
          v-access:code="['Cm:TenantWithdrawAccount:Delete']"
          type="link"
          danger
          size="small"
          @click="onDelete(row)"
        >
          {{ $t('common.delete') }}
        </Button>
      </template>
    </Grid>
  </Page>
</template>
