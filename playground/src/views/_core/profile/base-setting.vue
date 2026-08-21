<script setup lang="ts">
import type { VbenFormSchema } from '#/adapter/form';

import { computed, onMounted, ref, watch } from 'vue';

import { ProfileBaseSetting } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { useQuery } from '@tanstack/vue-query';
import { message } from 'ant-design-vue';

import { updateUserBasicInfoApi, userInfoQueryOptions } from '#/api';
import { queryClient } from '#/api/query-client';

const profileBaseSettingRef = ref();

// 复用全局 userInfo 缓存：登录后由 store/auth.ts 拉取过，
// 30s staleTime 内进入本页直接命中缓存秒开，超时自动后台刷新。
const { data: userInfo } = useQuery(userInfoQueryOptions());

const formSchema = computed((): VbenFormSchema[] => {
  return [
    {
      component: 'Input',
      fieldName: 'version',
      label: '', // 空标签使其不显示
      componentProps: {
        style: { display: 'none' }, // 隐藏输入框
        disabled: true, // 不可编辑
      },
    },
    {
      fieldName: 'realName',
      component: 'Input',
      label: $t('system.user.nick'),
    },
    {
      fieldName: 'username',
      component: 'Input',
      label: $t('system.user.username'),
      componentProps: {
        disabled: true,
      },
    },
    {
      fieldName: 'tenantId',
      component: 'Input',
      label: $t('system.tenant.id'),
      componentProps: {
        disabled: true,
      },
    },
    {
      fieldName: 'tenantName',
      component: 'Input',
      label: $t('system.tenant.name'),
      componentProps: {
        disabled: true,
      },
    },
    {
      fieldName: 'tenantCode',
      component: 'Input',
      label: $t('system.tenant.code'),
      componentProps: {
        disabled: true,
      },
    },
    {
      fieldName: 'email',
      component: 'Input',
      label: $t('system.user.email'),
      componentProps: {
        disabled: true,
      },
    },
    {
      fieldName: 'roleNames', // 只读 角色名称 列表
      component: 'Select',
      componentProps: {
        disabled: true,
        mode: 'tags',
      },
      label: $t('system.user.role'),
    },
    {
      fieldName: 'remark',
      component: 'Textarea',
      label: $t('system.user.remark'),
    },
  ];
});

// 首次进入页面：若缓存已存在则同步填充表单（无需等待网络）
onMounted(() => {
  if (userInfo.value) {
    profileBaseSettingRef.value?.getFormApi().setValues(userInfo.value);
  }
});

// 后台刷新或缓存命中后，watch 触发同步表单
watch(userInfo, (newData) => {
  if (!newData) return;
  profileBaseSettingRef.value?.getFormApi().setValues(newData);
});

async function handleUpdate(values: any) {
  await updateUserBasicInfoApi({
    realName: values.realName,
    remark: values.remark,
    version: values.version,
  });
  // 强制刷新 userInfo（等待数据真正返回后再提示成功，保证用户体验一致）
  await queryClient.refetchQueries({ queryKey: ['user', 'info'] });
  message.success($t('common.messages.success'));
}
</script>
<template>
  <div class="max-w-2xl">
    <ProfileBaseSetting
      ref="profileBaseSettingRef"
      :form-schema="formSchema"
      @submit="handleUpdate"
    />
  </div>
</template>
