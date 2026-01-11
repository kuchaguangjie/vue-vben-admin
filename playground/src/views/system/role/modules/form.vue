<script lang="ts" setup>
import type { DataNode } from 'ant-design-vue/es/tree';

import type { Recordable } from '@vben/types';

import type { SystemRoleApi } from '#/api/system/role';

import { computed, nextTick, ref } from 'vue';

import { Tree, useVbenDrawer } from '@vben/common-ui';
import { IconifyIcon } from '@vben/icons';

import { Spin } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import {
  createRole,
  preCreateRole,
  preUpdateRole,
  updateRole,
} from '#/api/system/role';
import { $t } from '#/locales';
import { extractTreeValue } from '#/utils/value-format';

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

const loadingData = ref(false);

const menuOptions = ref<DataNode[]>([]);
const apiOptions = ref<DataNode[]>([]);

const id = ref();
const [Drawer, drawerApi] = useVbenDrawer({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;

    const values = await formApi.getValues();
    extractTreeValue(values, ['roleCodes']);

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

      // update form fields
      if (isEdit) {
        formApi.updateSchema(useFormSchemaExtraEdit());
        await formApi.removeSchemaByFields(useFormSchemaRemoveEdit());
      } else {
        formApi.updateSchema(useFormSchemaExtraNew());
        await formApi.removeSchemaByFields(useFormSchemaRemoveNew());
      }
      // Wait for Vue to flush DOM updates (form fields mounted)
      await nextTick();

      // get data & update field value
      if (isEdit) {
        await formApi.setValues(data);
        await loadForUpdate(data.id, data.code); // load data, for update
      } else {
        await loadForCreate(); // load data, for create
      }
    }
  },
});

// for new, load data & update form value.
async function loadForCreate() {
  loadingData.value = true;
  try {
    // load data
    const { roles, menuRoots, apiRoots } = await preCreateRole();

    // set data - role
    updateSchemaForRole(roles);

    // set data - menu
    menuOptions.value = menuRoots as unknown as DataNode[];

    // set data - api
    apiOptions.value = apiRoots as unknown as DataNode[];
  } finally {
    loadingData.value = false;
  }
}

// for edit, load data & update form value.
async function loadForUpdate(id: number, code: string) {
  loadingData.value = true;
  try {
    // load data
    const { roles, inheritCodes, menuTreeWithChosen, apiTreeWithChosen } =
      await preUpdateRole(id);

    // set data - role
    updateSchemaForRole(roles, code);
    await nextTick();
    if (inheritCodes && inheritCodes.length > 0)
      await formApi.setFieldValue('roleCodes', inheritCodes); // 选中 继承的角色

    // set data - menu
    const { roots: menuRoots, chosenIds: menuChosenIds } = menuTreeWithChosen;
    menuOptions.value = menuRoots as unknown as DataNode[];
    await nextTick();
    await formApi.setFieldValue('permissions', menuChosenIds); // 选中 已有的 menu

    // set data - api
    const { roots: apiRoots, chosenIds: apiChosenIds } = apiTreeWithChosen;
    apiOptions.value = apiRoots as unknown as DataNode[];
    await nextTick();
    await formApi.setFieldValue('apis', apiChosenIds); // 选中 已有的 api
  } finally {
    loadingData.value = false;
  }
}

/**
 * update schema
 * @param roles all roles
 * @param code current role's code, for create it's not provided.
 */
function updateSchemaForRole(roles: any, code?: string) {
  // 角色选项
  const roleOptions = roles.map((role: any) => ({
    label: role.name,
    value: role.code,
    disabled: role.code === code, // 不可选中自己
  }));

  // 动态更新表单字段的选项
  formApi.updateSchema([
    {
      fieldName: 'roleCodes',
      component: 'TreeSelect',
      label: $t('system.role.setInheritRoles'),
      componentProps: {
        treeData: roleOptions,
        allowClear: true,
        class: 'w-full',
        multiple: true, // 启用多选
        treeCheckable: true,
        showCheckedStrategy: 'SHOW_CHILD',
        treeCheckStrictly: true, // 上/下 不关联, 可独立选择
        treeDefaultExpandAll: true, // 默认展开所有
      },
    },
  ]);
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
        <Spin :spinning="loadingData" wrapper-class-name="w-full">
          <Tree
            :tree-data="menuOptions"
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
        <Spin :spinning="loadingData" wrapper-class-name="w-full">
          <Tree
            :tree-data="apiOptions"
            multiple
            bordered
            :default-expanded-level="2"
            :get-node-class="getNodeClass"
            v-bind="slotProps"
            value-field="id"
          >
            <template #node="{ value }">
              {{ $t(value.path) }} ({{ $t(value.action) }})
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
