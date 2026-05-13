import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemAiProviderApi } from '#/api/ai';

import { useSaasEnabled } from '#/hooks/common/use-saas-enabled';
import { $t } from '#/locales';

export function useFormSchema(): VbenFormSchema[] {
  const { saasEnabled } = useSaasEnabled();

  const schema: VbenFormSchema[] = [
    {
      component: 'Input',
      fieldName: 'id',
      label: $t('common.id'),
      disabled: true,
    },
  ];

  if (saasEnabled.value) {
    schema.push({
      component: 'Input',
      fieldName: 'tenantId',
      label: $t('system.tenant.id'),
      disabled: true,
    });
  }

  schema.push(
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('ai.provider.name'),
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'code',
      label: $t('ai.provider.code'),
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'baseUrl',
      label: $t('ai.provider.baseUrl'),
    },
    {
      component: 'InputPassword',
      fieldName: 'apiKey',
      label: $t('ai.provider.apiKey'),
    },
    {
      component: 'InputNumber',
      fieldName: 'timeout',
      label: $t('ai.provider.timeout'),
      componentProps: {
        min: 1,
        max: 3600,
      },
      defaultValue: 30,
    },
    {
      component: 'Select',
      fieldName: 'status',
      label: $t('ai.provider.status'),
      componentProps: {
        options: [
          { label: '启用', value: 1 },
          { label: '禁用', value: 0 },
        ],
      },
      defaultValue: 1,
    },
  );

  return schema;
}

export function formFieldsToRemoveForCreate(): string[] {
  return ['id', 'tenantId'];
}

export function useGridFormSchema(): VbenFormSchema[] {
  const schema: VbenFormSchema[] = [
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('ai.provider.name'),
      componentProps: {
        placeholder: $t('common.prefix'),
        allowClear: true,
      },
    },
    {
      component: 'Input',
      fieldName: 'code',
      label: $t('ai.provider.code'),
      componentProps: {
        allowClear: true,
      },
    },
  ];

  return schema;
}

export function useColumns<T = SystemAiProviderApi.AiProvider>(
  onActionClick: OnActionClickFn<T>,
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
      field: 'name',
      title: $t('ai.provider.name'),
      width: 150,
      sortable: true,
    },
    {
      field: 'code',
      title: $t('ai.provider.code'),
      width: 120,
      sortable: true,
    },
    {
      field: 'baseUrl',
      title: $t('ai.provider.baseUrl'),
      width: 250,
    },
    {
      field: 'apiKey',
      title: $t('ai.provider.apiKey'),
      width: 200,
      formatter: ({ cellValue }) => {
        return cellValue ? '***' : '';
      },
    },
    {
      field: 'timeout',
      title: $t('ai.provider.timeout'),
      width: 120,
      sortable: true,
    },
    {
      field: 'status',
      title: $t('ai.provider.status'),
      width: 100,
      sortable: true,
      cellRender: {
        name: 'CellStatus',
      },
    },
    {
      field: 'createdAt',
      title: $t('common.createdAt'),
      width: 160,
      sortable: true,
    },
    {
      align: 'center',
      cellRender: {
        attrs: {
          nameField: 'name',
          nameTitle: $t('ai.provider.module'),
          onClick: onActionClick,
        },
        name: 'CellOperation',
      },
      field: 'operation',
      fixed: 'right',
      title: $t('common.operation'),
      width: 130,
    },
  );

  return columns;
}
