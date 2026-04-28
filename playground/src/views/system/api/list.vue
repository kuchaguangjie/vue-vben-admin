<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { SystemApiApi } from '#/api';
import type { PageParams } from '#/api/request';

import { ref } from 'vue';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { deleteApi, getApiTreeWithUserCore, updateApiStatus } from '#/api';
import { doPageQuery } from '#/api/request';
import { useDeleteAction } from '#/hooks/common/use-delete-action';
import { useStatusToggle } from '#/hooks/common/use-status-toggle';
import { useUserCoreMap } from '#/hooks/common/use-user-core-map';
import { $t } from '#/locales';
import { checkAllFieldsEmpty, removeEmptyFields } from '#/utils/object';
import { useDisabledPagerConfig } from '#/utils/pager';

import {
  hasQueryParam,
  useColumns,
  useGridFormSchema,
} from './data';
import Form from './modules/form.vue';

const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: Form,
  destroyOnClose: true,
});

const { userCoreMap, setUserCoreMap } = useUserCoreMap();

const { onStatusChange } = useStatusToggle({
  getRowName: (row) => row.path || row.name,
  updateStatus: updateApiStatus,
  onRefresh: () => gridApi.query(),
});

const { onDelete } = useDeleteAction({
  getRowName: (row) => row.path || row.name,
  deleteApi: deleteApi,
  onRefresh: () => gridApi.query(),
});

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    fieldMappingTime: [['createTime', ['startTime', 'endTime']]],
    schema: useGridFormSchema(),
    submitOnChange: true,
  },
  gridOptions: {
    columns: useColumns(onActionClick, userCoreMap, onStatusChange),
    height: 'auto',
    keepSource: true,
    pagerConfig: useDisabledPagerConfig(),
    proxyConfig: {
      ajax: {
        query: async (params: PageParams, formValues) => {
          formValues = removeEmptyFields(formValues);
          hasQueryParam.value = !checkAllFieldsEmpty(formValues);
          const result = await doPageQuery(
            getApiTreeWithUserCore,
            params,
            formValues,
          );
          setUserCoreMap(result.userCoreMap);
          return result.roots;
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
    treeConfig: {
      rowField: 'id',
      parentField: 'pid',
      childrenField: 'children',
      transform: false,
      showIcon: true,
      trigger: 'default',
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
  } as VxeTableGridOptions<SystemApiApi.SystemApi>,
});

function onActionClick(e: OnActionClickParams<SystemApiApi.SystemApi>) {
  switch (e.code) {
    case 'append': {
      onAppend(e.row);
      break;
    }
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

function onAppend(row: SystemApiApi.SystemApi) {
  formDrawerApi.setData({ pid: row.id }).open();
}

function onEdit(row: SystemApiApi.SystemApi) {
  formDrawerApi.setData(row).open();
}

function onRefresh() {
  gridApi.query();
}

function onCreate() {
  formDrawerApi.setData({}).open();
}

const isExpend = ref(false);
const triggerExpandAll = () => {
  setExpandAll(!isExpend.value);
};

const setExpandAll = (status: boolean) => {
  const grid = gridApi.grid;
  if (grid) {
    isExpend.value = status;
    grid.setAllTreeExpand(status);
  }
};
</script>
<template>
  <Page auto-content-height>
    <FormDrawer @success="onRefresh" />
    <Grid :table-title="$t('system.api.list')">
      <template #toolbar-tools>
        <Button type="primary" @click="onCreate">
          <Plus class="size-5" />
          {{ $t('ui.actionTitle.create', [$t('system.api.menuName')]) }}
        </Button>
        <Button type="primary" @click="triggerExpandAll" class="btn-space">
          {{
            isExpend
              ? $t('ui.actionTitle.collapse')
              : $t('ui.actionTitle.expend')
          }}
        </Button>
      </template>
    </Grid>
  </Page>
</template>

<style lang="scss" scoped>
.btn-space {
  margin-left: 8px;
}
</style>
