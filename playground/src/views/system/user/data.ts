import type { Ref } from 'vue';

import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemUserApi } from '#/api';

import { z } from '#/adapter/form';
import { useSaasEnabled } from '#/hooks/common/use-saas-enabled';
import { $t } from '#/locales';
import { usePreviewLink } from '#/utils/use-preview-link';
import { useUserCoreColumn } from '#/utils/user-core';
import { formatBackendTime } from '#/utils/value-format';

// single - common fields
export function useFormSchema(): VbenFormSchema[] {
  const { saasEnabled } = useSaasEnabled();

  const schema: VbenFormSchema[] = [
    {
      component: 'Input',
      fieldName: 'id',
      label: $t('system.user.id'),
      disabled: true, // 不可编辑
    },
  ];

  if (saasEnabled.value) {
    schema.push({
      component: 'Input',
      fieldName: 'tenantId',
      label: $t('system.tenant.id'),
      disabled: true, // 不可编辑
    });
  }

  schema.push(
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
    {
      component: 'Input',
      fieldName: 'version',
      label: '', // 空标签使其不显示
      componentProps: {
        style: { display: 'none' }, // 隐藏输入框
        disabled: true, // 不可编辑
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
      fieldName: 'remark',
      component: 'Textarea',
      label: $t('system.user.remark'),
    },
    {
      fieldName: 'deptIds',
      component: 'TreeSelect',
      label: $t('system.user.dept'),
      componentProps: {
        multiple: true, // 启用多选
      },
    },
    {
      fieldName: 'roleCodes',
      component: 'TreeSelect',
      label: $t('system.user.setRoles'),
      componentProps: {
        multiple: true, // 启用多选
      },
    },
  );

  return schema;
}

// form fields - to adjust - when edit
export function formFieldsToAdjustForEdit(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'username',
      label: $t('system.user.username'),
      componentProps: {
        disabled: true, // 不可编辑
      },
    },
    {
      component: 'Input',
      fieldName: 'email',
      label: $t('system.user.email'),
      componentProps: {
        disabled: true, // 不可编辑
      },
    },
  ];
}

// form fields - to remove - when edit
export function formFieldsToRemoveForEdit(): string[] {
  return ['password'];
}

// form fields - to remove - when create
export function formFieldsToRemoveForCreate(): string[] {
  return ['id', 'tenantId'];
}

// form fields - to remove - when preview
export function formFieldsToRemoveForPreview(): string[] {
  return ['password'];
}

// for search list
export function useGridFormSchema(isPlatformAdmin = false): VbenFormSchema[] {
  const { saasEnabled } = useSaasEnabled();

  const schema: VbenFormSchema[] = [
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

  if (saasEnabled.value && isPlatformAdmin) {
    schema.unshift({
      component: 'Input',
      fieldName: 'tenantId',
      label: $t('system.tenant.id'),
      componentProps: {
        type: 'number',
        allowClear: true,
        placeholder: $t('common.currentTenant'),
      },
    });
  }

  return schema;
}

export function useColumns<T = SystemUserApi.SystemUser>(
  onActionClick: OnActionClickFn<T>,
  onPreview: (row: any) => void,
  userCoreMap: Ref<Record<number, SystemUserApi.UserCore>>,
  onStatusChange?: (newStatus: any, row: T) => PromiseLike<boolean | undefined>,
): VxeTableGridOptions['columns'] {
  const { saasEnabled } = useSaasEnabled();

  const columns: VxeTableGridOptions['columns'] = [
    usePreviewLink(
      {
        field: 'id',
        title: $t('system.user.id'),
        width: 90,
        sortable: true,
      },
      onPreview,
    ),
  ];

  if (saasEnabled.value) {
    columns.push({
      field: 'tenantId',
      title: $t('system.tenant.id'),
      width: 90,
      sortable: true,
    });
  }

  columns.push(
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
      formatter: ({ cellValue }) => formatBackendTime(cellValue),
      sortable: true,
    },
    useUserCoreColumn(
      {
        field: 'createdBy',
        title: $t('common.createdBy'),
        width: 120,
      },
      userCoreMap,
    ),
    {
      field: 'operation',
      align: 'center',
      cellRender: {
        attrs: {
          nameField: 'name',
          nameTitle: $t('system.user.module'),
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: ['edit'],
      },
      fixed: 'right',
      title: $t('system.user.operation'),
      width: 75,
    },
  );

  return columns;
}
