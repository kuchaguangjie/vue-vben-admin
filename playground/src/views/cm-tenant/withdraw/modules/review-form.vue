<script lang="ts" setup>
import type { CmTenantWithdrawApi } from '#/api/cm-tenant';

import { nextTick, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import { reviewTenantWithdraw } from '#/api/cm-tenant';
import { $t } from '#/locales';

import { formatChannelInfo, useReviewFormSchema } from '../data';

const emits = defineEmits(['success']);

const withdrawData = ref<CmTenantWithdrawApi.TenantWithdraw>();

const [Form, formApi] = useVbenForm({
  schema: useReviewFormSchema(),
  showDefaultActions: false,
});

const [Drawer, drawerApi] = useVbenDrawer({
  destroyOnClose: true,
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;

    const values = await formApi.getValues();

    drawerApi.lock();
    reviewTenantWithdraw({
      id: withdrawData.value!.id,
      pass: values.pass as boolean,
      remark: (values.remark as string) || '',
    })
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
      const data = drawerApi.getData<CmTenantWithdrawApi.TenantWithdraw>();
      withdrawData.value = data;
      await formApi.resetForm();
      await nextTick();
    }
  },
});
</script>

<template>
  <Drawer :title="$t('cm.tenantWithdraw.review')">
    <div v-if="withdrawData" class="mb-4 space-y-2">
      <p>
        <strong>{{ $t('cm.tenantWithdraw.withdrawNo') }}:</strong>
        {{ withdrawData.withdrawNo }}
      </p>
      <p>
        <strong>{{ $t('cm.tenantWithdraw.tenantName') }}:</strong>
        {{ withdrawData.tenantName }}
      </p>
      <p>
        <strong>{{ $t('cm.tenantWithdraw.withdrawAmount') }}:</strong>
        {{ withdrawData.withdrawAmount.toFixed(2) }}
      </p>
      <p>
        <strong>{{ $t('cm.tenantWithdraw.payChannel') }}:</strong>
        {{ withdrawData.payChannel }}
      </p>
      <p>
        <strong>{{ $t('cm.tenantWithdraw.receivingAccount') }}:</strong>
        {{ formatChannelInfo(withdrawData) }}
      </p>
    </div>
    <Form />
  </Drawer>
</template>
