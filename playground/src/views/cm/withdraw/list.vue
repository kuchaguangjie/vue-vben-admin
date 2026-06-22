<script lang="ts" setup>
import type { CmUserWithdrawApi } from '#/api/cm';

import { unref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { Button, Tag } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getUserWithdrawPage } from '#/api/cm';
import { doPageQuery } from '#/api/request';
import { usePlatformAdmin } from '#/hooks/common/use-platform-admin';
import { $t } from '#/locales';

import { useColumns, useGridFormSchema } from './data';
import AuditForm from './modules/audit-form.vue';
import ReviewForm from './modules/review-form.vue';

const [AuditDrawer, auditDrawerApi] = useVbenDrawer({
  connectedComponent: AuditForm,
  destroyOnClose: true,
});

const [ReviewDrawer, reviewDrawerApi] = useVbenDrawer({
  connectedComponent: ReviewForm,
  destroyOnClose: true,
});

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

const { isPlatformAdmin } = usePlatformAdmin();

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useGridFormSchema(unref(isPlatformAdmin)),
    submitOnChange: true,
  },
  gridOptions: {
    columns: useColumns(),
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
    proxyConfig: {
      ajax: {
        query: async (params, formValues) => {
          if (!unref(isPlatformAdmin)) {
            delete formValues.tenantId;
          }
          return doPageQuery(getUserWithdrawPage, params, formValues);
        },
      },
    },
  },
  gridEvents: {
    cellClick: (_row: { row: CmUserWithdrawApi.UserWithdraw }) => {
      // no-op
    },
  },
});

function onRefresh() {
  gridApi.query();
}

function onAudit(row: CmUserWithdrawApi.UserWithdraw) {
  auditDrawerApi.setData(row).open();
}

function onReview(row: CmUserWithdrawApi.UserWithdraw) {
  reviewDrawerApi.setData(row).open();
}
</script>

<template>
  <div>
    <AuditDrawer @success="onRefresh" />
    <ReviewDrawer @success="onRefresh" />

    <Grid :table-title="$t('cm.userWithdraw.module')">
      <template #status="{ row }">
        <Tag :color="statusColorMap[row.status]">
          {{ statusTextMap[row.status] }}
        </Tag>
      </template>

      <template #operation="{ row }">
        <Button
          v-if="row.status === 0"
          v-access:code="['Cm:UserWithdraw:Review']"
          type="link"
          size="small"
          @click="onReview(row)"
        >
          {{ $t('cm.userWithdraw.review') }}
        </Button>
        <Button
          v-if="row.status === 1"
          v-access:code="['Cm:UserWithdraw:Audit']"
          type="link"
          size="small"
          @click="onAudit(row)"
        >
          {{ $t('cm.userWithdraw.audit') }}
        </Button>
      </template>
    </Grid>
  </div>
</template>
