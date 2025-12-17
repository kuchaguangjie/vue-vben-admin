import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemApiApi } from '#/api';

import { $t } from '#/locales';
import { formatBackendTime } from '#/utils/valueFormat';

export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'path',
      label: $t('system.api.path'),
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'action',
      label: $t('system.api.action'),
      rules: 'required',
    },
    {
      component: 'Select',
      fieldName: 'type',
    },
    {
      component: 'Input',
      fieldName: 'version',
    },
    {
      component: 'InputNumber',
      fieldName: 'pid',
      label: $t('system.api.pid'),
      rules: 'required',
      defaultValue: 0,
    },
    {
      component: 'RadioGroup',
      componentProps: {
        buttonStyle: 'solid',
        options: [
          { label: $t('common.enabled'), value: 1 },
          { label: $t('common.disabled'), value: 0 },
        ],
        optionType: 'button',
      },
      defaultValue: 1,
      fieldName: 'status',
      label: $t('system.api.status'),
    },
    {
      component: 'Textarea',
      fieldName: 'remark',
      label: $t('system.api.remark'),
    },
  ];
}

// single - edit - set fields
export function useFormSchemaExtraEdit(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'version',
      label: '', // 空标签使其不显示
      componentProps: {
        style: { display: 'none' }, // 隐藏输入框
        disabled: true, // 使其不可编辑
      },
    },
  ];
}

// single - new - add fields
export function useFormSchemaExtraNew(): VbenFormSchema[] {
  return [
    {
      component: 'Select',
      fieldName: 'type',
      label: $t('common.type'),
      componentProps: {
        allowClear: true,
        options: [
          { label: $t('system.api.typeApi'), value: 0 },
          { label: $t('system.api.typeDir'), value: 1 },
        ],
      },
      rules: 'required',
    },
  ];
}

// single - edit - remove fields
export function useFormSchemaRemoveEdit(): string[] {
  return ['type'];
}

// single - new - remove fields
export function useFormSchemaRemoveNew(): string[] {
  return ['version'];
}

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'path',
      label: $t('system.api.path'),
      componentProps: {
        placeholder: $t('common.prefix'),
      },
    },
    {
      component: 'Input',
      fieldName: 'action',
      label: $t('system.api.action'),
    },
    { component: 'InputNumber', fieldName: 'id', label: $t('system.api.id') },
    { component: 'InputNumber', fieldName: 'pid', label: $t('system.api.pid') },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [
          { label: $t('system.api.typeApi'), value: 0 },
          { label: $t('system.api.typeDir'), value: 1 },
        ],
      },
      fieldName: 'type',
      label: $t('common.type'),
    },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [
          { label: $t('common.enabled'), value: 1 },
          { label: $t('common.disabled'), value: 0 },
        ],
      },
      fieldName: 'status',
      label: $t('system.api.status'),
    },
    {
      component: 'RangePicker',
      fieldName: 'createdAtRangeMs',
      label: $t('common.createdAt'),
      componentProps: {
        valueFormat: 'x', // in ms
        showTime: true, // 选择 时/分/秒
      },
    },
  ];
}

export function useColumns<T = SystemApiApi.SystemApi>(
  onActionClick: OnActionClickFn<T>,
  onStatusChange?: (newStatus: any, row: T) => PromiseLike<boolean | undefined>,
): VxeTableGridOptions['columns'] {
  return [
    {
      field: 'id',
      title: $t('system.api.id'),
      width: 90,
      sortable: true,
    },
    {
      field: 'path',
      title: $t('system.api.path'),
      width: 200,
      sortable: true,
    },
    {
      field: 'action',
      title: $t('system.api.action'),
      width: 120,
      sortable: true,
    },
    {
      field: 'pid',
      title: $t('system.api.pid'),
      width: 90,
      sortable: true,
    },
    {
      field: 'type',
      title: $t('common.type'),
      width: 100,
      formatter: ({ cellValue }) => {
        let text: string = 'unknown';
        switch (cellValue) {
          case 0: {
            text = $t('system.api.typeApi');
            break;
          }
          case 1: {
            text = $t('system.api.typeDir');
            break;
          }
        }
        return text;
      },
      sortable: true,
    },
    {
      cellRender: {
        attrs: { beforeChange: onStatusChange },
        name: onStatusChange ? 'CellSwitch' : 'CellTag',
      },
      field: 'status',
      title: $t('system.api.status'),
      width: 100,
      sortable: true,
    },
    {
      field: 'remark',
      minWidth: 150,
      title: $t('system.api.remark'),
    },
    {
      field: 'createdAt',
      title: $t('common.createdAt'),
      width: 160,
      formatter: ({ cellValue }) => formatBackendTime(cellValue), // 时间格式转换
      sortable: true,
    },
    {
      field: 'createdBy',
      title: $t('common.createdBy'),
      width: 100,
    },
    {
      align: 'center',
      cellRender: {
        attrs: {
          nameField: 'name',
          nameTitle: $t('system.api.path'),
          onClick: onActionClick,
        },
        name: 'CellOperation',
      },
      field: 'operation',
      fixed: 'right',
      title: $t('system.api.operation'),
      width: 130,
    },
  ];
}
