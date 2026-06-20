<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { CmTenantWithdrawApi } from '#/api/cm-tenant';
import type { PageParams } from '#/api/request';

import { onMounted, ref, unref } from 'vue';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, Card, Statistic, Tag } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  getTenantWithdrawAccount,
  getTenantWithdrawPage,
} from '#/api/cm-tenant';
import { doPageQuery } from '#/api/request';
import { usePlatformAdmin } from '#/hooks/common/use-platform-admin';
import { $t } from '#/locales';
import { usePagerConfig } from '#/utils/pager';

import { useColumns, useGridFormSchema } from './data';
import ApplyForm from './modules/apply-form.vue';
import AuditForm from './modules/audit-form.vue';

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
        query: async (params: PageParams, formValues) => {
          const filteredFormValues = { ...formValues };
          if (!unref(isPlatformAdmin)) {
            delete filteredFormValues.tenantId;
          }
          return doPageQuery(getTenantWithdrawPage, params, filteredFormValues);
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

function onRefresh() {
  loadAccount();
  gridApi.query();
}

const statusColorMap: Record<number, string> = {
  0: 'orange',
  2: 'green',
  3: 'red',
};

const statusTextMap: Record<number, string> = {
  0: $t('cm.tenantWithdraw.statusPending'),
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
        <Button
          v-access:code="['Cm:TenantWithdraw:Apply']"
          type="primary"
          @click="onApply"
        >
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
        <template v-if="isPlatformAdmin">
          <Button
            v-if="row.status === 0"
            v-access:code="['Cm:TenantWithdraw:Audit']"
            type="link"
            size="small"
            @click="onAudit(row)"
          >
            {{ $t('cm.tenantWithdraw.audit') }}
          </Button>
        </template>
      </template>
    </Grid>
  </Page>
</template>
