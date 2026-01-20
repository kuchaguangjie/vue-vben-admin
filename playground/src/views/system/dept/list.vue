<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import type { PageParams } from '#/api/request';
import { doPageQuery } from '#/api/request';
import type { SystemDeptApi } from '#/api/system/dept';
import { deleteDept, getDeptTree } from '#/api/system/dept';

import { ref } from 'vue';

import { Page, useVbenDrawer, useVbenModal } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, message } from 'ant-design-vue';
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

function onPreview(row: any) {
  detailDrawerApi.setData(row).open();
}

/**
 * 编辑部门
 * @param row
 */
function onEdit(row: SystemDeptApi.SystemDept) {
  formModalApi.setData(row).open();
}

/**
 * 添加下级部门
 * @param row
 */
function onAppend(row: SystemDeptApi.SystemDept) {
  formModalApi.setData({ pid: row.id }).open();
}

/**
 * 创建新部门
 */
function onCreate() {
  formModalApi.setData(null).open();
}

/**
 * 删除部门
 * @param row
 */
function onDelete(row: SystemDeptApi.SystemDept) {
  const hideLoading = message.loading({
    content: $t('ui.actionMessage.deleting', [row.name]),
    duration: 0,
    key: 'action_process_msg',
  });
  deleteDept(row.id)
    .then(() => {
      message.success({
        content: $t('ui.actionMessage.deleteSuccess', [row.name]),
        key: 'action_process_msg',
      });
      refreshGrid();
    })
    .catch(() => {
      hideLoading();
    });
}

/**
 * 表格操作按钮的回调函数
 */
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
    columns: useColumns(onActionClick, onPreview),
    height: 'auto',
    keepSource: true,
    pagerConfig: useDisabledPagerConfig(),
    proxyConfig: {
      ajax: {
        query: async (params: PageParams) => {
          isExpend.value = false; // not expend on load
          return await doPageQuery(getDeptTree, params);
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
      showIcon: true, // 显示树节点图标
      trigger: 'default', // 'default'（点击图标）或 'row'（点击整行）
      // 是否显示展开/折叠图标
    },
    sortConfig: {
      remote: true, // 远程排序
      trigger: 'default', // 点击表头触发
      orders: ['asc', 'desc', null], // 排序顺序
    },
    // 启用远程模式
    remote: {
      sort: true, // 远程排序
    },
    // 排序变化事件
    onSortChange() {
      gridApi.query();
    },
  } as VxeTableGridOptions,
});

/**
 * 刷新表格
 */
function refreshGrid() {
  gridApi.query();
}

const isExpend = ref(false);
// toggle 全部节点 展开/折叠
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
    <Grid table-title="部门列表">
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
