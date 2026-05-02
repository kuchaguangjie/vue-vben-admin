<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { SystemUserApi } from '#/api';
import type { PageParams } from '#/api/request';

import { unref } from 'vue';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { deleteUser, getUserListWithUserCore, updateUserStatus } from '#/api';
import { doPageQuery } from '#/api/request';
import { useDeleteAction } from '#/hooks/common/use-delete-action';
import { usePlatformAdmin } from '#/hooks/common/use-platform-admin';
import { useStatusToggle } from '#/hooks/common/use-status-toggle';
import { useUserCoreMap } from '#/hooks/common/use-user-core-map';
import { $t } from '#/locales';
import { usePagerConfig } from '#/utils/pager';

import { useColumns, useGridFormSchema } from './data';
import UserDetail from './modules/detail.vue';
import Form from './modules/form.vue';

const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: Form,
  destroyOnClose: true,
});
const [DetailDrawer, detailDrawerApi] = useVbenDrawer({
  destroyOnClose: true,
  connectedComponent: UserDetail,
});

const { userCoreMap, setUserCoreMap } = useUserCoreMap();
const { isPlatformAdmin } = usePlatformAdmin();

const { onStatusChange } = useStatusToggle({
  getRowName: (row) => row.username,
  updateStatus: updateUserStatus,
  onRefresh: () => gridApi.query(),
});

const { onDelete } = useDeleteAction({
  getRowName: (row) => row.username,
  deleteApi: deleteUser,
  onRefresh: () => gridApi.query(),
});

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    fieldMappingTime: [['createTime', ['startTime', 'endTime']]],
    schema: useGridFormSchema(unref(isPlatformAdmin)),
    submitOnChange: true,
  },
  gridOptions: {
    columns: useColumns(onActionClick, onPreview, userCoreMap, onStatusChange),
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
            getUserListWithUserCore,
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
    sortConfig: {
      remote: true,
      trigger: 'default',
      orders: ['asc', 'desc', null],
    },
    remote: {
      sort: true,
    },
    onSortChange() {
      gridApi.query();
    },
  } as VxeTableGridOptions<SystemUserApi.SystemUser>,
});

function onActionClick(e: OnActionClickParams<SystemUserApi.SystemUser>) {
  switch (e.code) {
    case 'delete': {
      onDelete(e.row);
      break;
    }
    case 'edit': {
      onEdit(e.row);
      break;
    }
  }
}

function onEdit(row: SystemUserApi.SystemUser) {
  formDrawerApi.setData(row).open();
}

function onRefresh() {
  gridApi.query();
}

function onCreate() {
  formDrawerApi.setData({}).open();
}

function onPreview(row: any) {
  detailDrawerApi.setData(row).open();
}
</script>
<template>
  <Page auto-content-height>
    <FormDrawer @success="onRefresh" />
    <DetailDrawer />
    <Grid :table-title="$t('system.user.list')">
      <template #toolbar-tools>
        <Button type="primary" @click="onCreate">
          <Plus class="size-5" />
          {{ $t('ui.actionTitle.create', [$t('system.user.module')]) }}
        </Button>
      </template>
    </Grid>
  </Page>
</template>
