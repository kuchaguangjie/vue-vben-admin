<script lang="ts" setup>
import type { SystemUserApi } from '#/api/system/user';
import { createUser, getUserRoles, updateUser } from '#/api/system/user';

import { computed, nextTick, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import { getRoleAll } from '#/api/system/role';
import { $t } from '#/locales';

import {
  useFormSchema,
  useFormSchemaExtraEdit,
  useFormSchemaExtraNew, useFormSchemaFieldsRemoveEdit,
  useFormSchemaFieldsRemoveNew,
} from '../data';

const emits = defineEmits(['success']);

const formData = ref<SystemUserApi.SystemUser>();

const [Form, formApi] = useVbenForm({
  schema: useFormSchema(),
  showDefaultActions: false,
});

const roleOptions = ref<{ label: string; value: number }[]>([]);
const loadingRoles = ref(false);

const id = ref();
const [Drawer, drawerApi] = useVbenDrawer({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = await formApi.getValues();
    drawerApi.lock();
    (id.value ? updateUser({ id: id.value, ...values }) : createUser(values))
      .then(() => {
        emits('success');
        drawerApi.close();
      })
      .catch(() => {
        drawerApi.unlock();
      });
  },

  async onOpenChange(isOpen) {
    if (isOpen) {
      const data = drawerApi.getData<SystemUserApi.SystemUser>();
      await formApi.resetForm();

      if (data) {
        formData.value = data;
        id.value = data.id;
      } else {
        id.value = undefined;
      }

      // Wait for Vue to flush DOM updates (form fields mounted)
      await nextTick();
      if (data) {
        await formApi.setValues(data);
      }

      // 修改：等待角色数据加载完成后设置选项
      if (roleOptions.value.length === 0) {
        await loadRoleOptions(data.username);
      }

      const isEdit = data && data.id;
      if (isEdit) {
        formApi.updateSchema(useFormSchemaExtraEdit());
        await formApi.removeSchemaByFields(useFormSchemaFieldsRemoveEdit());
      } else {
        formApi.updateSchema(useFormSchemaExtraNew());
        await formApi.removeSchemaByFields(useFormSchemaFieldsRemoveNew());
      }
    }
  },
});

// 加载角色选项, 并设置用户已拥有的角色
async function loadRoleOptions(username: string) {
  loadingRoles.value = true;
  try {
    // 获取所有可用角色
    const roles = await getRoleAll();
    roleOptions.value = roles.map((role: any) => ({
      label: role.name,
      value: role.code,
    }));

    // 动态更新表单字段的选项
    formApi.updateSchema([
      {
        fieldName: 'roleCodes',
        componentProps: {
          options: roleOptions.value,
        },
      },
    ]);

    // 修改
    if (username) {
      const userRoles = await getUserRoles(username); // 获取用户当前拥有的角色
      await formApi.setFieldValue('roleCodes', userRoles); // 选中用户已有角色
    }
  } catch (error) {
    console.error('加载角色选项失败:', error);
  } finally {
    loadingRoles.value = false;
  }
}

const getDrawerTitle = computed(() => {
  return formData.value?.id
    ? $t('common.edit', $t('system.user.name'))
    : $t('common.create', $t('system.user.name'));
});
</script>

<template>
  <Drawer :title="getDrawerTitle">
    <Form />
  </Drawer>
</template>

<style lang="css" scoped></style>
