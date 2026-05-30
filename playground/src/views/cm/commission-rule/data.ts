import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { CmCommissionRuleApi } from '#/api/cm/commission-rule';

import { $t } from '#/locales';

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
      fieldName: 'level',
      label: $t('cm.commissionRule.level'),
      rules: 'required',
      componentProps: {
        min: 1,
        max: 10,
        placeholder: $t('cm.commissionRule.level'),
        style: 'width: 100%',
      },
    },
    {
      component: 'InputNumber',
      fieldName: 'rate',
      label: $t('cm.commissionRule.rate'),
      rules: 'required',
      componentProps: {
        min: 0,
        max: 1,
        step: 0.0001,
        precision: 4,
        placeholder: $t('cm.commissionRule.ratePlaceholder'),
        style: 'width: 100%',
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
      component: 'InputNumber',
      fieldName: 'level',
      label: $t('cm.commissionRule.level'),
      componentProps: {
        min: 1,
        allowClear: true,
        placeholder: $t('cm.commissionRule.level'),
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
      field: 'level',
      title: $t('cm.commissionRule.level'),
      width: 100,
      formatter: ({ cellValue }) => {
        return $t('cm.commissionRule.levelN', [cellValue]);
      },
    },
    {
      field: 'rate',
      title: $t('cm.commissionRule.rate'),
      width: 140,
      formatter: ({ cellValue }) => {
        return `${(cellValue * 100).toFixed(2)}%`;
      },
    },
    {
      field: 'maxAmount',
      title: $t('cm.commissionRule.maxAmount'),
      width: 140,
      formatter: ({ cellValue }) => {
        return cellValue > 0
          ? cellValue.toFixed(2)
          : $t('cm.commissionRule.unlimited');
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
          nameTitle: $t('cm.commissionRule.moduleShort'),
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
