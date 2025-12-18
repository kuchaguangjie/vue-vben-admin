<script lang="ts" setup>
import type { DataNode } from 'ant-design-vue/es/tree';

import type { Recordable } from '@vben/types';

import type { SystemApiApi } from '#/api';
import type { SystemRoleApi } from '#/api/system/role';

import { computed, nextTick, ref } from 'vue';

import { Tree, useVbenDrawer } from '@vben/common-ui';
import { IconifyIcon } from '@vben/icons';

import { Spin } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { getApiTree, getInheritRoles } from '#/api';
import { getMenuTree } from '#/api/system/menu';
import {
  createRole,
  getRoleAll,
  getRoleApis,
  updateRole,
} from '#/api/system/role';
import { $t } from '#/locales';

import {
  useFormSchema,
  useFormSchemaExtraEdit,
  useFormSchemaExtraNew,
  useFormSchemaRemoveEdit,
  useFormSchemaRemoveNew,
} from '../data';

const emits = defineEmits(['success']);

const formData = ref<SystemRoleApi.SystemRole>();

const [Form, formApi] = useVbenForm({
  schema: useFormSchema(),
  showDefaultActions: false,
});

const permissions = ref<DataNode[]>([]);
const loadingPermissions = ref(false);

const apis = ref<DataNode[]>([]);
const loadingApis = ref(false);

const roleOptions = ref<{ label: string; value: number }[]>([]);
const loadingRoles = ref(false);

const id = ref();
const [Drawer, drawerApi] = useVbenDrawer({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = await formApi.getValues();
    drawerApi.lock();
    (id.value ? updateRole(id.value, values) : createRole(values))
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
      await formApi.resetForm();

      // 判断 new / edit 模式
      const isEdit = data && data.id;
      if (isEdit) {
        formData.value = data;
        id.value = data.id;
      } else {
        id.value = undefined;
      }

      // 加载 menu tree
      if (permissions.value.length === 0) {
        await loadPermissions();
      }
      // 加载 api tree
      if (apis.value.length === 0) {
        await loadApis();
      }

      // Wait for Vue to flush DOM updates (form fields mounted)
      await nextTick();
      if (isEdit) {
        await formApi.setValues(data);
        await loadAndInitRoleApis(data.code); // load & init role's apis
      }

      // 加载角色选项
      if (roleOptions.value.length === 0) {
        await loadInheritRoleOptions(data.code);
      }

      if (isEdit) {
        formApi.updateSchema(useFormSchemaExtraEdit());
        await formApi.removeSchemaByFields(useFormSchemaRemoveEdit());
      } else {
        formApi.updateSchema(useFormSchemaExtraNew());
        await formApi.removeSchemaByFields(useFormSchemaRemoveNew());
      }
    }
  },
});

async function loadPermissions() {
  loadingPermissions.value = true;
  try {
    const res = await getMenuTree();
    permissions.value = res as unknown as DataNode[];
  } finally {
    loadingPermissions.value = false;
  }
}

async function loadApis() {
  loadingApis.value = true;
  try {
    const res = await getApiTree();
    apis.value = res as unknown as DataNode[];
  } finally {
    loadingApis.value = false;
  }
}

// 加载角色选项, 并设置已继承的角色
async function loadInheritRoleOptions(code: string) {
  loadingRoles.value = true;
  try {
    // 获取所有可用角色
    const roles = await getRoleAll();
    roleOptions.value = roles.map((role: any) => ({
      label: role.name,
      value: role.code,
      disabled: role.code === code, // 不可选中自己
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
    if (code) {
      const inheritRoles = await getInheritRoles(code); // 获取 继承的角色
      await formApi.setFieldValue('roleCodes', inheritRoles); // 选中 继承的角色
    }
  } catch (error) {
    console.error('加载角色选项失败:', error);
  } finally {
    loadingRoles.value = false;
  }
}

async function loadAndInitRoleApis(code: string) {
  const roleApis = await getRoleApis(code); // 获取 角色的 api
  await formApi.setFieldValue(
    'apis',
    roleApis.map((v: SystemApiApi.SystemApi) => v.id),
  ); // 选中 已有的 api
}

const getDrawerTitle = computed(() => {
  return formData.value?.id
    ? $t('common.edit', $t('system.role.name'))
    : $t('common.create', $t('system.role.name'));
});

function getNodeClass(node: Recordable<any>) {
  const classes: string[] = [];
  if (node.value?.type === 'button') {
    classes.push('inline-flex');
  }

  return classes.join(' ');
}
</script>
<template>
  <Drawer :title="getDrawerTitle">
    <Form>
      <template #permissions="slotProps">
        <Spin :spinning="loadingPermissions" wrapper-class-name="w-full">
          <Tree
            :tree-data="permissions"
            multiple
            bordered
            :default-expanded-level="2"
            :get-node-class="getNodeClass"
            v-bind="slotProps"
            value-field="id"
            label-field="meta.title"
            icon-field="meta.icon"
          >
            <template #node="{ value }">
              <IconifyIcon v-if="value.meta.icon" :icon="value.meta.icon" />
              {{ $t(value.meta.title) }}
            </template>
          </Tree>
        </Spin>
      </template>
      <template #apis="slotProps">
        <Spin :spinning="loadingApis" wrapper-class-name="w-full">
          <Tree
            :tree-data="apis"
            multiple
            bordered
            :default-expanded-level="2"
            :get-node-class="getNodeClass"
            v-bind="slotProps"
            value-field="id"
          >
            <template #node="{ value }">
              {{ $t(value.path) }}
            </template>
          </Tree>
        </Spin>
      </template>
    </Form>
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
