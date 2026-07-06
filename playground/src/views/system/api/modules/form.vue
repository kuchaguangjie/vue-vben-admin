<script lang="ts" setup>
import type { SystemApiApi } from '#/api/system/api';

import { computed, nextTick, ref } from 'vue';

import { alert, useVbenDrawer } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import { createApi, updateApi } from '#/api/system/api';
import { $t } from '#/locales';

import {
  formFieldsToAdjustForEdit,
  formFieldsToRemoveForCreate,
  useFormSchema,
} from '../data';

const emits = defineEmits(['success']);

const formData = ref<SystemApiApi.SystemApi>();

const [Form, formApi] = useVbenForm({
  schema: useFormSchema(),
  showDefaultActions: false,
});

const [Drawer, drawerApi] = useVbenDrawer({
  destroyOnClose: true,
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = await formApi.getValues();
    drawerApi.lock();

    const id = formData.value?.id;

    try {
      if (id) {
        if (id === values.pid) {
          await alert({
            content: $t('common.messages.pidEqId'),
            icon: 'warning',
          });
          return;
        }
        await updateApi(id, values);
      } else {
        await createApi(values);
      }
      await drawerApi.close();
      emits('success');
    } finally {
      drawerApi.unlock();
    }
  },
  async onOpenChange(isOpen) {
    if (isOpen) {
      const data = drawerApi.getData<SystemApiApi.SystemApi>();
      if (data.pid === 0) data.pid = undefined; // avoid shown 0 when no pid;
      formData.value = data;
      await formApi.setValues(formData.value); // even for create, there might be a pid pre-selected from ui.

      const isEdit = data && data.id;
      // adjust fields
      if (isEdit) {
        formApi.updateSchema(formFieldsToAdjustForEdit());
      } else {
        await formApi.removeSchemaByFields(formFieldsToRemoveForCreate());
      }
      // Wait for Vue to flush DOM updates (form fields mounted)
      await nextTick();
    }
  },
});

const getDrawerTitle = computed(() => {
  return formData.value?.id
    ? $t('ui.actionTitle.edit', [$t('system.api.module')])
    : $t('ui.actionTitle.create', [$t('system.api.module')]);
});
</script>
<template>
  <Drawer :title="getDrawerTitle">
    <Form />
  </Drawer>
</template>
<style lang="css" scoped></style>
