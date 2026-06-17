<script lang="ts" setup>
import type { CmTenantWithdrawApi } from '#/api/cm-tenant';

import { nextTick, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { Statistic } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { applyTenantWithdraw } from '#/api/cm-tenant';
import { $t } from '#/locales';

import { useApplyFormSchema } from '../data';

const emits = defineEmits(['success']);

const account = ref<CmTenantWithdrawApi.TenantAccount>({
  totalIncome: 0,
  availableAmount: 0,
  withdrawPending: 0,
  withdrawnAmount: 0,
  frozenAmount: 0,
});

const [Form, formApi] = useVbenForm({
  schema: useApplyFormSchema(),
  showDefaultActions: false,
});

const [Drawer, drawerApi] = useVbenDrawer({
  destroyOnClose: true,
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;

    const values = await formApi.getValues();

    drawerApi.lock();
    applyTenantWithdraw({
      amount: values.amount as number,
      payChannel: values.payChannel as string,
      bankName: values.bankName as string,
      bankAccountNo: values.bankAccountNo as string,
      bankAccountName: values.bankAccountName as string,
      alipayAccount: values.alipayAccount as string,
      wechatAccount: values.wechatAccount as string,
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
      const data = drawerApi.getData<{
        account: CmTenantWithdrawApi.TenantAccount;
      }>();
      if (data?.account) {
        account.value = data.account;
      }
      await formApi.resetForm();
      await nextTick();
    }
  },
});
</script>

<template>
  <Drawer :title="$t('cm.tenantWithdraw.apply')">
    <div class="mb-4 rounded-lg bg-gray-50 p-4">
      <Statistic
        :value="account.availableAmount"
        :precision="2"
        :title="$t('cm.tenantWithdraw.availableAmount')"
        prefix="¥"
        value-style="color: #52c41a"
      />
    </div>
    <Form />
  </Drawer>
</template>
