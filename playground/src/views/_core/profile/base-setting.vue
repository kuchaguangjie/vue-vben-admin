<script setup lang="ts">
import type { VbenFormSchema } from '#/adapter/form';

import { computed, onMounted, ref } from 'vue';

import { ProfileBaseSetting } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { message } from 'ant-design-vue';

import { getUserInfoApi, updateUserBasicInfoApi } from '#/api';

const profileBaseSettingRef = ref();

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

onMounted(initUserInfo);

async function initUserInfo() {
  const data = await getUserInfoApi();
  profileBaseSettingRef.value.getFormApi().setValues(data);
}

async function handleUpdate(values: any) {
  await updateUserBasicInfoApi({
    realName: values.realName,
    remark: values.remark,
    version: values.version,
  });
  await initUserInfo(); // 刷新
  message.success($t('common.messages.success'));
}
</script>
<template>
  <ProfileBaseSetting
    ref="profileBaseSettingRef"
    :form-schema="formSchema"
    @submit="handleUpdate"
  />
</template>
