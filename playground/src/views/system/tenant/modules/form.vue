<script lang="ts" setup>
import type { SystemTenantApi } from '#/api/system/tenant';

import { computed, nextTick, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import {
  createAndInitTenant,
  getTenantTemplateList,
  updateTenant,
} from '#/api/system/tenant';
import { $t } from '#/locales';

import {
  formFieldsToAdjustForEdit,
  formFieldsToRemoveForCreate,
  formFieldsToRemoveForEdit,
  useFormSchema,
} from '../data';

const emits = defineEmits(['success']);

const formData = ref<SystemTenantApi.SystemTenant>();

const [Form, formApi] = useVbenForm({
  schema: useFormSchema(),
  showDefaultActions: false,
});

const id = ref();
const [Drawer, drawerApi] = useVbenDrawer({
  destroyOnClose: true,
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;

    const values = await formApi.getValues();

    drawerApi.lock();
    (id.value ? updateTenant(id.value, values) : createAndInitTenant(values))
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
      const data = drawerApi.getData<SystemTenantApi.SystemTenant>();
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
        await loadTemplateOptions();
      }
      await nextTick();

      if (isEdit) {
        await formApi.setValues(data);
      }
    }
  },
});

const getDrawerTitle = computed(() => {
  return formData.value?.id
    ? $t('common.edit', $t('system.tenant.name'))
    : $t('common.create', $t('system.tenant.name'));
});

async function loadTemplateOptions() {
  try {
    const templates = await getTenantTemplateList();
    const options = templates.map((t) => ({
      label: t.name,
      value: t.code,
    }));
    formApi.updateSchema([
      {
        fieldName: 'templateCode',
        componentProps: {
          options,
        },
      },
    ]);
  } catch (e) {
    console.warn('Failed to load tenant templates:', e);
  }
}
</script>

<template>
  <Drawer :title="getDrawerTitle">
    <Form />
  </Drawer>
</template>
