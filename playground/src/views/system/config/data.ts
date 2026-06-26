import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemConfigApi } from '#/api/system/config';

import { $t } from '#/locales';
import { usePreviewLink } from '#/utils/use-preview-link';
import { formatBackendTime } from '#/utils/value-format';

export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'id',
      label: $t('common.id'),
      disabled: true,
    },
    {
      component: 'Input',
      fieldName: 'key',
      label: $t('system.config.key'),
      rules: 'required',
      componentProps: {
        placeholder: $t('system.config.keyPlaceholder'),
        maxlength: 100,
      },
    },
    {
      component: 'Textarea',
      fieldName: 'value',
      label: $t('system.config.value'),
      rules: 'required',
      componentProps: {
        placeholder: $t('system.config.valuePlaceholder'),
        maxlength: 5000,
        rows: 4,
      },
    },
    {
      component: 'Switch',
      fieldName: 'status',
      label: $t('common.status'),
      componentProps: {
        checkedValue: 1,
        unCheckedValue: 0,
      },
      defaultValue: 1,
    },
    {
      component: 'Input',
      fieldName: 'remark',
      label: $t('common.remark'),
      componentProps: {
        placeholder: $t('system.config.remarkPlaceholder'),
        maxlength: 200,
      },
    },
  ];
}

export function formFieldsToRemoveForCreate(): string[] {
  return ['id'];
}

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'key',
      label: $t('system.config.key'),
      componentProps: {
        placeholder: $t('common.prefix'),
        allowClear: true,
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
      },
    },
  ];
}

export function useColumns<T = SystemConfigApi.SysConfig>(
  onActionClick: OnActionClickFn<T>,
  onPreview: (row: T) => void,
  onStatusChange?: (newStatus: any, row: T) => PromiseLike<boolean | undefined>,
): VxeTableGridOptions['columns'] {
  return [
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
      field: 'key',
      title: $t('system.config.key'),
      width: 200,
      sortable: true,
    },
    {
      field: 'value',
      title: $t('system.config.value'),
      minWidth: 200,
    },
    {
      field: 'status',
      title: $t('common.status'),
      width: 100,
      sortable: true,
      cellRender: {
        attrs: { beforeChange: onStatusChange },
        name: onStatusChange ? 'CellSwitch' : 'CellTag',
      },
    },
    {
      field: 'remark',
      title: $t('common.remark'),
      width: 200,
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
          nameField: 'key',
          nameTitle: $t('system.config.module'),
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
}
