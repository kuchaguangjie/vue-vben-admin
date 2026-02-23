import type {
  AccessModeType,
  ComponentRecordType,
  GenerateMenuAndRoutesOptions,
} from '@vben/types';

import { generateAccessible } from '@vben/access';
// import { preferences } from '@vben/preferences';

import { message } from 'ant-design-vue';

import { getAllMenusApiRoots } from '#/api';
import { BasicLayout, IFrameView } from '#/layouts';
import { $t } from '#/locales';

const forbiddenComponent = () => import('#/views/_core/fallback/forbidden.vue');

async function generateAccess(options: GenerateMenuAndRoutesOptions) {
  const pageMap: ComponentRecordType = import.meta.glob('../views/**/*.vue');

  const layoutMap: ComponentRecordType = {
    BasicLayout,
    IFrameView,
  };

  // const accessMode = preferences.app.accessMode; // TODO: 这里读不到 ?
  // const accessMode: AccessModeType = 'frontend';
  const accessMode: AccessModeType = 'backend';
  // const accessMode: AccessModeType = 'mixed';

  return await generateAccessible(accessMode, {
    ...options,
    fetchMenuListAsync: async () => {
      message.loading({
        content: `${$t('common.loadingMenu')}...`,
        duration: 1.5,
      });

      return await getAllMenusApiRoots();
    },
    // 可以指定没有权限跳转403页面
    forbiddenComponent,
    // 如果 route.meta.menuVisibleWithForbidden = true
    layoutMap,
    pageMap,
  });
}

export { generateAccess };
