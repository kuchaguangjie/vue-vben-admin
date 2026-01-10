<script lang="ts" setup>
import type { SystemUserApi } from '#/api/system/user';
import {
  createUser,
  preCreateUser,
  preUpdateUser,
  updateUser,
} from '#/api/system/user';

import { computed, nextTick, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import { $t } from '#/locales';

import {
  useFormSchema,
  useFormSchemaExtraEdit,
  useFormSchemaExtraNew,
  useFormSchemaRemoveEdit,
  useFormSchemaRemoveNew,
} from '../data';

const emits = defineEmits(['success']);

const formData = ref<SystemUserApi.SystemUser>();

const [Form, formApi] = useVbenForm({
  schema: useFormSchema(),
  showDefaultActions: false,
});

const loadingData = ref(false);

const id = ref();
const [Drawer, drawerApi] = useVbenDrawer({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = await formApi.getValues();
    convertDeptObjectsToIds(values);
    convertRoleObjectsToCodes(values);

    drawerApi.lock();
    (id.value ? updateUser(id.value, values) : createUser(values))
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

      const isEdit = data && data.id;
      if (isEdit) {
        formData.value = data;
        id.value = data.id;
      } else {
        id.value = undefined;
      }

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
        await loadForUpdate(data.id); // load data, for update
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
    const { deptRoots, roles } = await preCreateUser();

    // set form option
    updateSchema(deptRoots, roles);
  } finally {
    loadingData.value = false;
  }
}

// for edit, load data & update form value.
async function loadForUpdate(userId: number) {
  loadingData.value = true;
  try {
    // load data
    const { deptRoots, deptIds, roles, codes } = await preUpdateUser(userId);

    // set form option
    updateSchema(deptRoots, roles);
    await nextTick();

    // set current value
    await formApi.setFieldValue('roleCodes', codes);
    await formApi.setFieldValue('deptIds', deptIds);
  } finally {
    loadingData.value = false;
  }
}

// set tree data, for deptIds
function updateSchema(deptRoots: any, roles: any) {
  formApi.updateSchema([
    {
      fieldName: 'deptIds',
      component: 'TreeSelect',
      label: $t('system.user.dept'),
      componentProps: {
        treeData: deptRoots,
        fieldNames: {
          label: 'name', // 对应 labelField
          value: 'id', // 对应 valueField
          children: 'children', // 对应 childrenField
          key: 'id', // 可选，节点的唯一标识
        },
        allowClear: true,
        class: 'w-full',
        multiple: true, // 启用多选
        treeCheckable: true,
        showCheckedStrategy: 'SHOW_CHILD',
        treeCheckStrictly: true, // 上/下 不关联, 可独立选择
        treeDefaultExpandAll: true, // 默认展开所有
      },
    },
    {
      fieldName: 'roleCodes',
      component: 'TreeSelect',
      label: $t('system.user.setRoles'),
      componentProps: {
        treeData: roles,
        fieldNames: {
          label: 'name', // 对应 labelField
          value: 'code', // 对应 valueField
          children: 'children', // 对应 childrenField
          key: 'code', // 可选，节点的唯一标识
        },
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

// Tree 数据如果修改了, 则默认提交 object 数组, 应 转换为 id 数组;
function convertDeptObjectsToIds(values: any) {
  if (values.deptIds && Array.isArray(values.deptIds)) {
    values.deptIds = values.deptIds.map((item: any) => {
      // 如果是对象，取 value 属性
      if (item && typeof item === 'object' && 'value' in item) {
        return item.value;
      }
      return item;
    });
  }
}

// Tree 数据如果修改了, 则默认提交 object 数组, 应 转换为 id 数组;
function convertRoleObjectsToCodes(values: any) {
  if (values.roleCodes && Array.isArray(values.roleCodes)) {
    values.roleCodes = values.roleCodes.map((item: any) => {
      // 如果是对象，取 value 属性
      if (item && typeof item === 'object' && 'value' in item) {
        return item.value;
      }
      return item;
    });
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
