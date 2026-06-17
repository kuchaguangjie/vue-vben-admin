<script lang="ts" setup>
import type { CmTenantWithdrawApi } from '#/api/cm-tenant';

import { nextTick, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import { confirmPaidTenantWithdraw } from '#/api/cm-tenant';
import { $t } from '#/locales';

import { useConfirmPaidFormSchema } from '../data';

const emits = defineEmits(['success']);

const withdrawData = ref<CmTenantWithdrawApi.TenantWithdraw>();

const [Form, formApi] = useVbenForm({
  schema: useConfirmPaidFormSchema(),
  showDefaultActions: false,
});

const [Drawer, drawerApi] = useVbenDrawer({
  destroyOnClose: true,
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;

    const values = await formApi.getValues();

    drawerApi.lock();
    confirmPaidTenantWithdraw({
      id: withdrawData.value!.id,
      payTxNo: values.payTxNo as string,
      actualAmount: values.actualAmount as number,
      payRemark: values.payRemark as string,
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
      if (data) {
        await formApi.setValues({ actualAmount: data.withdrawAmount });
      }
    }
  },
});
</script>

<template>
  <Drawer :title="$t('cm.tenantWithdraw.confirmPaid')">
    <div v-if="withdrawData" class="mb-4 space-y-2">
      <p>
        <strong>{{ $t('cm.tenantWithdraw.withdrawNo') }}:</strong>
        {{ withdrawData.withdrawNo }}
      </p>
      <p>
        <strong>{{ $t('cm.tenantWithdraw.withdrawAmount') }}:</strong>
        {{ withdrawData.withdrawAmount.toFixed(2) }}
      </p>
      <p>
        <strong>{{ $t('cm.tenantWithdraw.payChannel') }}:</strong>
        {{ withdrawData.payChannel }}
      </p>
    </div>
    <Form />
  </Drawer>
</template>
