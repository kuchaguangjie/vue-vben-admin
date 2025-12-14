import type { VbenFormSchema } from '#/adapter/form';
import { z } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemRoleApi } from '#/api';
import { $t } from '#/locales';
import { formatBackendTime } from '#/utils/valueFormat';

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
      defaultValue: 'role_',
      rules: z
        .string()
        .min(6, { message: '代码长度不能少于6个字符' })
        .max(25, { message: '代码长度不能超过25个字符' })
        .regex(/^role/, { message: '代码必须以 role_ 开头' }),
      componentProps: {
        placeholder: 'role_xxx',
        maxlength: 25,
        showCount: true,
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
      component: 'Input',
      fieldName: 'permissions',
      formItemClass: 'items-start',
      label: $t('system.role.setPermissions'),
      modelPropName: 'modelValue',
    },
    {
      component: 'CheckboxGroup',
      fieldName: 'roleCodes',
      label: $t('system.role.setInheritRoles'),
      defaultValue: [],
      componentProps: {},
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
      rules: 'required',
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

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('system.role.name'),
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
      component: 'Input',
      fieldName: 'remark',
      label: $t('system.role.remark'),
    },
    {
      component: 'RangePicker',
      fieldName: 'createTime',
      label: $t('system.role.createTime'),
    },
  ];
}

export function useColumns<T = SystemRoleApi.SystemRole>(
  onActionClick: OnActionClickFn<T>,
  onStatusChange?: (newStatus: any, row: T) => PromiseLike<boolean | undefined>,
): VxeTableGridOptions['columns'] {
  return [
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
