import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemUserApi } from '#/api';

import { z } from '#/adapter/form';
import { $t } from '#/locales';
import { usePreviewLink } from '#/utils/use-preview-link';
import { formatBackendTime } from '#/utils/value-format';

// single - common fields
export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'username',
      label: $t('system.user.username'),
    },
    {
      component: 'Input',
      fieldName: 'email',
      label: $t('system.user.email'),
    },
    {
      component: 'InputPassword',
      fieldName: 'password',
      label: $t('system.user.password'),
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
      fieldName: 'deptIds',
      component: 'TreeSelect',
      label: $t('system.user.dept'),
      componentProps: {
        // treeData: deptRoots,
        fieldNames: {
          label: 'name', // 对应 labelField
          value: 'id', // 对应 valueField
          children: 'children', // 对应 childrenField
          key: 'id', // 可选，节点的唯一标识
        },
        allowClear: true,
        class: 'w-full',
        multiple: true, // 启用多选
        treeCheckable: true,
        showCheckedStrategy: 'SHOW_CHILD',
        treeCheckStrictly: true, // 上/下 不关联, 可独立选择
        treeDefaultExpandAll: true, // 默认展开所有
      },
    },
    {
      fieldName: 'roleCodes',
      component: 'TreeSelect',
      label: $t('system.user.setRoles'),
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
        // 限制 字符集: 字母、数字、下划线、中划线、点
        .regex(/^[\w\-.]+$/, {
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
        .min(8, { message: $t('system.user.passwordValidationLength') })
        .max(30, { message: $t('system.user.passwordValidationLength') })
        // [!-~] 涵盖了 ASCII 表中从 '!' 到 '~' 的所有可见字符, 排除了 空格 / 控制字符 / 中日韩等 Unicode 字符;
        // eslint-disable-next-line regexp/no-obscure-range
        .regex(/^[!-~]+$/, {
          message: $t('system.user.passwordValidationAsciiOnly'),
        })
        // 复杂度要求: 同时 包含 字母 & 数字;
        .refine((val) => /[a-z]/i.test(val) && /\d/.test(val), {
          message: $t('system.user.passwordValidationComplexity'),
        }),
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

// single - preview - remove fields
export function useFormSchemaRemovePreview(): string[] {
  return ['password'];
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
  onPreview: (row: any) => void,
  onStatusChange?: (newStatus: any, row: T) => PromiseLike<boolean | undefined>,
): VxeTableGridOptions['columns'] {
  return [
    usePreviewLink(
      {
        field: 'id',
        title: $t('system.user.id'),
        width: 90,
        sortable: true,
      },
      onPreview,
    ),
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
      field: 'operation',
      align: 'center',
      cellRender: {
        attrs: {
          nameField: 'name',
          nameTitle: $t('system.user.name'),
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [
          'edit', // 默认的编辑按钮
          // 不可删除 用户
          /*
          {
            code: 'delete', // 默认的删除按钮, 有 children 不可删除;
            disabled: (row: SystemApiApi.SystemApi) => {
              return !!(row.children && row.children.length > 0);
            },
          },
          */
        ],
      },
      fixed: 'right',
      title: $t('system.user.operation'),
      width: 75,
    },
  ];
}
