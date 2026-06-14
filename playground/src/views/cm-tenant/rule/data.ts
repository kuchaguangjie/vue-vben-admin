import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { CmCommissionRuleApi } from '#/api/cm-tenant';

import { $t } from '#/locales';

const numberInputProps = {
  min: 0,
  max: 1,
  step: 0.0001,
  precision: 4,
  style: 'width: 100%',
};

export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'sceneKey',
      label: $t('cm.commissionRule.sceneKey'),
      rules: 'required',
      componentProps: {
        placeholder: $t('cm.commissionRule.sceneKeyPlaceholder'),
      },
    },
    {
      component: 'InputNumber',
      fieldName: 'totalRate',
      label: $t('cm.commissionRule.totalRate'),
      rules: 'required',
      defaultValue: 0.15,
      componentProps: {
        ...numberInputProps,
        placeholder: $t('cm.commissionRule.totalRatePlaceholder'),
      },
    },
    {
      component: 'InputNumber',
      fieldName: 'tenantMaxLevel',
      label: $t('cm.commissionRule.tenantMaxLevel'),
      defaultValue: 1,
      componentProps: {
        min: 0,
        max: 10,
        placeholder: $t('cm.commissionRule.tenantMaxLevel'),
        style: 'width: 100%',
      },
    },
    {
      component: 'InputNumber',
      fieldName: 'tenantLevel1Rate',
      label: $t('cm.commissionRule.tenantLevel1Rate'),
      defaultValue: 0.02,
      componentProps: {
        ...numberInputProps,
        placeholder: $t('cm.commissionRule.tenantLevel1Rate'),
      },
    },
    {
      component: 'InputNumber',
      fieldName: 'maxAmount',
      label: $t('cm.commissionRule.maxAmount'),
      componentProps: {
        min: 0,
        step: 0.01,
        precision: 2,
        placeholder: $t('cm.commissionRule.maxAmountPlaceholder'),
        style: 'width: 100%',
      },
    },
    {
      component: 'RadioGroup',
      fieldName: 'status',
      label: $t('common.status'),
      defaultValue: 1,
      componentProps: {
        options: [
          { label: $t('common.enabled'), value: 1 },
          { label: $t('common.disabled'), value: 0 },
        ],
      },
    },
    {
      component: 'Textarea',
      fieldName: 'remark',
      label: $t('common.remark'),
      componentProps: {
        placeholder: $t('common.remark'),
        rows: 3,
      },
    },
  ];
}

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'sceneKey',
      label: $t('cm.commissionRule.sceneKey'),
      componentProps: {
        allowClear: true,
        placeholder: $t('cm.commissionRule.sceneKey'),
        style: 'width: 100%',
      },
    },
    {
      component: 'Select',
      fieldName: 'status',
      label: $t('common.status'),
      componentProps: {
        allowClear: true,
        options: [
          { label: $t('common.enabled'), value: 1 },
          { label: $t('common.disabled'), value: 0 },
        ],
        placeholder: $t('common.status'),
        style: 'width: 100%',
      },
    },
  ];
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

export function useColumns<T = CmCommissionRuleApi.CmCommissionRule>(
  onActionClick: OnActionClickFn<T>,
  onStatusChange: (row: T, value: number) => void,
): VxeTableGridOptions['columns'] {
  return [
    {
      field: 'sceneKey',
      title: $t('cm.commissionRule.sceneKey'),
      width: 160,
    },
    {
      field: 'totalRate',
      title: $t('cm.commissionRule.totalRate'),
      width: 120,
      formatter: ({ cellValue }) => formatPercent(cellValue as number),
    },
    {
      field: 'tenantMaxLevel',
      title: $t('cm.commissionRule.tenantMaxLevel'),
      width: 120,
      formatter: ({ cellValue }) => `${cellValue}级`,
    },
    {
      field: 'tenantLevel1Rate',
      title: $t('cm.commissionRule.tenantLevel1Rate'),
      width: 130,
      formatter: ({ cellValue }) => formatPercent(cellValue as number),
    },
    {
      field: 'maxAmount',
      title: $t('cm.commissionRule.maxAmount'),
      width: 140,
      formatter: ({ cellValue }) => {
        const value = cellValue as number;
        return value > 0 ? value.toFixed(2) : $t('cm.commissionRule.unlimited');
      },
    },
    {
      field: 'status',
      title: $t('common.status'),
      width: 120,
      cellRender: {
        name: 'CellSwitch',
        attrs: {
          onCheckedChange: (val: boolean, row: T) =>
            onStatusChange(row, val ? 1 : 0),
        },
      },
    },
    {
      field: 'remark',
      title: $t('common.remark'),
      minWidth: 150,
    },
    {
      field: 'createdAt',
      title: $t('common.createdAt'),
      width: 160,
      sortable: true,
    },
    {
      align: 'center',
      cellRender: {
        attrs: {
          nameField: 'sceneKey',
          nameTitle: $t('cm.tenantCommissionRule.moduleShort'),
          onClick: onActionClick,
        },
        name: 'CellOperation',
      },
      field: 'operation',
      fixed: 'right',
      title: $t('common.operation'),
      width: 160,
    },
  ];
}
