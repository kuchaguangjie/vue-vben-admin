<script lang="ts" setup>
import { nextTick, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import { getDetailTenant } from '#/api';
import { $t } from '#/locales';

import { formFieldsToRemoveForPreview, useFormSchema } from '../data';

const loadingData = ref(false);

const [Form, formApi] = useVbenForm({
  schema: useFormSchema(),
  commonConfig: {
    wrapperClass: 'pointer-events-none opacity-60',
  },
  showDefaultActions: false,
});

const [Drawer, drawerApi] = useVbenDrawer({
  destroyOnClose: true,
  async onOpenChange(isOpen) {
    if (isOpen) {
      await formApi.removeSchemaByFields(formFieldsToRemoveForPreview());
      await nextTick();

      const id = drawerApi.getData<any>().id;
      await loadDetail(id);
    }
  },
});

async function loadDetail(tenantId: number) {
  loadingData.value = true;
  try {
    const { tenant } = await getDetailTenant(tenantId);
    await formApi.setValues(tenant);
  } finally {
    loadingData.value = false;
  }
}
</script>

<template>
  <Drawer
    :title="`${$t('system.tenant.module')} ${$t('common.previewDetail')}`"
    :cancel-text="$t('common.action.close')"
    :show-confirm-button="false"
  >
    <div class="p-4">
      <Form />
    </div>
  </Drawer>
</template>
