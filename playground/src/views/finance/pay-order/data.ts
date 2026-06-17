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

function getTypeLabel(type: string): string {
  switch (type) {
    case 'recharge': {
      return $t('finance.payOrder.typeRecharge');
    }
    case 'withdraw': {
      return $t('finance.payOrder.typeWithdraw');
    }
    default: {
      return type;
    }
  }
}

function getChannelLabel(channel: string): string {
  switch (channel) {
    case 'alipay': {
      return $t('finance.payOrder.channelAlipay');
    }
    case 'bank': {
      return $t('finance.payOrder.channelBank');
    }
    case 'wechat': {
      return $t('finance.payOrder.channelWechat');
    }
    default: {
      return channel;
    }
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'expired': {
      return 'default';
    }
    case 'failed': {
      return 'red';
    }
    case 'paid': {
      return 'green';
    }
    case 'pending': {
      return 'orange';
    }
    case 'refunded': {
      return 'purple';
    }
    default: {
      return 'default';
    }
  }
}

export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'id',
      label: $t('finance.payOrder.id'),
      disabled: true,
    },
    {
      component: 'Input',
      fieldName: 'tenantId',
      label: $t('finance.payOrder.tenantId'),
      disabled: true,
    },
    {
      component: 'Input',
      fieldName: 'userId',
      label: $t('finance.payOrder.userId'),
      disabled: true,
    },
    {
      component: 'Input',
      fieldName: 'orderNo',
      label: $t('finance.payOrder.orderNo'),
      disabled: true,
    },
    {
      component: 'Input',
      fieldName: 'type',
      label: $t('finance.payOrder.type'),
      disabled: true,
    },
    {
      component: 'Input',
      fieldName: 'channel',
      label: $t('finance.payOrder.channel'),
      disabled: true,
    },
    {
      component: 'Input',
      fieldName: 'currency',
      label: $t('finance.payOrder.currency'),
      disabled: true,
    },
    {
      component: 'Input',
      fieldName: 'amount',
      label: $t('finance.payOrder.amount'),
      disabled: true,
    },
    {
      component: 'Input',
      fieldName: 'status',
      label: $t('finance.payOrder.status'),
      disabled: true,
    },
    {
      component: 'Input',
      fieldName: 'payUrl',
      label: $t('finance.payOrder.payUrl'),
      disabled: true,
    },
    {
      component: 'Input',
      fieldName: 'thirdPartyId',
      label: $t('finance.payOrder.thirdPartyId'),
      disabled: true,
    },
    {
      component: 'Input',
      fieldName: 'errorMsg',
      label: $t('finance.payOrder.errorMsg'),
      disabled: true,
    },
    {
      component: 'Input',
      fieldName: 'createdAt',
      label: $t('finance.payOrder.createdAt'),
      disabled: true,
    },
    {
      component: 'Input',
      fieldName: 'paidAt',
      label: $t('finance.payOrder.paidAt'),
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
      fieldName: 'orderNo',
      label: $t('finance.payOrder.orderNo'),
      componentProps: {
        allowClear: true,
        placeholder: '',
      },
    },
    {
      component: 'Input',
      fieldName: 'userId',
      label: $t('finance.payOrder.userId'),
      componentProps: {
        type: 'number',
        allowClear: true,
        placeholder: '',
      },
    },
    {
      component: 'Select',
      fieldName: 'type',
      label: $t('finance.payOrder.type'),
      componentProps: {
        allowClear: true,
        placeholder: '',
        options: [
          { label: $t('finance.payOrder.typeRecharge'), value: 'recharge' },
          { label: $t('finance.payOrder.typeWithdraw'), value: 'withdraw' },
        ],
      },
    },
    {
      component: 'Select',
      fieldName: 'channel',
      label: $t('finance.payOrder.channel'),
      componentProps: {
        allowClear: true,
        placeholder: '',
        options: [
          { label: $t('finance.payOrder.channelWechat'), value: 'wechat' },
          { label: $t('finance.payOrder.channelAlipay'), value: 'alipay' },
          { label: $t('finance.payOrder.channelBank'), value: 'bank' },
        ],
      },
    },
    {
      component: 'Select',
      fieldName: 'status',
      label: $t('finance.payOrder.status'),
      componentProps: {
        allowClear: true,
        placeholder: '',
        options: [
          { label: $t('finance.payOrder.statusPending'), value: 'pending' },
          { label: $t('finance.payOrder.statusPaid'), value: 'paid' },
          { label: $t('finance.payOrder.statusFailed'), value: 'failed' },
          { label: $t('finance.payOrder.statusExpired'), value: 'expired' },
          { label: $t('finance.payOrder.statusRefunded'), value: 'refunded' },
        ],
      },
    },
    {
      component: 'Select',
      fieldName: 'currency',
      label: $t('finance.payOrder.currency'),
      componentProps: {
        allowClear: true,
        placeholder: '',
        options: [
          { label: 'CNY', value: 'CNY' },
          { label: 'USD', value: 'USD' },
        ],
      },
    },
  ];

  if (saasEnabled.value && isPlatformAdmin) {
    schema.unshift({
      component: 'Input',
      fieldName: 'tenantId',
      label: $t('finance.payOrder.tenantId'),
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
        title: $t('finance.payOrder.id'),
        width: 80,
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
      title: $t('finance.payOrder.userId'),
      width: 90,
      formatter: ({ row }) => row.userId,
    },
    useUserCoreColumn(
      {
        field: 'userId',
        title: $t('finance.payOrder.userNick'),
        width: 120,
      },
      userCoreMapRef,
    ),
    useCopyColumn({
      field: 'orderNo',
      title: $t('finance.payOrder.orderNo'),
      width: 230,
    }),
    {
      field: 'type',
      title: $t('finance.payOrder.type'),
      width: 90,
      formatter: ({ cellValue }) => getTypeLabel(cellValue),
    },
    {
      field: 'channel',
      title: $t('finance.payOrder.channel'),
      width: 90,
      formatter: ({ cellValue }) => getChannelLabel(cellValue),
    },
    {
      field: 'currency',
      title: $t('finance.payOrder.currency'),
      width: 90,
    },
    {
      field: 'amount',
      title: $t('finance.payOrder.amount'),
      width: 110,
      formatter: ({ cellValue, row }) => {
        const symbol = row.currency === 'CNY' ? '¥' : '$';
        return `${symbol}${cellValue}`;
      },
    },
    {
      field: 'status',
      title: $t('finance.payOrder.status'),
      width: 100,
      slots: { default: 'status' },
    },
    useCopyColumn({
      field: 'thirdPartyId',
      title: $t('finance.payOrder.thirdPartyId'),
      width: 180,
    }),
    {
      field: 'createdAt',
      title: $t('finance.payOrder.createdAt'),
      width: 160,
      formatter: ({ cellValue }) => formatBackendTime(cellValue),
    },
    {
      field: 'paidAt',
      title: $t('finance.payOrder.paidAt'),
      width: 160,
      formatter: ({ cellValue }) => formatBackendTime(cellValue),
    },
  );

  return columns;
}
