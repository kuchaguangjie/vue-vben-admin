import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { CmTenantWithdrawAccountApi } from '#/api/cm-tenant';

import { $t } from '#/locales';
import { formatBackendTime } from '#/utils/value-format';

const cnyPayChannelOptions = [
  { label: $t('cm.tenantWithdrawAccount.payChannelBank'), value: 'bank' },
  { label: $t('cm.tenantWithdrawAccount.payChannelAlipay'), value: 'alipay' },
  { label: $t('cm.tenantWithdrawAccount.payChannelWechat'), value: 'wechat' },
];

const usdPayChannelOptions = [
  { label: $t('cm.tenantWithdrawAccount.payChannelUsd'), value: 'usd' },
];

export function useGridFormSchema(isPlatformAdmin = false): VbenFormSchema[] {
  const schema: VbenFormSchema[] = [];
  if (isPlatformAdmin) {
    schema.push({
      component: 'Input',
      fieldName: 'tenantId',
      label: $t('system.tenant.id'),
      componentProps: {
        type: 'number',
        allowClear: true,
        placeholder: $t('cm.tenantWithdraw.tenantIdPlaceholder'),
      },
    });
  }
  return schema;
}

export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Select',
      fieldName: 'currency',
      label: $t('cm.tenantWithdraw.currency'),
      rules: 'required',
      defaultValue: 'CNY',
      componentProps: {
        options: [
          { label: 'CNY', value: 'CNY' },
          { label: 'USD', value: 'USD' },
        ],
        style: 'width: 100%',
      },
    },
    {
      component: 'Select',
      fieldName: 'payChannel',
      label: $t('cm.tenantWithdrawAccount.payChannel'),
      rules: 'required',
      componentProps: {
        options: cnyPayChannelOptions,
        placeholder: $t('cm.tenantWithdrawAccount.payChannelPlaceholder'),
      },
      dependencies: {
        triggerFields: ['currency'],
        componentProps: (values) => {
          if (values.currency === 'USD') {
            return { options: usdPayChannelOptions };
          }
          return { options: cnyPayChannelOptions };
        },
      },
    },
    {
      component: 'Input',
      fieldName: 'bankName',
      label: $t('cm.tenantWithdrawAccount.bankName'),
      dependencies: {
        triggerFields: ['payChannel'],
        show: (values) => values.payChannel === 'bank',
      },
    },
    {
      component: 'Input',
      fieldName: 'bankAccountNo',
      label: $t('cm.tenantWithdrawAccount.bankAccountNo'),
      dependencies: {
        triggerFields: ['payChannel'],
        show: (values) => values.payChannel === 'bank',
      },
    },
    {
      component: 'Input',
      fieldName: 'bankAccountName',
      label: $t('cm.tenantWithdrawAccount.bankAccountName'),
      dependencies: {
        triggerFields: ['payChannel'],
        show: (values) => values.payChannel === 'bank',
      },
    },
    {
      component: 'Input',
      fieldName: 'alipayAccount',
      label: $t('cm.tenantWithdrawAccount.alipayAccount'),
      dependencies: {
        triggerFields: ['payChannel'],
        show: (values) => values.payChannel === 'alipay',
      },
    },
    {
      component: 'Input',
      fieldName: 'wechatAccount',
      label: $t('cm.tenantWithdrawAccount.wechatAccount'),
      dependencies: {
        triggerFields: ['payChannel'],
        show: (values) => values.payChannel === 'wechat',
      },
    },
    {
      component: 'Switch',
      fieldName: 'isDefault',
      label: $t('cm.tenantWithdrawAccount.isDefault'),
      defaultValue: false,
    },
  ];
}

export function useColumns(): VxeTableGridOptions<CmTenantWithdrawAccountApi.WithdrawAccount>['columns'] {
  return [
    { field: 'id', title: 'ID', width: 80 },
    {
      field: 'tenantId',
      title: $t('system.tenant.id'),
      width: 80,
    },
    {
      field: 'currency',
      title: $t('cm.tenantWithdrawAccount.currency'),
      width: 80,
    },
    {
      field: 'payChannel',
      title: $t('cm.tenantWithdrawAccount.payChannel'),
      width: 120,
      slots: { default: 'payChannel' },
    },
    {
      field: 'bankName',
      title: $t('cm.tenantWithdrawAccount.bankName'),
      width: 150,
    },
    {
      field: 'bankAccountNo',
      title: $t('cm.tenantWithdrawAccount.bankAccountNo'),
      width: 200,
    },
    {
      field: 'bankAccountName',
      title: $t('cm.tenantWithdrawAccount.bankAccountName'),
      width: 120,
    },
    {
      field: 'alipayAccount',
      title: $t('cm.tenantWithdrawAccount.alipayAccount'),
      width: 180,
    },
    {
      field: 'wechatAccount',
      title: $t('cm.tenantWithdrawAccount.wechatAccount'),
      width: 180,
    },
    {
      field: 'isDefault',
      title: $t('cm.tenantWithdrawAccount.isDefault'),
      width: 100,
      slots: { default: 'isDefault' },
    },
    {
      field: 'createdAt',
      title: $t('common.createdAt'),
      width: 180,
      formatter: ({ cellValue }) => formatBackendTime(cellValue as string),
    },
    {
      field: 'action',
      title: $t('common.operation'),
      width: 140,
      fixed: 'right',
      slots: { default: 'action' },
    },
  ];
}
