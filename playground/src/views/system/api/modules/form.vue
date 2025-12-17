<script lang="ts" setup>
import type { SystemApiApi } from '#/api/system/api';

import { computed, nextTick, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import { createApi, updateApi } from '#/api/system/api';
import { $t } from '#/locales';

import {
  useFormSchema,
  useFormSchemaExtraEdit,
  useFormSchemaExtraNew,
  useFormSchemaRemoveEdit,
  useFormSchemaRemoveNew,
} from '../data';

const emits = defineEmits(['success']);

const formData = ref<SystemApiApi.SystemApi>();

const [Form, formApi] = useVbenForm({
  schema: useFormSchema(),
  showDefaultActions: false,
});

const id = ref();
const [Drawer, drawerApi] = useVbenDrawer({
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;
    const values = await formApi.getValues();
    drawerApi.lock();
    (id.value ? updateApi(id.value, values) : createApi(values))
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
      const data = drawerApi.getData<SystemApiApi.SystemApi>();
      await formApi.resetForm();

      const isEdit = data && data.id;
      if (isEdit) {
        formData.value = data;
        id.value = data.id;
      } else {
        id.value = undefined;
      }

      // Wait for Vue to flush DOM updates (form fields mounted)
      await nextTick();
      if (isEdit) {
        await formApi.setValues(data);
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

const getDrawerTitle = computed(() => {
  return formData.value?.id
    ? $t('common.edit', $t('system.api.menuName'))
    : $t('common.create', $t('system.api.menuName'));
});
</script>
<template>
  <Drawer :title="getDrawerTitle">
    <Form />
  </Drawer>
</template>
<style lang="css" scoped></style>
