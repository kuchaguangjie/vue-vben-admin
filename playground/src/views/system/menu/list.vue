<script lang="ts" setup>
import type {
  OnActionClickParams,
  VxeTableGridOptions,
} from '#/adapter/vxe-table';
import type { PageParams } from '#/api/request';

import { ref } from 'vue';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { IconifyIcon, Plus } from '@vben/icons';
import { $t } from '@vben/locales';

import { MenuBadge } from '@vben-core/menu-ui';

import { Button } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { doPageQuery } from '#/api/request';
import {
  deleteMenu,
  getMenuTreeWithUserCore,
  SystemMenuApi,
  updateMenuSort,
  updateMenuStatus,
} from '#/api/system/menu';
import { useDeleteAction } from '#/hooks/common/use-delete-action';
import { useStatusToggle } from '#/hooks/common/use-status-toggle';
import { useUserCoreMap } from '#/hooks/common/use-user-core-map';
import { useDisabledPagerConfig } from '#/utils/pager';

import { useColumns } from './data';
import Form from './modules/form.vue';

const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: Form,
  destroyOnClose: true,
});

const { userCoreMap, setUserCoreMap } = useUserCoreMap();
const menuRoots = ref<SystemMenuApi.SystemMenu[]>([]);

const { onStatusChange } = useStatusToggle({
  getRowName: (row) => row.meta?.title || row.name,
  updateStatus: updateMenuStatus,
  onRefresh: () => gridApi.query(),
});

const { onDelete } = useDeleteAction({
  getRowName: (row) => row.meta?.title || row.name,
  deleteApi: deleteMenu,
  onRefresh: () => gridApi.query(),
});

const [Grid, gridApi] = useVbenVxeGrid({
  gridOptions: {
    columns: useColumns(
      onActionClick,
      userCoreMap,
      onStatusChange,
      canMoveUp,
      canMoveDown,
    ),
    height: 'auto',
    keepSource: true,
    pagerConfig: useDisabledPagerConfig(),
    proxyConfig: {
      ajax: {
        query: async (params: PageParams) => {
          isExpend.value = false;
          const result = await doPageQuery(getMenuTreeWithUserCore, params);
          setUserCoreMap(result.userCoreMap);
          menuRoots.value = result.roots;
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
  } as VxeTableGridOptions,
});

function getSiblings(
  row: SystemMenuApi.SystemMenu,
): SystemMenuApi.SystemMenu[] {
  const roots = menuRoots.value;

  if (row.pid === 0 || !row.pid) {
    return roots;
  }

  function findParent(
    items: SystemMenuApi.SystemMenu[],
  ): null | SystemMenuApi.SystemMenu {
    for (const item of items) {
      if (item.id === Number(row.pid)) {
        return item;
      }
      if (item.children && item.children.length > 0) {
        const found = findParent(item.children);
        if (found) return found;
      }
    }
    return null;
  }

  const parent = findParent(roots);
  return parent?.children || [];
}

function canMoveUp(row: SystemMenuApi.SystemMenu): boolean {
  const siblings = getSiblings(row);
  const index = siblings.findIndex((s) => s.id === row.id);
  return index <= 0;
}

function canMoveDown(row: SystemMenuApi.SystemMenu): boolean {
  const siblings = getSiblings(row);
  const index = siblings.findIndex((s) => s.id === row.id);
  return index === -1 || index >= siblings.length - 1;
}

async function onMoveUp(row: SystemMenuApi.SystemMenu) {
  const siblings = getSiblings(row);
  const index = siblings.findIndex((s) => s.id === row.id);
  if (index <= 0) return;

  const newSiblings = [...siblings];
  [newSiblings[index - 1], newSiblings[index]] = [
    newSiblings[index],
    newSiblings[index - 1],
  ];

  const menuIds = newSiblings.map((s) => s.id);
  await updateMenuSort(menuIds);
  await gridApi.query();
}

async function onMoveDown(row: SystemMenuApi.SystemMenu) {
  const siblings = getSiblings(row);
  const index = siblings.findIndex((s) => s.id === row.id);
  if (index === -1 || index >= siblings.length - 1) return;

  const newSiblings = [...siblings];
  [newSiblings[index], newSiblings[index + 1]] = [
    newSiblings[index + 1],
    newSiblings[index],
  ];

  const menuIds = newSiblings.map((s) => s.id);
  await updateMenuSort(menuIds);
  await gridApi.query();
}

function onActionClick({
  code,
  row,
}: OnActionClickParams<SystemMenuApi.SystemMenu>) {
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
    case 'moveDown': {
      onMoveDown(row);
      break;
    }
    case 'moveUp': {
      onMoveUp(row);
      break;
    }
  }
}

function onRefresh() {
  gridApi.query();
}

function onEdit(row: SystemMenuApi.SystemMenu) {
  formDrawerApi.setData(row).open();
}

function onCreate() {
  formDrawerApi.setData({}).open();
}

function onAppend(row: SystemMenuApi.SystemMenu) {
  formDrawerApi.setData({ pid: row.id }).open();
}

const isExpend = ref(false);

async function triggerExpandAll() {
  await setExpandAll(!isExpend.value);
}

async function setExpandAll(status: boolean) {
  const grid = gridApi.grid;
  if (grid) {
    isExpend.value = status;
    await grid.setAllTreeExpand(status);
  }
}
</script>
<template>
  <Page auto-content-height>
    <FormDrawer @success="onRefresh" />
    <Grid>
      <template #toolbar-tools>
        <Button type="primary" @click="onCreate">
          <Plus class="size-5" />
          {{ $t('ui.actionTitle.create', [$t('system.menu.name')]) }}
        </Button>
        <Button type="primary" @click="triggerExpandAll" class="btn-space">
          {{
            isExpend
              ? $t('ui.actionTitle.collapse')
              : $t('ui.actionTitle.expend')
          }}
        </Button>
      </template>
      <template #title="{ row }">
        <div class="flex w-full items-center gap-1">
          <div class="size-5 flex-shrink-0">
            <IconifyIcon
              v-if="row.type === 'button'"
              icon="carbon:security"
              class="size-full"
            />
            <IconifyIcon
              v-else-if="row.meta?.icon"
              :icon="row.meta?.icon || 'carbon:circle-dash'"
              class="size-full"
            />
          </div>
          <span class="flex-auto">{{ $t(row.meta?.title) }}</span>
          <div class="items-center justify-end"></div>
        </div>
        <MenuBadge
          v-if="row.meta?.badgeType"
          class="menu-badge"
          :badge="row.meta.badge"
          :badge-type="row.meta.badgeType"
          :badge-variants="row.meta.badgeVariants"
        />
      </template>
    </Grid>
  </Page>
</template>
<style lang="scss" scoped>
.menu-badge {
  top: 50%;
  right: 0;
  transform: translateY(-50%);

  & > :deep(div) {
    padding-top: 0;
    padding-bottom: 0;
  }
}

.btn-space {
  margin-left: 8px;
}
</style>
