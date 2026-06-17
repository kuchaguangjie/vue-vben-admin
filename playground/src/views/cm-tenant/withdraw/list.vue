<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { CmTenantWithdrawApi } from '#/api/cm-tenant';
import type { PageParams } from '#/api/request';

import { onMounted, ref } from 'vue';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, Card, Statistic, Tag } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  getTenantWithdrawAccount,
  getTenantWithdrawPage,
} from '#/api/cm-tenant';
import { doPageQuery } from '#/api/request';
import { $t } from '#/locales';
import { usePagerConfig } from '#/utils/pager';

import { useColumns, useGridFormSchema } from './data';
import ApplyForm from './modules/apply-form.vue';
import AuditForm from './modules/audit-form.vue';
import ConfirmPaidForm from './modules/confirm-paid-form.vue';

const account = ref<CmTenantWithdrawApi.TenantAccount>({
  totalIncome: 0,
  availableAmount: 0,
  withdrawPending: 0,
  withdrawnAmount: 0,
  frozenAmount: 0,
});

async function loadAccount() {
  try {
    account.value = await getTenantWithdrawAccount();
  } catch {
    // 忽略错误，使用默认值
  }
}

const [ApplyDrawer, applyDrawerApi] = useVbenDrawer({
  connectedComponent: ApplyForm,
  destroyOnClose: true,
});

const [AuditDrawer, auditDrawerApi] = useVbenDrawer({
  connectedComponent: AuditForm,
  destroyOnClose: true,
});

const [ConfirmPaidDrawer, confirmPaidDrawerApi] = useVbenDrawer({
  connectedComponent: ConfirmPaidForm,
  destroyOnClose: true,
});

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
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
          return doPageQuery(getTenantWithdrawPage, params, formValues);
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
  } as VxeTableGridOptions<CmTenantWithdrawApi.TenantWithdraw>,
});

function onApply() {
  applyDrawerApi.setData({ account: account.value }).open();
}

function onAudit(row: CmTenantWithdrawApi.TenantWithdraw) {
  auditDrawerApi.setData(row).open();
}

function onConfirmPaid(row: CmTenantWithdrawApi.TenantWithdraw) {
  confirmPaidDrawerApi.setData(row).open();
}

function onRefresh() {
  loadAccount();
  gridApi.query();
}

const statusColorMap: Record<number, string> = {
  0: 'orange',
  1: 'blue',
  2: 'green',
  3: 'red',
};

const statusTextMap: Record<number, string> = {
  0: $t('cm.tenantWithdraw.statusPending'),
  1: $t('cm.tenantWithdraw.statusApproved'),
  2: $t('cm.tenantWithdraw.statusPaid'),
  3: $t('cm.tenantWithdraw.statusRejected'),
};

onMounted(() => {
  loadAccount();
});
</script>

<template>
  <Page auto-content-height>
    <ApplyDrawer @success="onRefresh" />
    <AuditDrawer @success="onRefresh" />
    <ConfirmPaidDrawer @success="onRefresh" />

    <div class="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
      <Card>
        <Statistic
          :value="account.totalIncome"
          :precision="2"
          :title="$t('cm.tenantWithdraw.totalIncome')"
          prefix="¥"
          value-style="color: #1890ff"
        />
      </Card>
      <Card>
        <Statistic
          :value="account.availableAmount"
          :precision="2"
          :title="$t('cm.tenantWithdraw.availableAmount')"
          prefix="¥"
          value-style="color: #52c41a"
        />
      </Card>
      <Card>
        <Statistic
          :value="account.withdrawPending"
          :precision="2"
          :title="$t('cm.tenantWithdraw.withdrawPending')"
          prefix="¥"
          value-style="color: #fa8c16"
        />
      </Card>
      <Card>
        <Statistic
          :value="account.withdrawnAmount"
          :precision="2"
          :title="$t('cm.tenantWithdraw.withdrawnAmount')"
          prefix="¥"
          value-style="color: #722ed1"
        />
      </Card>
    </div>

    <Grid :table-title="$t('cm.tenantWithdraw.module')">
      <template #toolbar-tools>
        <Button type="primary" @click="onApply">
          <Plus class="size-5" />
          {{ $t('cm.tenantWithdraw.apply') }}
        </Button>
      </template>

      <template #status="{ row }">
        <Tag :color="statusColorMap[row.status]">
          {{ statusTextMap[row.status] }}
        </Tag>
      </template>

      <template #operation="{ row }">
        <Button
          v-if="row.status === 0"
          type="link"
          size="small"
          @click="onAudit(row)"
        >
          {{ $t('cm.tenantWithdraw.audit') }}
        </Button>
        <Button
          v-if="row.status === 1"
          type="link"
          size="small"
          @click="onConfirmPaid(row)"
        >
          {{ $t('cm.tenantWithdraw.confirmPaid') }}
        </Button>
      </template>
    </Grid>
  </Page>
</template>
