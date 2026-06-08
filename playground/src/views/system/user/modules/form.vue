<script lang="ts" setup>
import type { SystemUserApi } from '#/api/system/user';

import { computed, h, nextTick, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import {
  createUser,
  getDetailUser,
  preCreateUser,
  preUpdateUser,
  updateUser,
} from '#/api/system/user';
import { $t } from '#/locales';
import { extractTreeValue } from '#/utils/value-format';

import {
  formFieldsToAdjustForEdit,
  formFieldsToRemoveForCreate,
  formFieldsToRemoveForEdit,
  useFormSchema,
} from '../data';

const emits = defineEmits(['success']);

const formData = ref<SystemUserApi.SystemUser>();

const [Form, formApi] = useVbenForm({
  schema: useFormSchema(),
  showDefaultActions: false,
});

const loadingData = ref(false);
const parentUser = ref<null | SystemUserApi.SystemUser>(null);
const previousParentId = ref<null | number>(null);
const queryingParentUser = ref(false);

// 计算显示内容
const parentUserSuffix = computed(() => {
  if (queryingParentUser.value) {
    return h('span', { class: 'text-gray-400' }, $t('common.messages.loading'));
  }
  if (parentUser.value) {
    return h(
      'span',
      { class: 'text-sm text-green-600' },
      `✅ ${parentUser.value.id} | ${parentUser.value.username} | ${parentUser.value.nick}`,
    );
  }
  if (
    previousParentId.value &&
    !parentUser.value &&
    !queryingParentUser.value
  ) {
    return h(
      'span',
      { class: 'text-red-500' },
      `❌ ${$t('common.messages.loadFailure')}`,
    );
  }
  return '';
});

async function handleParentIdBlur() {
  const values = await formApi.getValues();
  const currentParentId = values.parentId;

  if (!currentParentId || currentParentId === previousParentId.value) {
    return;
  }

  previousParentId.value = currentParentId;
  queryingParentUser.value = true;
  parentUser.value = null;

  // 立即更新 schema 显示加载状态
  await refreshParentIdSchema();

  try {
    const user = await getDetailUser(currentParentId);
    parentUser.value = user;
  } catch {
    parentUser.value = null;
  } finally {
    queryingParentUser.value = false;
  }

  // 查询完成后再次更新 schema 显示结果
  await refreshParentIdSchema();
}

function handleParentIdChange(value: null | number) {
  if (!value) {
    parentUser.value = null;
    previousParentId.value = null;
    refreshParentIdSchema();
  }
}

// 刷新 parentId 字段的 schema，触发重新渲染
async function refreshParentIdSchema(disabled = false) {
  const currentValues = await formApi.getValues();
  formApi.updateSchema([
    {
      fieldName: 'parentId',
      component: 'InputNumber',
      label: $t('system.user.parentId'),
      componentProps: {
        allowClear: true,
        min: 1,
        placeholder: $t('common.messages.pleaseInput'),
        class: 'w-full',
        disabled,
        onBlur: handleParentIdBlur,
        onChange: handleParentIdChange,
      },
      renderComponentContent() {
        return {
          suffix() {
            return parentUserSuffix.value;
          },
        };
      },
    },
  ]);
  // 恢复字段值
  if (currentValues.parentId) {
    await formApi.setFieldValue('parentId', currentValues.parentId);
  }
}

const id = ref();
const [Drawer, drawerApi] = useVbenDrawer({
  destroyOnClose: true,
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = await formApi.getValues();

    // 验证上级用户：如果填写了 parentId 但用户不存在，阻止提交
    if (values.parentId && !parentUser.value) {
      message.error($t('system.user.parentUserNotFound'));
      return;
    }
    if (queryingParentUser.value) {
      message.error($t('common.messages.loading'));
      return;
    }

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
        formApi.updateSchema(formFieldsToAdjustForEdit());
        await formApi.removeSchemaByFields(formFieldsToRemoveForEdit());
      } else {
        await formApi.removeSchemaByFields(formFieldsToRemoveForCreate());
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
    await updateSchemaForUser(deptRoots, roles);
    await refreshParentIdSchema(false);
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

    // 先查询当前用户的 parentId 对应的上级用户信息
    const userDetail = await getDetailUser(userId);
    if (userDetail.parentId) {
      previousParentId.value = userDetail.parentId;
      try {
        parentUser.value = await getDetailUser(userDetail.parentId);
      } catch {
        parentUser.value = null;
      }
    }

    // set form option
    await updateSchemaForUser(deptRoots, roles, true);
    await refreshParentIdSchema(true);
    await nextTick();

    // set current value
    if (codes && codes.length > 0)
      await formApi.setFieldValue(
        'roleCodes',
        codes.map((code: string) => ({ label: code, value: code })),
      );
    if (deptIds && deptIds.length > 0)
      await formApi.setFieldValue(
        'deptIds',
        deptIds.map((id: number) => ({ label: String(id), value: id })),
      );
  } finally {
    loadingData.value = false;
  }
}

// set field options
async function updateSchemaForUser(
  deptRoots: any,
  roles: any,
  _isEdit?: boolean,
) {
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
