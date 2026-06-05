<script lang="ts" setup>
import { nextTick, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import { getWalletTxDetail } from '#/api/finance';
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

function getWalletTxTypeLabel(type: string): string {
  switch (type) {
    case 'commission': {
      return $t('finance.walletTx.typeCommission');
    }
    case 'consume': {
      return $t('finance.walletTx.typeConsume');
    }
    case 'exchange': {
      return $t('finance.walletTx.typeExchange');
    }
    case 'recharge': {
      return $t('finance.walletTx.typeRecharge');
    }
    case 'refund': {
      return $t('finance.walletTx.typeRefund');
    }
    case 'withdraw': {
      return $t('finance.walletTx.typeWithdraw');
    }
    default: {
      return type;
    }
  }
}

function getWalletTxChannelLabel(channel: string): string {
  switch (channel) {
    case 'alipay': {
      return $t('finance.walletTx.channelAlipay');
    }
    case 'commission': {
      return $t('finance.walletTx.channelCommission');
    }
    case 'douyin': {
      return $t('finance.walletTx.channelDouyin');
    }
    case 'exchange': {
      return $t('finance.walletTx.channelExchange');
    }
    case 'usd': {
      return $t('finance.walletTx.channelUsd');
    }
    case 'wechat': {
      return $t('finance.walletTx.channelWechat');
    }
    default: {
      return channel;
    }
  }
}

function getBalanceTypeLabel(balanceType: string): string {
  switch (balanceType) {
    case 'spendable': {
      return $t('finance.walletTx.balanceTypeSpendable');
    }
    case 'withdrawable': {
      return $t('finance.walletTx.balanceTypeWithdrawable');
    }
    default: {
      return balanceType;
    }
  }
}

function getBizTypeLabel(bizType: string): string {
  switch (bizType) {
    case 'charge': {
      return $t('finance.walletTx.bizTypeCharge');
    }
    case 'commission': {
      return $t('finance.walletTx.bizTypeCommission');
    }
    case 'consume': {
      return $t('finance.walletTx.bizTypeConsume');
    }
    case 'exchange': {
      return $t('finance.walletTx.bizTypeExchange');
    }
    case 'refund': {
      return $t('finance.walletTx.bizTypeRefund');
    }
    case 'withdraw': {
      return $t('finance.walletTx.bizTypeWithdraw');
    }
    default: {
      return bizType;
    }
  }
}

async function loadDetail(txId: number) {
  loadingData.value = true;
  try {
    const data = await getWalletTxDetail(txId);
    data.type = getWalletTxTypeLabel(data.type);
    data.channel = getWalletTxChannelLabel(data.channel);
    data.balanceType = getBalanceTypeLabel(data.balanceType);
    data.bizType = getBizTypeLabel(data.bizType);
    await formApi.setValues(data);
  } finally {
    loadingData.value = false;
  }
}
</script>

<template>
  <Drawer
    :title="`${$t('finance.walletTx.module')} ${$t('common.previewDetail')}`"
    :cancel-text="$t('common.action.close')"
    :show-confirm-button="false"
  >
    <div class="p-4">
      <Form />
    </div>
  </Drawer>
</template>
