import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemRoleApi } from '#/api';

import { z } from '#/adapter/form';
import { $t } from '#/locales';
import { usePreviewLink } from '#/utils/use-preview-link';
import { formatBackendTime } from '#/utils/value-format';

// form - new/edit
export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('system.role.name'),
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'code',
      label: $t('system.role.code'),
    },
    {
      component: 'Input',
      fieldName: 'version',
      label: '', // 空标签使其不显示
      componentProps: {
        style: { display: 'none' }, // 隐藏输入框
        disabled: true, // 使其不可编辑
      },
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
      label: $t('system.role.status'),
    },
    {
      component: 'Textarea',
      fieldName: 'remark',
      label: $t('system.role.remark'),
    },
    {
      fieldName: 'roleCodes',
      component: 'TreeSelect',
      label: $t('system.role.setInheritRoles'),
      componentProps: {
        multiple: true, // 启用多选
      },
    },
    {
      component: 'Input',
      fieldName: 'permissions',
      formItemClass: 'items-start',
      label: $t('system.role.setPermissions'),
      modelPropName: 'modelValue',
    },
    {
      component: 'Input',
      fieldName: 'apis',
      formItemClass: 'items-start',
      label: $t('system.role.setApis'),
      modelPropName: 'modelValue',
    },
  ];
}

// single - edit - set fields
export function useFormSchemaExtraEdit(): VbenFormSchema[] {
  return [];
}

// single - new - add fields
export function useFormSchemaExtraNew(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'code',
      label: $t('system.role.code'),
      defaultValue: 'role_',
      rules: z
        .string()
        .min(1, { message: '代码长度不能少于1个字符' })
        .max(20, { message: '代码长度不能超过20个字符' })
        // 限制 字符集: 字母、数字、下划线
        .regex(/^\w+$/, {
          message: $t('system.role.codeValidation'),
        }),
      componentProps: {
        placeholder: '1 ~ 20 个字符',
        maxlength: 20,
        showCount: true,
      },
    },
  ];
}

// single - edit - remove fields
export function useFormSchemaRemoveEdit(): string[] {
  return ['code'];
}

// single - new - remove fields
export function useFormSchemaRemoveNew(): string[] {
  return [];
}

// single - preview - remove fields
export function useFormSchemaRemovePreview(): string[] {
  return [];
}

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('system.role.name'),
      componentProps: {
        placeholder: $t('common.prefix'),
      },
    },
    { component: 'Input', fieldName: 'id', label: $t('system.role.id') },
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
      label: $t('system.role.status'),
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

export function useColumns<T = SystemRoleApi.SystemRole>(
  onActionClick: OnActionClickFn<T>,
  onPreview: (row: any) => void,
  onStatusChange?: (newStatus: any, row: T) => PromiseLike<boolean | undefined>,
): VxeTableGridOptions['columns'] {
  return [
    usePreviewLink(
      {
        field: 'id',
        title: $t('system.role.id'),
        width: 90,
        sortable: true,
      },
      onPreview,
    ),
    {
      field: 'id',
      title: $t('system.role.id'),
      width: 90,
      sortable: true,
    },
    {
      field: 'name',
      title: $t('system.role.name'),
      width: 200,
      sortable: true,
    },
    {
      field: 'code',
      title: $t('system.role.code'),
      width: 200,
      sortable: true,
    },
    {
      cellRender: {
        attrs: { beforeChange: onStatusChange },
        name: onStatusChange ? 'CellSwitch' : 'CellTag',
      },
      field: 'status',
      title: $t('system.role.status'),
      width: 100,
      sortable: true,
    },
    {
      field: 'remark',
      minWidth: 150,
      title: $t('system.role.remark'),
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
          nameTitle: $t('system.role.name'),
          onClick: onActionClick,
        },
        name: 'CellOperation',
      },
      field: 'operation',
      fixed: 'right',
      title: $t('system.role.operation'),
      width: 130,
    },
  ];
}
