import type { Recordable, UserInfo } from '@vben/types';

import { h, ref } from 'vue';
import { useRouter } from 'vue-router';

import { LOGIN_PATH } from '@vben/constants';
import { preferences } from '@vben/preferences';
import { resetAllStores, useAccessStore, useUserStore } from '@vben/stores';

import { notification } from 'ant-design-vue';
import { defineStore } from 'pinia';

import {
  accessCodesQueryOptions,
  loginApi,
  logoutApi,
  userInfoQueryOptions,
} from '#/api';
import { queryClient } from '#/api/query-client';
import { $t } from '#/locales';

export const useAuthStore = defineStore('auth', () => {
  const accessStore = useAccessStore();
  const userStore = useUserStore();
  const router = useRouter();

  const loginLoading = ref(false);

  /**
   * 异步处理登录操作
   * Asynchronously handle the login process
   * @param params 登录表单数据
   * @param onSuccess 成功之后的回调函数
   */
  async function authLogin(
    params: Recordable<any>,
    onSuccess?: () => Promise<void> | void,
  ) {
    // 异步处理用户登录操作并获取 accessToken
    let userInfo: null | UserInfo = null;
    try {
      loginLoading.value = true;
      const { refreshToken, accessToken, removedOldSessions } =
        await loginApi(params);

      // 如果成功获取到 accessToken
      if (accessToken) {
        accessStore.setAccessToken(accessToken);
        accessStore.setRefreshToken(refreshToken);

        // 获取用户信息并存储到 accessStore 中
        const [fetchUserInfoResult, accessCodes] = await Promise.all([
          fetchUserInfo(),
          queryClient.fetchQuery(accessCodesQueryOptions()),
        ]);

        userInfo = fetchUserInfoResult;

        userStore.setUserInfo(userInfo);
        accessStore.setAccessCodes(accessCodes);

        if (accessStore.loginExpired) {
          accessStore.setLoginExpired(false);
        } else {
          onSuccess
            ? await onSuccess?.()
            : await router.push(
                userInfo.homePath || preferences.app.defaultHomePath,
              );
        }

        if (userInfo?.realName) {
          const removedOldSessionsTip =
            removedOldSessions > 0
              ? `(${$t('profile.msg.removedOldSessions', { num: removedOldSessions })})`
              : '';
          notification.success({
            duration: 3,
            message: $t('authentication.loginSuccess'),
            description: h('div', [
              `${$t('authentication.loginSuccessDesc')}:${userInfo?.realName}`,
              removedOldSessionsTip ? h('br') : '',
              removedOldSessionsTip,
            ]),
          });
        }
      }
    } finally {
      loginLoading.value = false;
    }

    return {
      userInfo,
    };
  }

  const isLoggingOut = ref(false); // 正在 logout 标识, 防止 /logout 死循环.

  async function logout(redirect: boolean = true) {
    if (isLoggingOut.value) return; // 正在登出中, 说明已进入循环, 直接返回.
    isLoggingOut.value = true; // 设置 标识

    try {
      await logoutApi();
    } catch {
      // 不做任何处理
    } finally {
      isLoggingOut.value = false; // 重置 标识

      resetAllStores();
      // 清空 queryClient 缓存，避免下一用户登录时拿到上一用户的服务器状态
      // (userInfo / menus / accessCodes / i18nInfo 等)
      queryClient.clear();
      accessStore.setLoginExpired(false);
    }

    // 回登录页带上当前路由地址
    await router.replace({
      path: LOGIN_PATH,
      query: redirect
        ? {
            redirect: encodeURIComponent(router.currentRoute.value.fullPath),
          }
        : {},
    });
  }

  async function fetchUserInfo() {
    // 走 queryClient.fetchQuery：与 profile/base-setting.vue 的 useQuery 共享同一缓存，
    // 同会话内重复调用自动去重，超过 staleTime (30s) 自动重拉保证实时性。
    const userInfo: null | UserInfo = await queryClient.fetchQuery(
      userInfoQueryOptions(),
    );
    userStore.setUserInfo(userInfo);
    return userInfo;
  }

  function $reset() {
    loginLoading.value = false;
  }

  return {
    $reset,
    authLogin,
    fetchUserInfo,
    loginLoading,
    logout,
  };
});
