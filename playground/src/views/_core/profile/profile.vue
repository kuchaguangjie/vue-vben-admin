<script setup lang="ts">
import type { Props } from '@vben/common-ui';

import { Page } from '@vben/common-ui';
import { preferences } from '@vben/preferences';

import {
  Card,
  Separator,
  Tabs,
  TabsList,
  TabsTrigger,
  VbenAvatar,
} from '@vben-core/shadcn-ui';

import ProfileAvatar from './profile-avatar.vue';

defineOptions({
  name: 'ProfileUI',
});

withDefaults(defineProps<Props>(), {
  title: '关于项目',
  tabs: () => [],
});

const tabsValue = defineModel<string>('modelValue');

const uploadMode = true;
function handleAvatarSuccess(newAvatarUrl: string) {
  console.warn(newAvatarUrl);
  // TODO
  // 1. 立即更新当前页面的头像显示
  // userInfo.value.avatar = newUrl;
  // 2. 更新全局 Store，这样右上角图标会立即变化
  // userStore.setUserInfo({ ...userInfo.value, avatar: newUrl });
  // 3. (可选) 调用后端 update-profile 接口持久化 avatar 字段
}
</script>
<template>
  <Page auto-content-height>
    <div class="flex h-full w-full">
      <Card class="w-1/6 flex-none">
        <div class="mt-4 flex h-40 flex-col items-center justify-center gap-4">
          <ProfileAvatar
            v-if="uploadMode"
            :current-avatar="userInfo?.avatar ?? preferences.app.defaultAvatar"
            @success="handleAvatarSuccess"
          />
          <VbenAvatar
            v-else
            :src="userInfo?.avatar ?? preferences.app.defaultAvatar"
            class="size-20"
          />
          <span class="text-lg font-semibold">
            {{ userInfo?.realName ?? '' }}
          </span>
          <span class="text-sm text-foreground/80">
            {{ userInfo?.username ?? '' }}
          </span>
        </div>
        <Separator class="my-4" />
        <Tabs v-model="tabsValue" orientation="vertical" class="m-4">
          <TabsList class="grid w-full grid-cols-1 bg-card">
            <TabsTrigger
              v-for="tab in tabs"
              :key="tab.value"
              :value="tab.value"
              class="h-12 justify-start data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              {{ tab.label }}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </Card>
      <Card class="ml-4 w-5/6 flex-auto p-8">
        <slot name="content"></slot>
      </Card>
    </div>
  </Page>
</template>
