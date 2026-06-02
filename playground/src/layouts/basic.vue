<script lang="ts" setup>
import { computed, onBeforeMount, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';

import { AuthenticationLoginExpiredModal } from '@vben/common-ui';
import { VBEN_DOC_URL, VBEN_GITHUB_URL } from '@vben/constants';
import { useWatermark } from '@vben/hooks';
import { BookOpenText, CircleHelp, SvgGithubIcon } from '@vben/icons';
import {
  BasicLayout,
  LockScreen,
  Notification,
  UserDropdown,
} from '@vben/layouts';
import { preferences } from '@vben/preferences';
import { useAccessStore, useTabbarStore, useUserStore } from '@vben/stores';
import { openWindow } from '@vben/utils';

import { countUnreadNotice } from '#/api';
import { notifications } from '#/hooks/common/use-notify';
import { useWs } from '#/hooks/common/use-ws';
import { $t } from '#/locales';
import { useAppStore, useAuthStore } from '#/store';
import LoginForm from '#/views/_core/authentication/login.vue';

const { setMenuList } = useTabbarStore();
setMenuList([
  'close',
  'affix',
  'maximize',
  'reload',
  'open-in-new-window',
  'close-left',
  'close-right',
  'close-other',
  'close-all',
]);

const router = useRouter();
const userStore = useUserStore();
const authStore = useAuthStore();
const appStore = useAppStore();
const accessStore = useAccessStore();
const { destroyWatermark, updateWatermark } = useWatermark();
const showDot = computed(() =>
  notifications.value.some((item) => !item.isRead),
);

const menus = computed(() => [
  {
    handler: () => {
      router.push({ name: 'Profile' });
    },
    icon: 'lucide:user',
    text: $t('page.auth.profile'),
  },
  {
    handler: () => {
      router.push({ name: 'Notice' });
    },
    icon: 'lucide:megaphone',
    text: $t('page.misc.notice'),
  },
  {
    handler: () => {
      openWindow(VBEN_DOC_URL, {
        target: '_blank',
      });
    },
    icon: BookOpenText,
    text: $t('ui.widgets.document'),
  },
  {
    handler: () => {
      openWindow(VBEN_GITHUB_URL, {
        target: '_blank',
      });
    },
    icon: SvgGithubIcon,
    text: 'GitHub',
  },
  {
    handler: () => {
      openWindow(`${VBEN_GITHUB_URL}/issues`, {
        target: '_blank',
      });
    },
    icon: CircleHelp,
    text: $t('ui.widgets.qa'),
  },
]);

const avatar = computed(() => {
  return userStore.userInfo?.avatar;
});

const userEmail = computed(() => {
  return userStore.userInfo?.email ?? '';
});

const tenantInfo = computed(() => {
  const tenantId = userStore.userInfo?.tenantId;
  const tenantName = userStore.userInfo?.tenantName;
  const tenantCode = userStore.userInfo?.tenantCode;

  if (!appStore.saasEnabled || tenantId === undefined) {
    return null;
  }

  if (tenantId === 0) {
    return {
      isPlatform: true,
      name: '',
      id: '',
      code: '',
    };
  }

  return {
    isPlatform: false,
    name: tenantName || '',
    id: tenantId.toString(),
    code: tenantCode || '',
  };
});

async function handleLogout() {
  await authStore.logout(false);
}

function handleNoticeClear() {
  notifications.value = [];
}

function markRead(id: number | string) {
  const item = notifications.value.find((item) => item.id === id);
  if (item) {
    item.isRead = true;
  }
}

function remove(id: number | string) {
  notifications.value = notifications.value.filter((item) => item.id !== id);
}

function handleMakeAll() {
  notifications.value.forEach((item) => (item.isRead = true));
}

function handleClickLogo() {}

watch(
  () => ({
    enable: preferences.app.watermark,
    content: preferences.app.watermarkContent,
  }),
  async ({ enable, content }) => {
    if (enable) {
      await updateWatermark({
        content:
          content ||
          `${userStore.userInfo?.username} - ${userStore.userInfo?.realName}`,
      });
    } else {
      destroyWatermark();
    }
  },
  {
    immediate: true,
  },
);

const { connect } = useWs();

onMounted(async () => {
  connect(); // websocket 连接
  const { totalUnread } = await countUnreadNotice();
  if (totalUnread > 0) {
    notifications.value.push({
      id: `notice:hasUnread`,
      avatar: 'lucide:megaphone',
      date: '',
      isRead: false,
      link: '/notice',
      message: `您有 ${totalUnread} 个未读公告`,
      title: '有未读公告',
    });
  }
});

onBeforeMount(() => {
  if (preferences.app.watermark) {
    destroyWatermark();
  }
});
</script>

<template>
  <BasicLayout
    @clear-preferences-and-logout="handleLogout"
    @click-logo="handleClickLogo"
  >
    <template #user-dropdown>
      <UserDropdown
        :avatar
        :menus
        :text="userStore.userInfo?.realName"
        tag-text="Pro"
        trigger="both"
        @logout="handleLogout"
      >
        <template #description>
          <div class="flex flex-col gap-1">
            <div v-if="userEmail" class="truncate">
              {{ userEmail }}
            </div>
            <div v-if="tenantInfo" class="truncate font-medium">
              <template v-if="tenantInfo.isPlatform">
                {{ $t('system.tenant.platform') }}
              </template>
              <template v-else>
                <span v-if="tenantInfo.name">
                  {{ $t('system.tenant.module') }}: {{ tenantInfo.name }}
                </span>
                <span
                  v-if="tenantInfo.name && tenantInfo.id"
                  class="mx-1 text-muted-foreground"
                >
                  |
                </span>
                <span v-if="tenantInfo.id"> ID: {{ tenantInfo.id }} </span>
                <span
                  v-if="tenantInfo.code && (tenantInfo.name || tenantInfo.id)"
                  class="mx-1 text-muted-foreground"
                >
                  |
                </span>
                <span v-if="tenantInfo.code">
                  Code: {{ tenantInfo.code }}
                </span>
              </template>
            </div>
          </div>
        </template>
      </UserDropdown>
    </template>
    <template #notification>
      <Notification
        :dot="showDot"
        :notifications="notifications"
        @clear="handleNoticeClear"
        @read="(item) => item.id && markRead(item.id)"
        @remove="(item) => item.id && remove(item.id)"
        @make-all="handleMakeAll"
      />
    </template>
    <template #extra>
      <AuthenticationLoginExpiredModal
        v-model:open="accessStore.loginExpired"
        :avatar
      >
        <LoginForm />
      </AuthenticationLoginExpiredModal>
    </template>
    <template #lock-screen>
      <LockScreen :avatar @to-login="handleLogout" />
    </template>
  </BasicLayout>
</template>
