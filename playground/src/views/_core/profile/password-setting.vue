<script setup lang="ts">
import type { VbenFormSchema } from '#/adapter/form';

import { computed } from 'vue';

import { ProfilePasswordSetting, z } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { updateUserPassword } from '#/api';
import { useAuthStore } from '#/store';
import { countdownMsg } from '#/utils/message-util';

const formSchema = computed((): VbenFormSchema[] => {
  return [
    {
      fieldName: 'oldPassword',
      label: $t('profile.label.oldPassword'),
      component: 'VbenInputPassword',
      componentProps: {
        placeholder: $t('profile.placeholder.oldPassword'),
      },
    },
    {
      fieldName: 'newPassword',
      label: $t('profile.label.newPassword'),
      component: 'VbenInputPassword',
      componentProps: {
        passwordStrength: true,
        placeholder: $t('profile.placeholder.newPassword'),
      },
    },
    {
      fieldName: 'confirmPassword',
      label: $t('profile.label.confirmPassword'),
      component: 'VbenInputPassword',
      componentProps: {
        passwordStrength: true,
        placeholder: $t('usercenter.placeholder.confirmPassword'),
      },
      dependencies: {
        rules(values) {
          const { newPassword } = values;
          return z
            .string({
              required_error: $t('usercenter.placeholder.confirmPassword'),
            })
            .min(1, {
              message: $t('profile.error.confirmPassword'),
            })
            .refine((value) => value === newPassword, {
              message: $t('profile.error.passwordMismatch'),
            });
        },
        triggerFields: ['newPassword'],
      },
    },
  ];
});

async function handleSubmit(values: any) {
  await updateUserPassword(values);

  countdownMsg('密码修改成功, 请重新登录', 3, () => {
    const authStore = useAuthStore();
    authStore.logout();
  });
}
</script>
<template>
  <ProfilePasswordSetting
    class="w-1/3"
    :form-schema="formSchema"
    @submit="handleSubmit"
  />
</template>
