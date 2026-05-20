import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemApiKeyApi } from '#/api';

import { useSaasEnabled } from '#/hooks/common/use-saas-enabled';
import { $t } from '#/locales';
import { formatBackendTime } from '#/utils/value-format';

export function useFormSchema(): VbenFormSchema[] {
  const schema: VbenFormSchema[] = [
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('system.apiKey.name'),
      rules: 'required',
    },
    {
      component: 'Select',
      fieldName: 'userId',
      label: $t('system.apiKey.botUser'),
      rules: 'required',
      componentProps: {
        placeholder: $t('common.messages.pleaseSelect'),
        allowClear: true,
      },
    },
    {
      component: 'Select',
      fieldName: 'expiryType',
      label: $t('system.apiKey.expiryType'),
      rules: 'required',
      defaultValue: '1d',
      componentProps: {
        style: { width: '100%' },
        options: [
          { label: $t('system.apiKey.expiry1Hour'), value: '1h' },
          { label: $t('system.apiKey.expiry1Day'), value: '1d' },
          { label: $t('system.apiKey.expiry1Week'), value: '1w' },
          { label: $t('system.apiKey.expiry1Year'), value: '1y' },
          { label: $t('system.apiKey.expiryNever'), value: '99y' },
          { label: $t('system.apiKey.expiryCustom'), value: 'custom' },
        ],
      },
    },
    {
      component: 'DatePicker',
      fieldName: 'expiresAt',
      label: $t('system.apiKey.expiresAt'),
      dependencies: {
        triggerFields: ['expiryType'],
        if: (values) => values.expiryType === 'custom',
      },
      componentProps: {
        showTime: true,
        format: 'YYYY-MM-DD HH:mm:ss',
        placeholder: $t('common.prefix'),
      },
    },
  ];

  return schema;
}

export function formFieldsToRemoveForCreate(): string[] {
  return [];
}

export function useGridFormSchema(): VbenFormSchema[] {
  const schema: VbenFormSchema[] = [
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('system.apiKey.name'),
      componentProps: {
        placeholder: $t('common.prefix'),
        allowClear: true,
      },
    },
    {
      component: 'Select',
      fieldName: 'userId',
      label: $t('system.apiKey.botUser'),
      componentProps: {
        placeholder: $t('common.messages.pleaseSelect'),
        allowClear: true,
        options: [],
      },
    },
    {
      component: 'Select',
      fieldName: 'status',
      label: $t('common.status'),
      componentProps: {
        allowClear: true,
        options: [
          { label: $t('common.disabled'), value: 0 },
          { label: $t('common.enabled'), value: 1 },
        ],
      },
    },
  ];

  return schema;
}

export function useColumns<T = SystemApiKeyApi.ApiKey>(
  onActionClick: OnActionClickFn<T>,
  onStatusChange?: (
    newStatus: number,
    row: T,
  ) => PromiseLike<boolean | undefined>,
): VxeTableGridOptions['columns'] {
  const { saasEnabled } = useSaasEnabled();

  const columns: VxeTableGridOptions['columns'] = [
    {
      field: 'id',
      title: $t('common.id'),
      width: 90,
      sortable: true,
    },
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
      field: 'userId',
      title: $t('system.apiKey.botUserId'),
      width: 120,
      sortable: true,
    },
    {
      field: 'username',
      title: $t('system.apiKey.botUsername'),
      width: 150,
      sortable: true,
    },
    {
      field: 'name',
      title: $t('system.apiKey.name'),
      width: 180,
      sortable: true,
    },
    {
      cellRender: {
        attrs: { beforeChange: onStatusChange },
        name: onStatusChange ? 'CellSwitch' : 'CellTag',
      },
      field: 'status',
      title: $t('common.status'),
      width: 100,
      sortable: true,
    },
    {
      field: 'expiresAt',
      title: $t('system.apiKey.expiresAt'),
      width: 180,
      sortable: true,
      formatter: ({ cellValue }) => formatBackendTime(cellValue),
    },
    {
      field: 'lastUsedAt',
      title: $t('system.apiKey.lastUsedAt'),
      width: 180,
      sortable: true,
      formatter: ({ cellValue }) => formatBackendTime(cellValue),
    },
    {
      field: 'createdAt',
      title: $t('common.createdAt'),
      width: 180,
      sortable: true,
      formatter: ({ cellValue }) => formatBackendTime(cellValue),
    },
    {
      align: 'center',
      cellRender: {
        attrs: {
          nameField: 'name',
          nameTitle: $t('system.apiKey.module'),
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: ['delete'],
      },
      field: 'operation',
      fixed: 'right',
      title: $t('common.operation'),
      width: 130,
    },
  );

  return columns;
}
