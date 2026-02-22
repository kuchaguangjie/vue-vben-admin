<script lang="ts" setup>
import type { Recordable } from '@vben/types';

import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { SystemApiApi } from '#/api';
import type { PageParams } from '#/api/request';

import { ref } from 'vue';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';

import { Button, message } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { deleteApi, getApiTree, updateApiStatus } from '#/api';
import { doPageQuery } from '#/api/request';
import { $t } from '#/locales';
import { confirmDialog } from '#/utils/dialog';
import { checkAllFieldsEmpty, removeEmptyFields } from '#/utils/object';
import { useDisabledPagerConfig } from '#/utils/pager';

import {
  hasQueryParam,
  useColumns,
  useGridFormSchema,
  userCoreMap,
} from './data';
import Form from './modules/form.vue';

const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: Form,
  destroyOnClose: true,
});

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    fieldMappingTime: [['createTime', ['startTime', 'endTime']]],
    schema: useGridFormSchema(),
    submitOnChange: true,
  },
  gridOptions: {
    columns: useColumns(onActionClick, onStatusChange),
    height: 'auto',
    keepSource: true,
    pagerConfig: useDisabledPagerConfig(),
    proxyConfig: {
      ajax: {
        query: async (params: PageParams, formValues) => {
          formValues = removeEmptyFields(formValues);
          hasQueryParam.value = !checkAllFieldsEmpty(formValues);
          const result = await doPageQuery(getApiTree, params, formValues);
          userCoreMap.value = result.userCoreMap;
          return result.topItems;
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

/**
 * 状态开关即将改变
 * @param newStatus 期望改变的状态值
 * @param row 行数据
 * @returns 返回false则中止改变，返回其他值（undefined、true）则允许改变
 */
async function onStatusChange(newStatus: number, row: SystemApiApi.SystemApi) {
  const status: Recordable<string> = {
    0: '禁用',
    1: '启用',
  };
  try {
    await confirmDialog(
      `你要将${row.name}的状态切换为 【${status[newStatus.toString()]}】 吗？`,
      `切换状态`,
    );
    await updateApiStatus({ id: row.id, status: newStatus });
    return true;
  } catch {
    return false;
  }
}

function onAppend(row: SystemApiApi.SystemApi) {
  formDrawerApi.setData({ pid: row.id }).open();
}

function onEdit(row: SystemApiApi.SystemApi) {
  formDrawerApi.setData(row).open();
}

function onDelete(row: SystemApiApi.SystemApi) {
  const hideLoading = message.loading({
    content: $t('ui.actionMessage.deleting', [row.name]),
    duration: 0,
    key: 'action_process_msg',
  });
  deleteApi(row.id)
    .then(() => {
      message.success({
        content: $t('ui.actionMessage.deleteSuccess', [row.name]),
        key: 'action_process_msg',
      });
      onRefresh();
    })
    .catch(() => {
      hideLoading();
    });
}

function onRefresh() {
  gridApi.query();
}

function onCreate() {
  formDrawerApi.setData({}).open();
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
