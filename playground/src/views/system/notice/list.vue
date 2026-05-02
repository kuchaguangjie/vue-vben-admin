<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { SystemNoticeApi } from '#/api';
import type { PageParams } from '#/api/request';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { unref } from 'vue';

import { Button } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { deleteNotice, getNoticeListWithUserCore } from '#/api';
import { doPageQuery } from '#/api/request';
import { useDeleteAction } from '#/hooks/common/use-delete-action';
import { usePlatformAdmin } from '#/hooks/common/use-platform-admin';
import { useUserCoreMap } from '#/hooks/common/use-user-core-map';
import { $t } from '#/locales';
import { usePagerConfig } from '#/utils/pager';

import {
  categoryList,
  categoryMap,
  categoryOptions,
  useColumns,
  useGridFormSchema,
} from './data';
import NoticeDetail from './modules/detail.vue';
import Form from './modules/form.vue';

const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: Form,
  destroyOnClose: true,
});
const [DetailDrawer, detailDrawerApi] = useVbenDrawer({
  destroyOnClose: true,
  connectedComponent: NoticeDetail,
});

const { userCoreMap, setUserCoreMap } = useUserCoreMap();
const { isPlatformAdmin } = usePlatformAdmin();

const { onDelete } = useDeleteAction({
  getRowName: (row) => row.title || row.name,
  deleteApi: deleteNotice,
  onRefresh: () => gridApi.query(),
});

function onPreview(row: any) {
  detailDrawerApi.setData(row).open();
}

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    fieldMappingTime: [['createTime', ['startTime', 'endTime']]],
    schema: useGridFormSchema(unref(isPlatformAdmin)),
    submitOnChange: true,
  },
  gridOptions: {
    columns: useColumns(onActionClick, onPreview, userCoreMap),
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
            getNoticeListWithUserCore,
            params,
            filteredFormValues,
          );
          if (result.categoryList) {
            categoryList.value = result.categoryList;
            categoryOptions.value = result.categoryList.map((item: any) => ({
              label: item.name,
              value: item.id,
            }));
            for (const item of result.categoryList) {
              categoryMap.value[item.id] = item.name;
            }
          }
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
  } as VxeTableGridOptions<SystemNoticeApi.SystemNotice>,
});

function onActionClick(e: OnActionClickParams<SystemNoticeApi.SystemNotice>) {
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

function onEdit(row: SystemNoticeApi.SystemNotice) {
  formDrawerApi.setData(row).open();
}

function onRefresh() {
  gridApi.query();
}

function onCreate() {
  formDrawerApi.setData({}).open();
}
</script>
<template>
  <Page auto-content-height>
    <FormDrawer @success="onRefresh" />
    <DetailDrawer />
    <Grid :table-title="$t('system.notice.list')">
      <template #toolbar-tools>
        <Button type="primary" @click="onCreate">
          <Plus class="size-5" />
          {{ $t('ui.actionTitle.create', [$t('system.notice.moduleShort')]) }}
        </Button>
      </template>
    </Grid>
  </Page>
</template>
