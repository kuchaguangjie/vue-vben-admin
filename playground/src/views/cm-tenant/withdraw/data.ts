import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { CmTenantWithdrawApi } from '#/api/cm-tenant';

import { $t } from '#/locales';

const statusOptions = [
  { label: $t('cm.tenantWithdraw.statusPending'), value: 0 },
  { label: $t('cm.tenantWithdraw.statusPaid'), value: 2 },
  { label: $t('cm.tenantWithdraw.statusRejected'), value: 3 },
];

function maskAccount(text: string): string {
  if (!text) return '-';
  if (text.includes('@')) {
    const [name, domain] = text.split('@');
    return `${name[0]}***@${domain}`;
  }
  if (text.length <= 4) return '****';
  return `****${text.slice(-4)}`;
}

export function formatChannelInfo(
  row: CmTenantWithdrawApi.TenantWithdraw,
): string {
  switch (row.payChannel) {
    case 'alipay': {
      return `${maskAccount(row.alipayAccount)}`;
    }
    case 'bank': {
      return `${row.bankName || '-'} / ${maskAccount(row.bankAccountNo)} / ${row.bankAccountName || '-'}`;
    }
    case 'wechat': {
      return `${maskAccount(row.wechatAccount)}`;
    }
    default: {
      return '-';
    }
  }
}

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
    {
      component: 'RangePicker',
      fieldName: 'createdAtRangeMs',
      label: $t('common.createdAt'),
      componentProps: {
        valueFormat: 'x',
      },
    },
    {
      component: 'InputNumber',
      fieldName: 'amountMin',
      label: $t('cm.tenantWithdraw.amountMin'),
      componentProps: {
        min: 0,
        precision: 2,
        placeholder: $t('cm.tenantWithdraw.amountMin'),
        style: 'width: 100%',
      },
    },
    {
      component: 'InputNumber',
      fieldName: 'amountMax',
      label: $t('cm.tenantWithdraw.amountMax'),
      componentProps: {
        min: 0,
        precision: 2,
        placeholder: $t('cm.tenantWithdraw.amountMax'),
        style: 'width: 100%',
      },
    },
  );

  return schema;
}

function formatStatus(status: number): string {
  const map: Record<number, string> = {
    0: $t('cm.tenantWithdraw.statusPending'),
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
    {
      field: 'tenantId',
      title: $t('system.tenant.id'),
      width: 80,
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
