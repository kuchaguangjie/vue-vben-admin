<script lang="ts" setup>
import { nextTick, ref } from 'vue'; // 复用已有的 Schema 定义

import { useVbenDrawer } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import { getDetailUser } from '#/api';
import { $t } from '#/locales';

import { useFormSchema, useFormSchemaRemovePreview } from '../data';

const loadingData = ref(false);

const [Form, formApi] = useVbenForm({
  // 直接复用 form.vue 的 schema，保持数据定义唯一
  schema: useFormSchema(),
  // 关键：设为只读模式, UI 会自动从输入框变为展示文本
  commonConfig: {
    disabled: true,
  },
  showDefaultActions: false,
});

const [Drawer, drawerApi] = useVbenDrawer({
  async onOpenChange(isOpen) {
    if (isOpen) {
      await formApi.removeSchemaByFields(useFormSchemaRemovePreview());
      await nextTick();

      // 填充数据
      const data = drawerApi.getData<any>();
      await formApi.setValues(data);

      await loadDetail(data.id);
    }
  },
});

// for get detail, load data & update value.
async function loadDetail(userId: number) {
  loadingData.value = true;
  try {
    // load data
    const { deptRoots, deptIds, roles, codes } = await getDetailUser(userId);

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
</script>

<template>
  <Drawer
    :title="`${$t('system.user.name')} ${$t('common.previewDetail')}`"
    :cancel-text="$t('common.action.close')"
    :show-confirm-button="false"
  >
    <div class="p-4">
      <Form />
    </div>
  </Drawer>
</template>
