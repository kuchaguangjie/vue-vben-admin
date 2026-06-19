<script lang="ts" setup>
import type {
  CmTenantWithdrawAccountApi,
  CmTenantWithdrawApi,
} from '#/api/cm-tenant';

import { computed, nextTick, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { Select, Statistic } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { applyTenantWithdraw, getWithdrawAccountList } from '#/api/cm-tenant';
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

const withdrawAccounts = ref<CmTenantWithdrawAccountApi.WithdrawAccount[]>([]);
const selectedAccountId = ref<number | undefined>();

function getAccountLabel(
  acc: CmTenantWithdrawAccountApi.WithdrawAccount,
): string {
  switch (acc.payChannel) {
    case 'alipay': {
      return `支付宝 ${acc.alipayAccount || ''}`;
    }
    case 'bank': {
      return `${acc.bankName || ''} ****${(acc.bankAccountNo || '').slice(-4)}`;
    }
    case 'wechat': {
      return `微信 ${acc.wechatAccount || ''}`;
    }
    default: {
      return acc.payChannel;
    }
  }
}

const accountOptions = computed(() => {
  const opts = withdrawAccounts.value.map((a) => ({
    label: `${getAccountLabel(a)}${a.isDefault ? ' (默认)' : ''}`,
    value: a.id,
  }));
  return opts;
});

function onAccountSelect(id: number) {
  selectedAccountId.value = id;
  const acc = withdrawAccounts.value.find((a) => a.id === id);
  if (acc) {
    formApi.setValues({
      payChannel: acc.payChannel,
      bankName: acc.bankName,
      bankAccountNo: acc.bankAccountNo,
      bankAccountName: acc.bankAccountName,
      alipayAccount: acc.alipayAccount,
      wechatAccount: acc.wechatAccount,
    });
  }
}

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
      selectedAccountId.value = undefined;

      try {
        const resp = await getWithdrawAccountList();
        withdrawAccounts.value = resp.list || [];
      } catch {
        withdrawAccounts.value = [];
      }

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
    <div v-if="withdrawAccounts.length > 0" class="mb-4">
      <Select
        :value="selectedAccountId"
        :options="accountOptions"
        :placeholder="$t('cm.tenantWithdraw.selectAccount')"
        class="w-full"
        @change="onAccountSelect"
      />
    </div>
    <Form />
  </Drawer>
</template>
