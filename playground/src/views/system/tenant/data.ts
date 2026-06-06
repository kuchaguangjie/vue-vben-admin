import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemTenantApi } from '#/api';

import { ref } from 'vue';

import { z } from '#/adapter/form';
import { getTenantAll } from '#/api';
import { $t } from '#/locales';
import { usePreviewLink } from '#/utils/use-preview-link';
import { formatBackendTime } from '#/utils/value-format';

const tenantOptionsRef = ref<Array<{ label: string; value: number }>>([]);
const tenantMapRef = ref<Record<number, string>>({});

async function loadTenantOptions() {
  try {
    const result = await getTenantAll();
    const options = result.map((t) => ({
      label: `${t.name} (${t.code})`,
      value: t.id,
    }));
    options.unshift(
      { label: '平台 (tid=0)', value: 0 },
      { label: '无上级 (不参与分佣)', value: -1 },
    );
    tenantOptionsRef.value = options;
    const tenantMap: Record<number, string> = { 0: '平台', [-1]: '无上级' };
    for (const t of result) {
      tenantMap[t.id] = t.name;
    }
    tenantMapRef.value = tenantMap;
  } catch (error) {
    console.error('Failed to load tenant options', error);
  }
}

loadTenantOptions();

export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'id',
      label: $t('system.tenant.id'),
      disabled: true,
    },
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('system.tenant.name'),
      rules: z
        .string()
        .min(2, {
          message: $t('ui.formRules.minLength', [$t('system.tenant.name'), 2]),
        })
        .max(100, {
          message: $t('ui.formRules.maxLength', [
            $t('system.tenant.name'),
            100,
          ]),
        }),
    },
    {
      component: 'Input',
      fieldName: 'code',
      label: $t('system.tenant.code'),
      rules: z
        .string()
        .min(2, {
          message: $t('ui.formRules.minLength', [$t('system.tenant.code'), 2]),
        })
        .max(50, {
          message: $t('ui.formRules.maxLength', [$t('system.tenant.code'), 50]),
        }),
    },
    {
      component: 'Select',
      fieldName: 'parentId',
      label: $t('system.tenant.parentId'),
      componentProps: {
        allowClear: true,
        options: tenantOptionsRef,
        placeholder: $t('system.tenant.parentIdPlaceholder'),
        style: { width: '100%' },
      },
      defaultValue: -1,
      if: (values) => {
        const id = values.id as number | undefined;
        return id === undefined || id !== 0;
      },
    },
    {
      component: 'InputNumber',
      fieldName: 'commissionRate',
      label: $t('system.tenant.commissionRate'),
      componentProps: {
        min: 0,
        max: 0.15,
        step: 0.01,
        precision: 4,
        placeholder: $t('system.tenant.commissionRatePlaceholder'),
        style: 'width: 100%',
      },
    },
    {
      component: 'Input',
      fieldName: 'version',
      label: '',
      componentProps: {
        style: { display: 'none' },
        disabled: true,
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
      label: $t('system.tenant.status'),
    },
    {
      component: 'Textarea',
      fieldName: 'remark',
      label: $t('system.tenant.remark'),
    },
    {
      component: 'Input',
      fieldName: 'adminUsername',
      label: $t('system.tenant.adminUsername'),
      rules: z
        .string()
        .min(3, { message: $t('system.user.usernameValidation') })
        .max(20, { message: $t('system.user.usernameValidation') })
        .regex(/^[\w\-.]+$/, {
          message: $t('system.user.usernameValidation'),
        }),
    },
    {
      component: 'VbenInput',
      componentProps: {
        placeholder: 'example@example.com',
      },
      fieldName: 'adminEmail',
      label: $t('system.tenant.adminEmail'),
      rules: z
        .string()
        .min(1, { message: $t('authentication.emailTip') })
        .email($t('authentication.emailValidErrorTip')),
    },
    {
      component: 'InputPassword',
      fieldName: 'adminPassword',
      label: $t('system.tenant.adminPassword'),
      rules: z
        .string()
        .min(8, { message: $t('system.user.passwordValidationLength') })
        .max(30, { message: $t('system.user.passwordValidationLength') })
        // eslint-disable-next-line regexp/no-obscure-range
        .regex(/^[!-~]+$/, {
          message: $t('system.user.passwordValidationAsciiOnly'),
        })
        .refine((val) => /[a-z]/i.test(val) && /\d/.test(val), {
          message: $t('system.user.passwordValidationComplexity'),
        }),
    },
    {
      component: 'Input',
      fieldName: 'adminNick',
      label: $t('system.tenant.adminNick'),
      rules: z
        .string()
        .min(2, {
          message: $t('ui.formRules.minLength', [
            $t('system.tenant.adminNick'),
            2,
          ]),
        })
        .max(20, {
          message: $t('ui.formRules.maxLength', [
            $t('system.tenant.adminNick'),
            20,
          ]),
        }),
    },
    {
      component: 'Select',
      fieldName: 'templateCode',
      label: $t('system.tenant.selectTemplate'),
      componentProps: {
        allowClear: true,
        placeholder: $t('system.tenant.selectTemplatePlaceholder'),
        options: [],
      },
    },
  ];
}

export function formFieldsToAdjustForEdit(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'code',
      label: $t('system.tenant.code'),
      componentProps: {
        disabled: true,
      },
    },
  ];
}

export function formFieldsToRemoveForCreate(): string[] {
  return ['id'];
}

export function formFieldsToRemoveForEdit(): string[] {
  return [
    'adminUsername',
    'adminEmail',
    'adminPassword',
    'adminNick',
    'templateCode',
  ];
}

export function formFieldsToRemoveForPreview(): string[] {
  return ['version', 'adminPassword'];
}

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('system.tenant.name'),
      componentProps: {
        placeholder: $t('common.prefix'),
      },
    },
    { component: 'Input', fieldName: 'id', label: $t('system.tenant.id') },
    {
      component: 'Select',
      fieldName: 'parentId',
      label: $t('system.tenant.parentId'),
      componentProps: {
        allowClear: true,
        options: tenantOptionsRef,
        placeholder: '',
      },
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
      label: $t('system.tenant.status'),
    },
    {
      component: 'RangePicker',
      fieldName: 'createdAtRangeMs',
      label: $t('common.createdAt'),
      componentProps: {
        valueFormat: 'x',
        showTime: true,
      },
    },
  ];
}

export function useColumns<T = SystemTenantApi.SystemTenant>(
  onActionClick: OnActionClickFn<T>,
  onPreview: (row: any) => void,
  onStatusChange?: (newStatus: any, row: T) => PromiseLike<boolean | undefined>,
): VxeTableGridOptions['columns'] {
  return [
    usePreviewLink(
      {
        field: 'id',
        title: $t('system.tenant.id'),
        width: 90,
        sortable: true,
      },
      onPreview,
    ),
    {
      field: 'name',
      title: $t('system.tenant.name'),
      width: 200,
      sortable: true,
    },
    {
      field: 'code',
      title: $t('system.tenant.code'),
      width: 200,
      sortable: true,
    },
    {
      field: 'parentId',
      title: $t('system.tenant.parentId'),
      width: 180,
      sortable: true,
      formatter: ({ cellValue }) => {
        const parentId = cellValue as number;
        if (parentId === -1) {
          return $t('system.tenant.noParent');
        }
        if (parentId === 0) {
          return $t('system.tenant.platform');
        }
        const parentName = tenantMapRef.value[parentId];
        if (parentName) {
          return `${parentName} (${parentId})`;
        }
        return String(parentId);
      },
    },
    {
      field: 'commissionRate',
      title: $t('system.tenant.commissionRate'),
      width: 130,
      sortable: true,
      formatter: ({ cellValue }) => {
        const rate = cellValue as null | number | undefined;
        if (rate === undefined || rate === null) {
          return $t('system.tenant.useGlobal');
        }
        return `${(rate * 100).toFixed(2)}%`;
      },
    },
    {
      cellRender: {
        attrs: { beforeChange: onStatusChange },
        name: onStatusChange ? 'CellSwitch' : 'CellTag',
      },
      field: 'status',
      title: $t('system.tenant.status'),
      width: 100,
      sortable: true,
    },
    {
      field: 'remark',
      minWidth: 150,
      title: $t('system.tenant.remark'),
    },
    {
      field: 'createdAt',
      title: $t('common.createdAt'),
      width: 160,
      formatter: ({ cellValue }) => formatBackendTime(cellValue),
      sortable: true,
    },
    {
      align: 'center',
      cellRender: {
        attrs: {
          nameField: 'name',
          nameTitle: $t('system.tenant.name'),
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: ['edit'],
      },
      field: 'operation',
      fixed: 'right',
      title: $t('system.tenant.operation'),
      width: 130,
    },
  ];
}
