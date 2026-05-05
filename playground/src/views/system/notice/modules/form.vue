<script lang="ts" setup>
import type { SystemNoticeApi } from '#/api/system/notice';

import { computed, nextTick, ref, unref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import { createNotice, updateNotice } from '#/api/system/notice';
import { getTenantAll } from '#/api/system/tenant';
import { usePlatformAdmin } from '#/hooks/common/use-platform-admin';
import { $t } from '#/locales';
import { extractTreeValue } from '#/utils/value-format';

import {
  formFieldsToAdjustForEdit,
  formFieldsToRemoveForCreate,
  tenantList,
  tenantMap,
  tenantOptions,
  useFormSchema,
} from '../data';

const emits = defineEmits(['success']);

const { isPlatformAdmin } = usePlatformAdmin();

const formData = ref<SystemNoticeApi.SystemNotice>();

const [Form, formApi] = useVbenForm({
  schema: useFormSchema(unref(isPlatformAdmin)),
  showDefaultActions: false,
});

const loadingData = ref(false);

const id = ref();
const [Drawer, drawerApi] = useVbenDrawer({
  destroyOnClose: true,
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;

    const values = await formApi.getValues();
    extractTreeValue(values, ['noticeCodes']);

    drawerApi.lock();
    (id.value ? updateNotice(id.value, values) : createNotice(values))
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
      const data = drawerApi.getData<SystemNoticeApi.SystemNotice>();
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
      } else {
        await formApi.removeSchemaByFields(formFieldsToRemoveForCreate());
      }
      await nextTick();

      if (isEdit) {
        await formApi.setValues(data);
        await loadForUpdate();
      } else {
        await loadForCreate();
      }
    }
  },
});

async function loadForCreate() {
  loadingData.value = true;
  try {
    await loadTenantList();
    updateSchemaForNotice();
  } finally {
    loadingData.value = false;
  }
}

async function loadForUpdate() {
  return loadForCreate();
}

async function loadTenantList() {
  if (!unref(isPlatformAdmin)) {
    return;
  }
  try {
    const tenants = await getTenantAll();
    tenantList.value = tenants;
    tenantOptions.value = tenants.map((item) => ({
      label: item.name,
      value: item.id,
    }));
    tenantMap.value = {};
    for (const item of tenants) {
      tenantMap.value[item.id] = item.name;
    }
  } catch (error) {
    console.error('Failed to load tenant list:', error);
  }
}

function updateSchemaForNotice() {}

const getDrawerTitle = computed(() => {
  return formData.value?.id
    ? $t('common.edit', $t('system.notice.moduleShort'))
    : $t('common.create', $t('system.notice.moduleShort'));
});
</script>
<template>
  <Drawer :title="getDrawerTitle">
    <Form />
  </Drawer>
</template>
<style lang="css" scoped></style>
