import type { Recordable } from '@vben/types';

import type { CommonType } from '#/api';

import { getTreeAsRoots } from '#/api';
import { requestClient } from '#/api/request';

export namespace SystemMenuApi {
  /** 徽标颜色集合 */
  export const BadgeVariants = [
    'default',
    'destructive',
    'primary',
    'success',
    'warning',
  ] as const;
  /** 徽标类型集合 */
  export const BadgeTypes = ['dot', 'normal'] as const;
  /** 菜单类型集合 */
  export const MenuTypes = [
    'catalog',
    'menu',
    'embedded',
    'link',
    'button',
  ] as const;

  /** 系统菜单 */
  export interface SystemMenu {
    /** 后端权限标识 */
    authCode: string;
    /** 子级 */
    children?: SystemMenu[];
    /** 组件 */
    component?: string;
    /** 菜单ID */
    id: number;
    /** 指定菜单ID（创建时可选，用于自定义ID分配） */
    menuId?: number;
    /** 菜单元数据 */
    meta?: {
      /** 激活时显示的图标 */
      activeIcon?: string;
      /** 作为路由时，需要激活的菜单的Path */
      activePath?: string;
      /** 固定在标签栏 */
      affixTab?: boolean;
      /** 在标签栏固定的顺序 */
      affixTabOrder?: number;
      /** 徽标内容(当徽标类型为normal时有效) */
      badge?: string;
      /** 徽标类型 */
      badgeType?: (typeof BadgeTypes)[number];
      /** 徽标颜色 */
      badgeVariants?: (typeof BadgeVariants)[number];
      /** 在菜单中隐藏下级 */
      hideChildrenInMenu?: boolean;
      /** 在面包屑中隐藏 */
      hideInBreadcrumb?: boolean;
      /** 在菜单中隐藏 */
      hideInMenu?: boolean;
      /** 在标签栏中隐藏 */
      hideInTab?: boolean;
      /** 菜单图标 */
      icon?: string;
      /** 内嵌Iframe的URL */
      iframeSrc?: string;
      /** 是否缓存页面 */
      keepAlive?: boolean;
      /** 外链页面的URL */
      link?: string;
      /** 同一个路由最大打开的标签数 */
      maxNumOfOpenTab?: number;
      /** 无需基础布局 */
      noBasicLayout?: boolean;
      /** 是否在新窗口打开 */
      openInNewWindow?: boolean;
      /** 菜单排序 */
      order?: number;
      /** 额外的路由参数 */
      query?: Recordable<any>;
      /** 菜单标题 */
      title?: string;
    };
    /** 菜单名称 */
    name: string;
    /** 路由路径 */
    path: string;
    /** 父级ID */
    pid: string;
    /** 重定向 */
    redirect?: string;
    /** 排序值，值越小越靠前 */
    sort: number;
    /** 菜单类型 */
    type: (typeof MenuTypes)[number];
  }
}

/**
 * 获取 菜单 tree
 */
async function getMenuTree(params: Recordable<any>) {
  return requestClient.get<CommonType.Tree<SystemMenuApi.SystemMenu>>(
    '/system/menu/tree',
    { params },
  );
}
async function getMenuTreeRoots(params: Recordable<any>) {
  return getTreeAsRoots<SystemMenuApi.SystemMenu>(getMenuTree, params);
}

async function getMenuTreeWithUserCore(params: Recordable<any>) {
  return requestClient.get<
    CommonType.TreeWithUserCore<SystemMenuApi.SystemMenu>
  >('/system/menu/treeWithUserCore', {
    params,
  });
}

async function isMenuNameExists(
  name: string,
  id?: SystemMenuApi.SystemMenu['id'],
) {
  return requestClient.get<boolean>('/system/menu/name-exists', {
    params: { id, name },
  });
}

async function isMenuPathExists(
  path: string,
  id?: SystemMenuApi.SystemMenu['id'],
) {
  return requestClient.get<boolean>('/system/menu/path-exists', {
    params: { id, path },
  });
}

/**
 * 创建菜单
 * @param data 菜单数据
 */
async function createMenu(
  data: Omit<SystemMenuApi.SystemMenu, 'children' | 'id'> & {
    menuId?: number;
  },
) {
  return requestClient.post('/system/menu', data);
}

async function suggestMenuId(pid: number) {
  return requestClient.get<{ suggestedId: number }>('/system/menu/suggestId', {
    params: { pid },
  });
}

/**
 * 更新菜单状态
 * @param data 爱但数据
 */
async function updateMenuStatus(data: CommonType.UpdateStatus) {
  return requestClient.post(`/system/menu/updateStatus`, data);
}

/**
 * 更新菜单
 *
 * @param id 菜单 ID
 * @param data 菜单数据
 */
async function updateMenu(
  id: number,
  data: Omit<SystemMenuApi.SystemMenu, 'children' | 'id'>,
) {
  return requestClient.put(`/system/menu/${id}`, data);
}

/**
 * 更新菜单排序
 * @param menuIds 按顺序排列的菜单 ID 数组（必须同层级）
 */
async function updateMenuSort(menuIds: number[]) {
  return requestClient.post('/system/menu/updateSort', { menuIds });
}

/**
 * 删除菜单
 * @param id 菜单 ID
 */
async function deleteMenu(id: number) {
  return requestClient.delete(`/system/menu/${id}`);
}

export {
  createMenu,
  deleteMenu,
  getMenuTree,
  getMenuTreeRoots,
  getMenuTreeWithUserCore,
  isMenuNameExists,
  isMenuPathExists,
  suggestMenuId,
  updateMenu,
  updateMenuSort,
  updateMenuStatus,
};
