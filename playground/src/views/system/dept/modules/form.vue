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

const roleOptions = ref<{ label: string; value: number }[]>([]);

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
        ? await loadForUpdate(data.id) // load data, for update
        : await loadForCreate(); // load data, for create
    }
  },
});

// for new, load data & update form value.
async function loadForCreate() {
  loadingData.value = true;
  try {
    // load data
    const { roles, codes } = await preCreateDept();

    // set data - role
    updateFormRoleOptions(roles);
    await nextTick();
    await formApi.setFieldValue('roleCodes', codes); // 选中 已有的角色
  } finally {
    loadingData.value = false;
  }
}

// for edit, load data & update form value.
async function loadForUpdate(id: number) {
  loadingData.value = true;
  try {
    // load data
    const { roles, codes } = await preUpdateDept(id);

    // set data - role
    updateFormRoleOptions(roles);
    await nextTick();
    await formApi.setFieldValue('roleCodes', codes); // 选中 已有的角色
  } finally {
    loadingData.value = false;
  }
}

/**
 * update roles field's options
 * @param roles all roles
 */
function updateFormRoleOptions(roles: any) {
  // 获取所有可用角色
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
