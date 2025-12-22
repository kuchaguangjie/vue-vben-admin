import type { VbenFormSchema } from '#/adapter/form';
import { z } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemUserApi } from '#/api';
import { $t } from '#/locales';
import { formatBackendTime } from '#/utils/valueFormat';

// single - common fields
export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'username',
    },
    {
      component: 'Input',
      fieldName: 'email',
    },
    {
      component: 'InputPassword',
      fieldName: 'password',
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
      component: 'Input',
      fieldName: 'nick',
      label: $t('system.user.nick'),
      rules: 'required',
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
      label: $t('system.user.status'),
    },
    {
      component: 'CheckboxGroup',
      fieldName: 'roleCodes',
      label: $t('system.user.setRoles'),
      defaultValue: [],
      componentProps: {},
    },
  ];
}

// single - edit - set fields
export function useFormSchemaExtraEdit(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'username',
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
      component: 'Input',
      fieldName: 'username',
      label: $t('system.user.username'),
      rules: z
        .string()
        .min(3, { message: $t('system.user.usernameValidation') })
        .max(20, { message: $t('system.user.usernameValidation') })
        .refine((val) => !val.startsWith('role_'), {
          message: $t('system.user.usernameValidation'),
        }),
    },
    {
      component: 'VbenInput',
      componentProps: {
        placeholder: 'example@example.com',
      },
      fieldName: 'email',
      label: $t('system.user.email'),
      rules: z
        .string()
        .min(1, { message: $t('authentication.emailTip') })
        .email($t('authentication.emailValidErrorTip')),
    },
    {
      component: 'InputPassword',
      fieldName: 'password',
      label: $t('system.user.password'),
      rules: z
        .string()
        .regex(/^\w{6,30}$/, $t('system.user.passwordValidation')),
    },
  ];
}

// single - edit - remove fields
export function useFormSchemaRemoveEdit(): string[] {
  return ['email', 'password'];
}

// single - new - remove fields
export function useFormSchemaRemoveNew(): string[] {
  return [];
}

// for search list
export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'username',
      label: $t('system.user.username'),
    },
    { component: 'Input', fieldName: 'id', label: $t('system.user.id') },
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
      label: $t('system.user.status'),
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

export function useColumns<T = SystemUserApi.SystemUser>(
  onActionClick: OnActionClickFn<T>,
  onStatusChange?: (newStatus: any, row: T) => PromiseLike<boolean | undefined>,
): VxeTableGridOptions['columns'] {
  return [
    {
      field: 'id',
      title: $t('system.user.id'),
      width: 90,
      sortable: true,
    },
    {
      field: 'username',
      title: $t('system.user.username'),
      width: 150,
      sortable: true,
    },
    {
      field: 'nick',
      title: $t('system.user.nick'),
      width: 150,
    },
    {
      cellRender: {
        attrs: { beforeChange: onStatusChange },
        name: onStatusChange ? 'CellSwitch' : 'CellTag',
      },
      field: 'status',
      title: $t('system.user.status'),
      width: 100,
      sortable: true,
    },
    {
      field: 'email',
      width: 200,
      title: $t('system.user.email'),
      sortable: true,
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
          nameTitle: $t('system.user.name'),
          onClick: onActionClick,
        },
        name: 'CellOperation',
      },
      field: 'operation',
      fixed: 'right',
      title: $t('system.user.operation'),
      width: 130,
    },
  ];
}
