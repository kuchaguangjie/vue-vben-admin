import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemAiProviderApi } from '#/api/system/ai_provider';

import { useSaasEnabled } from '#/hooks/common/use-saas-enabled';
import { $t } from '#/locales';

const CAPABILITY_OPTIONS = [
  { label: 'LLM (大语言模型)', value: 'LLM' },
  { label: 'Embedding (向量嵌入)', value: 'Embedding' },
  { label: 'Audio (音频处理)', value: 'Audio' },
  { label: 'Vision (视觉处理)', value: 'Vision' },
];

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
      label: $t('ai.model.name'),
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'code',
      label: $t('ai.model.code'),
      rules: 'required',
    },
    {
      component: 'Textarea',
      fieldName: 'description',
      label: $t('ai.model.description'),
      componentProps: {
        rows: 3,
      },
    },
    {
      component: 'InputNumber',
      fieldName: 'contextWindow',
      label: $t('ai.model.contextWindow'),
      componentProps: {
        min: 0,
      },
      defaultValue: 4096,
    },
    {
      component: 'InputNumber',
      fieldName: 'maxOutput',
      label: $t('ai.model.maxOutput'),
      componentProps: {
        min: 0,
      },
    },
    {
      component: 'Select',
      fieldName: 'capabilities',
      label: $t('ai.model.capabilities'),
      componentProps: {
        multiple: true,
        options: CAPABILITY_OPTIONS,
      },
    },
    {
      component: 'InputNumber',
      fieldName: 'inputPrice',
      label: $t('ai.model.inputPrice'),
      componentProps: {
        min: 0,
        step: 0.0001,
        precision: 4,
      },
      defaultValue: 0,
    },
    {
      component: 'InputNumber',
      fieldName: 'outputPrice',
      label: $t('ai.model.outputPrice'),
      componentProps: {
        min: 0,
        step: 0.0001,
        precision: 4,
      },
      defaultValue: 0,
    },
    {
      component: 'Switch',
      fieldName: 'isCustom',
      label: $t('ai.model.isCustom'),
    },
    {
      component: 'Select',
      fieldName: 'status',
      label: $t('ai.model.status'),
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
      label: $t('ai.model.name'),
      componentProps: {
        placeholder: $t('common.prefix'),
        allowClear: true,
      },
    },
    {
      component: 'Input',
      fieldName: 'code',
      label: $t('ai.model.code'),
      componentProps: {
        allowClear: true,
      },
    },
    {
      component: 'Select',
      fieldName: 'capability',
      label: $t('ai.model.capability'),
      componentProps: {
        allowClear: true,
        options: CAPABILITY_OPTIONS,
      },
    },
    {
      component: 'Select',
      fieldName: 'status',
      label: $t('ai.model.status'),
      componentProps: {
        allowClear: true,
        options: [
          { label: '启用', value: 1 },
          { label: '禁用', value: 0 },
        ],
      },
    },
  ];

  return schema;
}

export function useColumns<T = SystemAiProviderApi.AiModel>(
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
      title: $t('ai.model.name'),
      width: 150,
      sortable: true,
    },
    {
      field: 'code',
      title: $t('ai.model.code'),
      width: 150,
      sortable: true,
    },
    {
      field: 'description',
      title: $t('ai.model.description'),
      width: 200,
    },
    {
      field: 'contextWindow',
      title: $t('ai.model.contextWindow'),
      width: 120,
      sortable: true,
    },
    {
      field: 'maxOutput',
      title: $t('ai.model.maxOutput'),
      width: 120,
      sortable: true,
    },
    {
      field: 'capabilities',
      title: $t('ai.model.capabilities'),
      width: 180,
      formatter: ({ cellValue }) => {
        return Array.isArray(cellValue) ? cellValue.join(', ') : '';
      },
    },
    {
      field: 'inputPrice',
      title: $t('ai.model.inputPrice'),
      width: 120,
      sortable: true,
      formatter: ({ cellValue }) => {
        return cellValue === undefined ? '' : `$${cellValue}`;
      },
    },
    {
      field: 'outputPrice',
      title: $t('ai.model.outputPrice'),
      width: 120,
      sortable: true,
      formatter: ({ cellValue }) => {
        return cellValue === undefined ? '' : `$${cellValue}`;
      },
    },
    {
      field: 'isCustom',
      title: $t('ai.model.isCustom'),
      width: 100,
      sortable: true,
      cellRender: {
        name: 'CellTag',
        options: [
          { label: '是', value: true, type: 'primary' },
          { label: '否', value: false, type: 'default' },
        ],
      },
    },
    {
      field: 'status',
      title: $t('ai.model.status'),
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
          nameTitle: $t('ai.model.module'),
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
