<script lang="ts" setup>
import type { DataNode } from 'ant-design-vue/es/tree';

import type { SystemRoleApi } from '#/api/system/role';

import { computed, nextTick, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import { getRoleList } from '#/api/system/role';
import { createUser, updateUser } from '#/api/system/user';
import { $t } from '#/locales';

import { useFormSchema } from '../data';

const emits = defineEmits(['success']);

const formData = ref<SystemRoleApi.SystemRole>();

// 修改：添加角色选项响应式数据
const roleOptions = ref<{ label: string; value: number }[]>([]);

const [Form, formApi] = useVbenForm({
  schema: useFormSchema(),
  showDefaultActions: false,
});

// roles
const roles = ref<DataNode[]>([]);
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
      const data = drawerApi.getData<SystemRoleApi.SystemRole>();
      formApi.resetForm();

      if (data) {
        formData.value = data;
        id.value = data.id;
      } else {
        id.value = undefined;
      }

      if (roles.value.length === 0) {
        await loadRoles();
      }

      // 修改：等待角色数据加载完成后设置选项
      if (roleOptions.value.length === 0) {
        await loadRoleOptions();
      }

      // Wait for Vue to flush DOM updates (form fields mounted)
      await nextTick();
      if (data) {
        formApi.setValues(data);
      }
    }
  },
});

async function loadRoles() {
  loadingRoles.value = true;
  try {
    const res = await getRoleList();
    roles.value = res as unknown as DataNode[];
  } finally {
    loadingRoles.value = false;
  }
}

// 修改：新增函数 - 加载角色选项
async function loadRoleOptions() {
  try {
    const res = await getRoleList();
    const roles = res.items;
    roleOptions.value = roles.map((role: any) => ({
      label: role.name,
      value: role.code,
    }));

    // 动态更新表单字段的选项
    formApi.updateSchema([
      {
        fieldName: 'roleIds',
        componentProps: {
          options: roleOptions.value,
        },
      },
    ]);
  } catch (error) {
    console.error('加载角色选项失败:', error);
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

<style lang="css" scoped>
:deep(.ant-tree-title) {
  .tree-actions {
    display: none;
    margin-left: 20px;
  }
}

:deep(.ant-tree-title:hover) {
  .tree-actions {
    display: flex;
    flex: auto;
    justify-content: flex-end;
    margin-left: 20px;
  }
}
</style>
