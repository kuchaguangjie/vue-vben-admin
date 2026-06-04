import type { Ref } from 'vue';

import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemUserApi } from '#/api';

import { ref } from 'vue';

import { useSaasEnabled } from '#/hooks/common/use-saas-enabled';
import { $t } from '#/locales';
import { useCopyColumn } from '#/utils/use-copy-column';
import { usePreviewLink } from '#/utils/use-preview-link';
import { useUserCoreColumn } from '#/utils/user-core';
import { formatBackendTime } from '#/utils/value-format';

export const userCoreMapRef: Ref<Record<number, SystemUserApi.UserCore>> = ref(
  {},
);

function getWalletTxTypeLabel(type: string): string {
  switch (type) {
    case 'exchange': {
      return $t('finance.walletTx.typeExchange');
    }
    case 'recharge': {
      return $t('finance.walletTx.typeRecharge');
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
    case 'douyin': {
      return $t('finance.walletTx.channelDouyin');
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

export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'id',
      label: $t('finance.walletTx.id'),
      disabled: true,
    },
    {
      component: 'Input',
      fieldName: 'tenantId',
      label: $t('finance.walletTx.tenantId'),
      disabled: true,
    },
    {
      component: 'Input',
      fieldName: 'userId',
      label: $t('finance.walletTx.userId'),
      disabled: true,
    },
    {
      component: 'Input',
      fieldName: 'type',
      label: $t('finance.walletTx.type'),
      disabled: true,
    },
    {
      component: 'Input',
      fieldName: 'channel',
      label: $t('finance.walletTx.channel'),
      disabled: true,
    },
    {
      component: 'Input',
      fieldName: 'originalCurrency',
      label: $t('finance.walletTx.currency'),
      disabled: true,
    },
    {
      component: 'Input',
      fieldName: 'originalAmount',
      label: $t('finance.walletTx.amount'),
      disabled: true,
    },
    {
      component: 'Input',
      fieldName: 'balanceBefore',
      label: $t('finance.walletTx.balanceBefore'),
      disabled: true,
    },
    {
      component: 'Input',
      fieldName: 'balanceAfter',
      label: $t('finance.walletTx.balanceAfter'),
      disabled: true,
    },
    {
      component: 'Input',
      fieldName: 'payTxId',
      label: $t('finance.walletTx.payTxId'),
      disabled: true,
    },
    {
      component: 'Input',
      fieldName: 'remark',
      label: $t('finance.walletTx.remark'),
      disabled: true,
    },
    {
      component: 'Input',
      fieldName: 'createdAt',
      label: $t('finance.walletTx.createdAt'),
      disabled: true,
    },
  ];
}

export function formFieldsToRemoveForPreview(): string[] {
  return [];
}

export function useGridFormSchema(isPlatformAdmin = false): VbenFormSchema[] {
  const { saasEnabled } = useSaasEnabled();

  const schema: VbenFormSchema[] = [
    {
      component: 'Input',
      fieldName: 'userId',
      label: $t('finance.walletTx.userId'),
      componentProps: {
        type: 'number',
        allowClear: true,
        placeholder: '',
      },
    },
    {
      component: 'Select',
      fieldName: 'type',
      label: $t('finance.walletTx.type'),
      componentProps: {
        allowClear: true,
        placeholder: '',
        options: [
          { label: $t('finance.walletTx.typeRecharge'), value: 'recharge' },
          { label: $t('finance.walletTx.typeWithdraw'), value: 'withdraw' },
          { label: $t('finance.walletTx.typeExchange'), value: 'exchange' },
        ],
      },
    },
    {
      component: 'Select',
      fieldName: 'channel',
      label: $t('finance.walletTx.channel'),
      componentProps: {
        allowClear: true,
        placeholder: '',
        options: [
          { label: $t('finance.walletTx.channelWechat'), value: 'wechat' },
          { label: $t('finance.walletTx.channelAlipay'), value: 'alipay' },
          { label: $t('finance.walletTx.channelDouyin'), value: 'douyin' },
          { label: $t('finance.walletTx.channelUsd'), value: 'usd' },
        ],
      },
    },
    {
      component: 'Select',
      fieldName: 'currency',
      label: $t('finance.walletTx.currency'),
      componentProps: {
        allowClear: true,
        placeholder: '',
        options: [
          { label: 'CNY', value: 'CNY' },
          { label: 'USD', value: 'USD' },
        ],
      },
    },
    {
      component: 'RangePicker',
      fieldName: 'createdAtRangeMs',
      label: $t('finance.walletTx.createdAt'),
      componentProps: {
        valueFormat: 'x',
      },
    },
  ];

  if (saasEnabled.value && isPlatformAdmin) {
    schema.unshift({
      component: 'Input',
      fieldName: 'tenantId',
      label: $t('finance.walletTx.tenantId'),
      componentProps: {
        type: 'number',
        allowClear: true,
        placeholder: '',
      },
    });
  }

  return schema;
}

export function useColumns(
  onPreview: (row: any) => void,
): VxeTableGridOptions['columns'] {
  const { saasEnabled } = useSaasEnabled();

  const columns: VxeTableGridOptions['columns'] = [
    usePreviewLink(
      {
        field: 'id',
        title: $t('finance.walletTx.id'),
        width: 100,
      },
      onPreview,
    ),
  ];

  if (saasEnabled.value) {
    columns.push({
      field: 'tenantId',
      title: $t('system.tenant.id'),
      width: 90,
      sortable: true,
    });
  }

  columns.push(
    {
      field: 'userIdNum',
      title: $t('finance.walletTx.userId'),
      width: 100,
      formatter: ({ row }) => row.userId,
    },
    useUserCoreColumn(
      {
        field: 'userId',
        title: $t('finance.walletTx.userNick'),
        width: 120,
      },
      userCoreMapRef,
    ),
    {
      field: 'type',
      title: $t('finance.walletTx.type'),
      width: 100,
      formatter: ({ cellValue }) => getWalletTxTypeLabel(cellValue),
    },
    {
      field: 'channel',
      title: $t('finance.walletTx.channel'),
      width: 100,
      formatter: ({ cellValue }) => getWalletTxChannelLabel(cellValue),
    },
    {
      field: 'originalCurrency',
      title: $t('finance.walletTx.currency'),
      width: 100,
    },
    {
      field: 'originalAmount',
      title: $t('finance.walletTx.amount'),
      width: 120,
      formatter: ({ cellValue, row }) => {
        const amount = cellValue ?? row.amount;
        const symbol = row.originalCurrency === 'CNY' ? '¥' : '$';
        return `${symbol}${amount}`;
      },
    },
    {
      field: 'balanceBefore',
      title: $t('finance.walletTx.balanceBefore'),
      width: 120,
    },
    {
      field: 'balanceAfter',
      title: $t('finance.walletTx.balanceAfter'),
      width: 120,
    },
    useCopyColumn({
      field: 'payTxId',
      title: $t('finance.walletTx.payTxId'),
      width: 200,
    }),
    useCopyColumn({
      field: 'remark',
      title: $t('finance.walletTx.remark'),
      width: 200,
    }),
    {
      field: 'createdAt',
      title: $t('finance.walletTx.createdAt'),
      width: 160,
      formatter: ({ cellValue }) => formatBackendTime(cellValue),
    },
  );

  return columns;
}
