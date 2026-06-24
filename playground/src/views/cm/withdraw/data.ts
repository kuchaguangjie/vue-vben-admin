import type { VbenFormSchema } from '@vben/common-ui';

import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { CmUserWithdrawApi } from '#/api/cm';

import { $t } from '#/locales';
import { formatBackendTime } from '#/utils/value-format';

const statusOptions = [
  { label: $t('cm.tenantWithdraw.statusPending'), value: 0 },
  { label: $t('cm.tenantWithdraw.statusApproved'), value: 1 },
  { label: $t('cm.tenantWithdraw.statusPaid'), value: 2 },
  { label: $t('cm.tenantWithdraw.statusRejected'), value: 3 },
];

export function formatChannelInfo(row: {
  alipayAccount?: string;
  bankAccountName?: string;
  bankAccountNo?: string;
  bankName?: string;
  payChannel: string;
  wechatAccount?: string;
}): string {
  switch (row.payChannel) {
    case 'alipay': {
      return row.alipayAccount || '';
    }
    case 'bank': {
      return `${row.bankName || ''} ${row.bankAccountNo || ''} ${row.bankAccountName || ''}`.trim();
    }
    case 'wechat': {
      return row.wechatAccount || '';
    }
    default: {
      return '';
    }
  }
}

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

  schema.push(
    {
      component: 'Input',
      fieldName: 'userId',
      label: $t('cm.userWithdraw.userId'),
      componentProps: {
        type: 'number',
        allowClear: true,
        placeholder: $t('cm.userWithdraw.userIdPlaceholder'),
      },
    },
    {
      component: 'Select',
      fieldName: 'status',
      label: $t('cm.tenantWithdraw.status'),
      componentProps: {
        options: statusOptions,
        clearable: true,
      },
    },
    {
      component: 'Select',
      fieldName: 'currency',
      label: $t('cm.tenantWithdraw.currency'),
      componentProps: {
        options: [
          { label: 'CNY', value: 'CNY' },
          { label: 'USD', value: 'USD' },
        ],
        clearable: true,
      },
    },
    {
      component: 'DateRangePicker',
      fieldName: 'dateRange',
      label: $t('common.createdAt'),
      componentProps: {
        valueFormat: 'YYYY-MM-DD',
      },
    },
  );

  return schema;
}

export function useColumns(): VxeTableGridOptions['columns'] {
  return [
    { field: 'id', title: 'ID', width: 80 },
    {
      field: 'withdrawNo',
      title: $t('cm.tenantWithdraw.withdrawNo'),
      width: 200,
    },
    {
      field: 'tenantName',
      title: $t('cm.tenantWithdraw.tenantName'),
      width: 120,
    },
    { field: 'userName', title: $t('cm.userWithdraw.userName'), width: 120 },
    {
      field: 'withdrawAmount',
      title: $t('cm.tenantWithdraw.withdrawAmount'),
      width: 120,
    },
    {
      field: 'feeAmount',
      title: $t('cm.tenantWithdraw.feeAmount'),
      width: 100,
    },
    {
      field: 'actualAmount',
      title: $t('cm.tenantWithdraw.actualAmount'),
      width: 120,
    },
    {
      field: 'payChannel',
      title: $t('cm.tenantWithdraw.payChannel'),
      width: 100,
    },
    {
      field: 'currency',
      title: $t('cm.tenantWithdraw.currency'),
      width: 80,
    },
    {
      field: 'status',
      title: $t('cm.tenantWithdraw.status'),
      width: 120,
      slots: { default: 'status' },
    },
    {
      field: 'createdAt',
      title: $t('common.createdAt'),
      width: 180,
      formatter: ({ row }: { row: CmUserWithdrawApi.UserWithdraw }) =>
        formatBackendTime(row.createdAt),
    },
    {
      field: 'operation',
      title: $t('common.operation'),
      width: 160,
      fixed: 'right',
      slots: { default: 'operation' },
    },
  ];
}

export function useApplyFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'InputNumber',
      fieldName: 'amount',
      label: $t('cm.userWithdraw.withdrawAmount'),
      rules: 'required',
      componentProps: {
        min: 0.01,
        step: 100,
        precision: 2,
        style: 'width: 100%',
      },
    },
    {
      component: 'RadioGroup',
      fieldName: 'payChannel',
      label: $t('cm.userWithdraw.payChannel'),
      rules: 'required',
      defaultValue: 'bank',
      componentProps: {
        options: [
          { label: $t('cm.userWithdraw.bankTransfer'), value: 'bank' },
          { label: $t('cm.userWithdraw.alipay'), value: 'alipay' },
          { label: $t('cm.userWithdraw.wechat'), value: 'wechat' },
        ],
      },
    },
    {
      component: 'Input',
      fieldName: 'bankName',
      label: $t('cm.userWithdraw.bankName'),
      componentProps: {
        style: 'width: 100%',
      },
      dependencies: {
        triggerFields: ['payChannel'],
        show: (values) => values.payChannel === 'bank',
      },
    },
    {
      component: 'Input',
      fieldName: 'bankAccountNo',
      label: $t('cm.userWithdraw.bankAccountNo'),
      rules: 'required',
      componentProps: {
        style: 'width: 100%',
      },
      dependencies: {
        triggerFields: ['payChannel'],
        show: (values) => values.payChannel === 'bank',
      },
    },
    {
      component: 'Input',
      fieldName: 'bankAccountName',
      label: $t('cm.userWithdraw.bankAccountName'),
      rules: 'required',
      componentProps: {
        style: 'width: 100%',
      },
      dependencies: {
        triggerFields: ['payChannel'],
        show: (values) => values.payChannel === 'bank',
      },
    },
    {
      component: 'Input',
      fieldName: 'alipayAccount',
      label: $t('cm.userWithdraw.alipayAccount'),
      rules: 'required',
      componentProps: {
        style: 'width: 100%',
      },
      dependencies: {
        triggerFields: ['payChannel'],
        show: (values) => values.payChannel === 'alipay',
      },
    },
    {
      component: 'Input',
      fieldName: 'wechatAccount',
      label: $t('cm.userWithdraw.wechatAccount'),
      rules: 'required',
      componentProps: {
        style: 'width: 100%',
      },
      dependencies: {
        triggerFields: ['payChannel'],
        show: (values) => values.payChannel === 'wechat',
      },
    },
  ];
}

export function useReviewFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'RadioGroup',
      fieldName: 'pass',
      label: $t('cm.tenantWithdraw.review'),
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
      fieldName: 'remark',
      label: $t('cm.tenantWithdraw.reviewRemark'),
      componentProps: {
        rows: 3,
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
          { label: $t('cm.tenantWithdraw.statusPaid'), value: true },
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
    {
      component: 'InputNumber',
      fieldName: 'actualAmount',
      label: $t('cm.tenantWithdraw.actualAmount'),
      componentProps: {
        min: 0.01,
        step: 100,
        precision: 2,
        style: 'width: 100%',
      },
      dependencies: {
        triggerFields: ['pass'],
        show: (values) => values.pass === true,
      },
    },
    {
      component: 'Input',
      fieldName: 'payTxNo',
      label: $t('cm.tenantWithdraw.payTxNo'),
      componentProps: {
        style: 'width: 100%',
      },
      dependencies: {
        triggerFields: ['pass'],
        show: (values) => values.pass === true,
      },
    },
    {
      component: 'Textarea',
      fieldName: 'payRemark',
      label: $t('cm.tenantWithdraw.payRemark'),
      componentProps: {
        rows: 3,
      },
      dependencies: {
        triggerFields: ['pass'],
        show: (values) => values.pass === true,
      },
    },
  ];
}
