import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { CmTenantWithdrawApi } from '#/api/cm-tenant';

import { $t } from '#/locales';

const statusOptions = [
  { label: $t('cm.tenantWithdraw.statusPending'), value: 0 },
  { label: $t('cm.tenantWithdraw.statusApproved'), value: 1 },
  { label: $t('cm.tenantWithdraw.statusPaid'), value: 2 },
  { label: $t('cm.tenantWithdraw.statusRejected'), value: 3 },
];

const payChannelOptions = [
  { label: 'Bank', value: 'bank' },
  { label: 'Alipay', value: 'alipay' },
  { label: 'WeChat', value: 'wechat' },
];

export function useApplyFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'InputNumber',
      fieldName: 'amount',
      label: $t('cm.tenantWithdraw.withdrawAmount'),
      rules: 'required',
      componentProps: {
        min: 0.01,
        step: 100,
        precision: 2,
        style: 'width: 100%',
      },
    },
    {
      component: 'Select',
      fieldName: 'payChannel',
      label: $t('cm.tenantWithdraw.payChannel'),
      rules: 'required',
      defaultValue: 'bank',
      componentProps: {
        options: payChannelOptions,
        style: 'width: 100%',
      },
    },
    {
      component: 'Input',
      fieldName: 'bankName',
      label: $t('cm.tenantWithdraw.bankName'),
      dependencies: {
        payChannel: (values, schema) => {
          schema.hidden = values.payChannel !== 'bank';
        },
        triggerFields: ['payChannel'],
      },
    },
    {
      component: 'Input',
      fieldName: 'bankAccountNo',
      label: $t('cm.tenantWithdraw.bankAccountNo'),
      dependencies: {
        payChannel: (values, schema) => {
          schema.hidden = values.payChannel !== 'bank';
        },
        triggerFields: ['payChannel'],
      },
    },
    {
      component: 'Input',
      fieldName: 'bankAccountName',
      label: $t('cm.tenantWithdraw.bankAccountName'),
      dependencies: {
        payChannel: (values, schema) => {
          schema.hidden = values.payChannel !== 'bank';
        },
        triggerFields: ['payChannel'],
      },
    },
    {
      component: 'Input',
      fieldName: 'alipayAccount',
      label: $t('cm.tenantWithdraw.alipayAccount'),
      dependencies: {
        payChannel: (values, schema) => {
          schema.hidden = values.payChannel !== 'alipay';
        },
        triggerFields: ['payChannel'],
      },
    },
    {
      component: 'Input',
      fieldName: 'wechatAccount',
      label: $t('cm.tenantWithdraw.wechatAccount'),
      dependencies: {
        payChannel: (values, schema) => {
          schema.hidden = values.payChannel !== 'wechat';
        },
        triggerFields: ['payChannel'],
      },
    },
  ];
}

export function useAuditFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'RadioGroup',
      fieldName: 'pass',
      label: $t('cm.tenantWithdraw.audit'),
      rules: 'required',
      defaultValue: true,
      componentProps: {
        options: [
          { label: $t('cm.tenantWithdraw.statusApproved'), value: true },
          { label: $t('cm.tenantWithdraw.statusRejected'), value: false },
        ],
      },
    },
    {
      component: 'Textarea',
      fieldName: 'auditRemark',
      label: $t('cm.tenantWithdraw.auditRemark'),
      componentProps: {
        rows: 3,
      },
    },
  ];
}

export function useConfirmPaidFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'InputNumber',
      fieldName: 'actualAmount',
      label: $t('cm.tenantWithdraw.actualAmount'),
      rules: 'required',
      componentProps: {
        min: 0.01,
        step: 100,
        precision: 2,
        style: 'width: 100%',
      },
    },
    {
      component: 'Input',
      fieldName: 'payTxNo',
      label: $t('cm.tenantWithdraw.payTxNo'),
      rules: 'required',
      componentProps: {
        style: 'width: 100%',
      },
    },
    {
      component: 'Textarea',
      fieldName: 'payRemark',
      label: $t('cm.tenantWithdraw.payRemark'),
      componentProps: {
        rows: 3,
      },
    },
  ];
}

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Select',
      fieldName: 'status',
      label: $t('cm.tenantWithdraw.status'),
      componentProps: {
        allowClear: true,
        options: statusOptions,
        placeholder: $t('cm.tenantWithdraw.status'),
        style: 'width: 100%',
      },
    },
    {
      component: 'Input',
      fieldName: 'withdrawNo',
      label: $t('cm.tenantWithdraw.withdrawNo'),
      componentProps: {
        allowClear: true,
        placeholder: $t('cm.tenantWithdraw.withdrawNo'),
        style: 'width: 100%',
      },
    },
  ];
}

function formatStatus(status: number): string {
  const map: Record<number, string> = {
    0: $t('cm.tenantWithdraw.statusPending'),
    1: $t('cm.tenantWithdraw.statusApproved'),
    2: $t('cm.tenantWithdraw.statusPaid'),
    3: $t('cm.tenantWithdraw.statusRejected'),
  };
  return map[status] ?? String(status);
}

export function useColumns<
  _T = CmTenantWithdrawApi.TenantWithdraw,
>(): VxeTableGridOptions['columns'] {
  return [
    {
      field: 'withdrawNo',
      title: $t('cm.tenantWithdraw.withdrawNo'),
      width: 200,
    },
    { field: 'tenantName', title: $t('cm.tenantCommission.title'), width: 120 },
    {
      field: 'withdrawAmount',
      title: $t('cm.tenantWithdraw.withdrawAmount'),
      width: 120,
      formatter: ({ cellValue }) => (cellValue as number).toFixed(2),
    },
    {
      field: 'feeAmount',
      title: $t('cm.tenantWithdraw.feeAmount'),
      width: 100,
      formatter: ({ cellValue }) => (cellValue as number).toFixed(2),
    },
    {
      field: 'actualAmount',
      title: $t('cm.tenantWithdraw.actualAmount'),
      width: 120,
      formatter: ({ cellValue }) =>
        cellValue ? (cellValue as number).toFixed(2) : '-',
    },
    {
      field: 'payChannel',
      title: $t('cm.tenantWithdraw.payChannel'),
      width: 100,
    },
    {
      field: 'status',
      title: $t('cm.tenantWithdraw.status'),
      width: 100,
      formatter: ({ cellValue }) => formatStatus(cellValue as number),
    },
    {
      field: 'applicantName',
      title: $t('cm.tenantWithdraw.apply'),
      width: 100,
    },
    { field: 'auditorName', title: $t('cm.tenantWithdraw.audit'), width: 100 },
    {
      field: 'createdAt',
      title: $t('common.createdAt'),
      width: 160,
      sortable: true,
    },
    {
      align: 'center',
      field: 'operation',
      fixed: 'right',
      slots: { default: 'operation' },
      title: $t('common.operation'),
      width: 180,
    },
  ];
}
