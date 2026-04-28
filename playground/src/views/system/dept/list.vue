<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { PageParams } from '#/api/request';
import type { SystemDeptApi } from '#/api/system/dept';

import { ref } from 'vue';

import { Page, useVbenDrawer, useVbenModal } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { doPageQuery } from '#/api/request';
import { deleteDept, getDeptTreeWithUserCore } from '#/api/system/dept';
import { useDeleteAction } from '#/hooks/common/use-delete-action';
import { useUserCoreMap } from '#/hooks/common/use-user-core-map';
import { $t } from '#/locales';
import { useDisabledPagerConfig } from '#/utils/pager';

import { useColumns } from './data';
import DeptDetail from './modules/detail.vue';
import Form from './modules/form.vue';

const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: Form,
  destroyOnClose: true,
});

const [DetailDrawer, detailDrawerApi] = useVbenDrawer({
  connectedComponent: DeptDetail,
});

const { userCoreMap, setUserCoreMap } = useUserCoreMap();

const { onDelete } = useDeleteAction({
  getRowName: (row) => row.name,
  deleteApi: deleteDept,
  onRefresh: () => refreshGrid(),
});

function onPreview(row: any) {
  detailDrawerApi.setData(row).open();
}

function onEdit(row: SystemDeptApi.SystemDept) {
  formModalApi.setData(row).open();
}

function onAppend(row: SystemDeptApi.SystemDept) {
  formModalApi.setData({ pid: row.id }).open();
}

function onCreate() {
  formModalApi.setData(null).open();
}

function onActionClick({
  code,
  row,
}: OnActionClickParams<SystemDeptApi.SystemDept>) {
  switch (code) {
    case 'append': {
      onAppend(row);
      break;
    }
    case 'delete': {
      onDelete(row);
      break;
    }
    case 'edit': {
      onEdit(row);
      break;
    }
  }
}

const [Grid, gridApi] = useVbenVxeGrid({
  gridEvents: {},
  gridOptions: {
    columns: useColumns(onActionClick, onPreview, userCoreMap),
    height: 'auto',
    keepSource: true,
    pagerConfig: useDisabledPagerConfig(),
    proxyConfig: {
      ajax: {
        query: async (params: PageParams) => {
          isExpend.value = false;
          const result = await doPageQuery(getDeptTreeWithUserCore, params);
          setUserCoreMap(result.userCoreMap);
          return result.roots;
        },
      },
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
  } as VxeTableGridOptions,
});

function refreshGrid() {
  gridApi.query();
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
    <FormModal @success="refreshGrid" />
    <Grid :table-title="$t('system.dept.list')">
      <template #toolbar-tools>
        <Button type="primary" @click="onCreate">
          <Plus class="size-5" />
          {{ $t('ui.actionTitle.create', [$t('system.dept.module')]) }}
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
    <DetailDrawer />
  </Page>
</template>

<style lang="scss" scoped>
.btn-space {
  margin-left: 8px;
}
</style>
