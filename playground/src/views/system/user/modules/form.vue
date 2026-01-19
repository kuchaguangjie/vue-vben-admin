<script lang="ts" setup>
import type { SystemUserApi } from '#/api/system/user';

import { computed, nextTick, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import {
  createUser,
  preCreateUser,
  preUpdateUser,
  updateUser,
} from '#/api/system/user';
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
    extractTreeValue(values, ['deptIds', 'roleCodes']);

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
    updateSchemaForUser(deptRoots, roles);
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
    updateSchemaForUser(deptRoots, roles);
    await nextTick();

    // set current value
    if (codes && codes.length > 0)
      await formApi.setFieldValue('roleCodes', codes);
    if (deptIds && deptIds.length > 0)
      await formApi.setFieldValue('deptIds', deptIds);
  } finally {
    loadingData.value = false;
  }
}

// set field options
function updateSchemaForUser(deptRoots: any, roles: any) {
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

const getDrawerTitle = computed(() => {
  return formData.value?.id
    ? $t('common.edit', $t('system.user.module'))
    : $t('common.create', $t('system.user.module'));
});
</script>

<template>
  <Drawer :title="getDrawerTitle">
    <Form />
  </Drawer>
</template>

<style lang="css" scoped></style>
