<script lang="ts" setup>
import type { SystemDeptApi } from '#/api/system/dept';

import { computed, nextTick, ref } from 'vue';

import { alert, useVbenModal } from '@vben/common-ui';

import { Button } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import {
  createDept,
  preCreateDept,
  preUpdateDept,
  updateDept,
} from '#/api/system/dept';
import { $t } from '#/locales';
import { extractTreeValue } from '#/utils/valueFormat';

import { useSchema } from '../data';

const emit = defineEmits(['success']);
const formData = ref<SystemDeptApi.SystemDept>();
const getTitle = computed(() => {
  return formData.value?.id
    ? $t('ui.actionTitle.edit', [$t('system.dept.name')])
    : $t('ui.actionTitle.create', [$t('system.dept.name')]);
});

const [Form, formApi] = useVbenForm({
  layout: 'vertical',
  schema: useSchema(),
  showDefaultActions: false,
});

const loadingData = ref(false);

function resetForm() {
  formApi.resetForm();
  formApi.setValues(formData.value || {});
}

const [Modal, modalApi] = useVbenModal({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (valid) {
      modalApi.lock();
      const data = await formApi.getValues();
      extractTreeValue(data, ['roleCodes']);

      try {
        // TODO: merge formData & data, keep only 1 ?
        if (formData.value?.id) {
          if (formData.value.id === data.pid) {
            await alert({
              content: $t('common.messages.pidEqId'),
              icon: 'warning',
            });
            return;
          }
          await updateDept(formData.value.id, data);
        } else {
          await createDept(data);
        }
        await modalApi.close();
        emit('success');
      } finally {
        modalApi.lock(false);
      }
    }
  },
  async onOpenChange(isOpen) {
    if (isOpen) {
      const data = modalApi.getData<SystemDeptApi.SystemDept>();
      if (data.pid === 0) data.pid = undefined; // avoid shown 0 when no pid;
      formData.value = data;
      await formApi.setValues(formData.value); // even for create, there might be a pid pre-selected from ui.

      // 判断 new / edit 模式
      const isEdit = data && data.id;

      // get data & update field value
      isEdit
        ? await loadForUpdate(data.id, data.pid) // load data, for update
        : await loadForCreate(); // load data, for create
    }
  },
});

// for new, load data & update form value.
async function loadForCreate() {
  loadingData.value = true;
  try {
    // load data
    const { deptRoots, roles } = await preCreateDept();

    // update form options
    updateSchemaForDept(deptRoots, roles);
  } finally {
    loadingData.value = false;
  }
}

// for edit, load data & update form value.
async function loadForUpdate(id: number, pid: number) {
  loadingData.value = true;
  try {
    // load data
    const { deptRoots, roles, codes } = await preUpdateDept(id);

    // update form options
    updateSchemaForDept(deptRoots, roles);
    await nextTick();

    // update form value
    await formApi.setFieldValue('pid', pid);
    if (codes && codes.length > 0)
      await formApi.setFieldValue('roleCodes', codes); // 选中 已有的角色
  } finally {
    loadingData.value = false;
  }
}

// update schema
function updateSchemaForDept(deptRoots: any, roles: any) {
  // 获取所有可用角色
  const roleOptions = roles.map((role: any) => ({
    label: role.name,
    value: role.code,
  }));

  formApi.updateSchema([
    {
      component: 'TreeSelect',
      componentProps: {
        allowClear: true,
        treeData: deptRoots,
        fieldNames: {
          label: 'name', // 对应 labelField
          value: 'id', // 对应 valueField
          children: 'children', // 对应 childrenField
          key: 'id', // 可选，节点的唯一标识
        },
        class: 'w-full',
        labelField: 'name',
        valueField: 'id',
        childrenField: 'children',
      },
      fieldName: 'pid',
      label: $t('system.dept.parentDept'),
    },
    {
      fieldName: 'roleCodes',
      component: 'TreeSelect',
      label: $t('system.dept.roleCodes'),
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
</script>

<template>
  <Modal :title="getTitle">
    <Form class="mx-4" />
    <template #prepend-footer>
      <div class="flex-auto">
        <Button type="primary" danger @click="resetForm">
          {{ $t('common.reset') }}
        </Button>
      </div>
    </template>
  </Modal>
</template>
