import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { FinanceCurrencyApi } from '#/api/finance';

import { $t } from '#/locales';
import { usePreviewLink } from '#/utils/use-preview-link';
import { formatBackendTime } from '#/utils/value-format';

export function useFormSchema(): VbenFormSchema[] {
  const schema: VbenFormSchema[] = [
    {
      component: 'Input',
      fieldName: 'id',
      label: $t('common.id'),
      disabled: true,
    },
    {
      component: 'Input',
      fieldName: 'code',
      label: $t('finance.currency.code'),
      rules: 'required',
      componentProps: {
        placeholder: 'CNY, USD, EUR',
        maxlength: 10,
      },
    },
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('finance.currency.name'),
      rules: 'required',
      componentProps: {
        placeholder: '人民币, 美元',
        maxlength: 50,
      },
    },
    {
      component: 'Input',
      fieldName: 'symbol',
      label: $t('finance.currency.symbol'),
      rules: 'required',
      componentProps: {
        placeholder: '¥, $, €',
        maxlength: 10,
      },
    },
    {
      component: 'InputNumber',
      fieldName: 'rateToCny',
      label: $t('finance.currency.rateToCny'),
      rules: 'required',
      componentProps: {
        min: 0.0001,
        precision: 4,
      },
    },
    {
      component: 'InputNumber',
      fieldName: 'minRecharge',
      label: $t('finance.currency.minRecharge'),
      componentProps: {
        min: 0,
        precision: 4,
      },
    },
    {
      component: 'InputNumber',
      fieldName: 'maxRecharge',
      label: $t('finance.currency.maxRecharge'),
      componentProps: {
        min: 0,
        precision: 4,
      },
    },
    {
      component: 'InputNumber',
      fieldName: 'minWithdraw',
      label: $t('finance.currency.minWithdraw'),
      componentProps: {
        min: 0,
        precision: 4,
      },
    },
    {
      component: 'InputNumber',
      fieldName: 'maxWithdraw',
      label: $t('finance.currency.maxWithdraw'),
      componentProps: {
        min: 0,
        precision: 4,
      },
    },
    {
      component: 'InputNumber',
      fieldName: 'sort',
      label: $t('finance.currency.sort'),
      componentProps: {
        min: 0,
        precision: 0,
      },
    },
    {
      component: 'Switch',
      fieldName: 'enabled',
      label: $t('finance.currency.enabled'),
      componentProps: {
        checkedValue: true,
        unCheckedValue: false,
      },
      defaultValue: true,
    },
  ];

  return schema;
}

export function formFieldsToRemoveForCreate(): string[] {
  return ['id'];
}

export function formFieldsToRemoveForPreview(): string[] {
  return [];
}

export function useGridFormSchema(): VbenFormSchema[] {
  const schema: VbenFormSchema[] = [
    {
      component: 'Input',
      fieldName: 'code',
      label: $t('finance.currency.code'),
      componentProps: {
        placeholder: $t('common.prefix'),
        allowClear: true,
      },
    },
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('finance.currency.name'),
      componentProps: {
        placeholder: $t('common.prefix'),
        allowClear: true,
      },
    },
    {
      component: 'Select',
      fieldName: 'enabled',
      label: $t('finance.currency.enabled'),
      componentProps: {
        allowClear: true,
        options: [
          { label: $t('common.enabled'), value: true },
          { label: $t('common.disabled'), value: false },
        ],
      },
    },
  ];

  return schema;
}

export function useColumns<T = FinanceCurrencyApi.Currency>(
  onActionClick: OnActionClickFn<T>,
  onPreview: (row: T) => void,
  onStatusChange?: (newStatus: any, row: T) => PromiseLike<boolean | undefined>,
): VxeTableGridOptions['columns'] {
  const columns: VxeTableGridOptions['columns'] = [
    usePreviewLink(
      {
        field: 'id',
        title: $t('common.id'),
        width: 90,
        sortable: true,
      },
      onPreview,
    ),
    {
      field: 'code',
      title: $t('finance.currency.code'),
      width: 120,
      sortable: true,
    },
    {
      field: 'name',
      title: $t('finance.currency.name'),
      width: 150,
      sortable: true,
    },
    {
      field: 'symbol',
      title: $t('finance.currency.symbol'),
      width: 100,
    },
    {
      field: 'rateToCny',
      title: $t('finance.currency.rateToCny'),
      width: 120,
      sortable: true,
      formatter: ({ cellValue }) => (cellValue ?? 0).toFixed(4),
    },
    {
      field: 'sort',
      title: $t('finance.currency.sort'),
      width: 90,
      sortable: true,
    },
    {
      field: 'enabled',
      title: $t('finance.currency.enabled'),
      width: 100,
      sortable: true,
      cellRender: {
        attrs: { beforeChange: onStatusChange },
        props: {
          checkedValue: true,
          unCheckedValue: false,
        },
        name: onStatusChange ? 'CellSwitch' : 'CellTag',
      },
    },
    {
      field: 'createdAt',
      title: $t('common.createdAt'),
      width: 160,
      sortable: true,
      formatter: ({ cellValue }) => formatBackendTime(cellValue),
    },
    {
      align: 'center',
      cellRender: {
        attrs: {
          nameField: 'name',
          nameTitle: $t('finance.currency.module'),
          onClick: onActionClick,
        },
        name: 'CellOperation',
      },
      field: 'operation',
      fixed: 'right',
      title: $t('common.operation'),
      width: 130,
    },
  ];

  return columns;
}
