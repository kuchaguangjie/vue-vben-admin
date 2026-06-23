<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { CmTenantWithdrawApi } from '#/api/cm-tenant';
import type { PageParams } from '#/api/request';

import { computed, onMounted, ref, unref, watch } from 'vue';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, Card, Select, Statistic, Tag } from 'ant-design-vue';

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
import ReviewForm from './modules/review-form.vue';

const account = ref<CmTenantWithdrawApi.TenantAccount>({
  totalIncome: 0,
  availableAmount: 0,
  withdrawPending: 0,
  withdrawnAmount: 0,
  frozenAmount: 0,
});

const currency = ref('CNY');

const currencySymbol = computed(() => {
  return currency.value === 'USD' ? '$' : '¥';
});

async function loadAccount(tenantId?: number, cur?: string) {
  try {
    account.value = await getTenantWithdrawAccount(
      tenantId,
      cur || currency.value,
    );
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

const [ReviewDrawer, reviewDrawerApi] = useVbenDrawer({
  connectedComponent: ReviewForm,
  destroyOnClose: true,
});

const { isPlatformAdmin } = usePlatformAdmin();

const tenantIdFilter = ref<number | undefined>();

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
          filteredFormValues.currency = currency.value;
          // 更新 tenantId 筛选，触发卡片刷新
          const tid = filteredFormValues.tenantId;
          tenantIdFilter.value = tid ? Number(tid) : undefined;
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

function onReview(row: CmTenantWithdrawApi.TenantWithdraw) {
  reviewDrawerApi.setData(row).open();
}

function onRefresh() {
  loadAccount(undefined, currency.value);
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

watch(tenantIdFilter, (tid) => {
  loadAccount(tid, currency.value);
});

watch(currency, () => {
  loadAccount(tenantIdFilter.value, currency.value);
  gridApi.query();
});
</script>

<template>
  <Page auto-content-height>
    <ApplyDrawer @success="onRefresh" />
    <AuditDrawer @success="onRefresh" />
    <ReviewDrawer @success="onRefresh" />

    <div class="mb-4 flex items-center gap-4">
      <div class="w-32">
        <div class="mb-1 text-sm text-gray-500">
          {{ $t('cm.tenantWithdraw.currency') }}
        </div>
        <Select
          v-model:value="currency"
          :options="[
            { label: 'CNY', value: 'CNY' },
            { label: 'USD', value: 'USD' },
          ]"
          style="width: 100%"
        />
      </div>
      <div class="grid flex-1 grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <Statistic
            :value="account.totalIncome"
            :precision="2"
            :title="$t('cm.tenantWithdraw.totalIncome')"
            :prefix="currencySymbol"
            :value-style="{ color: '#1890ff' }"
          />
        </Card>
        <Card>
          <Statistic
            :value="account.availableAmount"
            :precision="2"
            :title="$t('cm.tenantWithdraw.availableAmount')"
            :prefix="currencySymbol"
            :value-style="{ color: '#52c41a' }"
          />
        </Card>
        <Card>
          <Statistic
            :value="account.withdrawPending"
            :precision="2"
            :title="$t('cm.tenantWithdraw.withdrawPending')"
            :prefix="currencySymbol"
            :value-style="{ color: '#fa8c16' }"
          />
        </Card>
        <Card>
          <Statistic
            :value="account.withdrawnAmount"
            :precision="2"
            :title="$t('cm.tenantWithdraw.withdrawnAmount')"
            :prefix="currencySymbol"
            :value-style="{ color: '#722ed1' }"
          />
        </Card>
      </div>
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
            v-access:code="['Cm:TenantWithdraw:Review']"
            type="link"
            size="small"
            @click="onReview(row)"
          >
            {{ $t('cm.tenantWithdraw.review') }}
          </Button>
          <Button
            v-if="row.status === 1"
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
