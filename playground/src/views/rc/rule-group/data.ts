import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { RcRuleGroupApi } from '#/api';

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
      label: $t('rc.ruleGroup.name'),
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'code',
      label: $t('rc.ruleGroup.code'),
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'scenario',
      label: $t('rc.ruleGroup.scenario'),
      rules: 'required',
    },
    {
      component: 'Textarea',
      fieldName: 'description',
      label: $t('rc.ruleGroup.description'),
      componentProps: {
        rows: 3,
      },
    },
    {
      component: 'InputNumber',
      fieldName: 'priority',
      label: $t('rc.ruleGroup.priority'),
      componentProps: {
        min: 0,
      },
    },
    {
      component: 'RadioGroup',
      fieldName: 'status',
      label: $t('rc.ruleGroup.status'),
      componentProps: {
        options: [
          { label: $t('common.enabled'), value: 1 },
          { label: $t('common.disabled'), value: 0 },
        ],
      },
    },
  );

  return schema;
}

export function formFieldsToAdjustForEdit(): VbenFormSchema[] {
  return [];
}

export function formFieldsToRemoveForCreate(): string[] {
  return ['id', 'tenantId'];
}

export function formFieldsToRemoveForPreview(): string[] {
  return [];
}

export function useGridFormSchema(): VbenFormSchema[] {
  const schema: VbenFormSchema[] = [
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('rc.ruleGroup.name'),
      componentProps: {
        placeholder: $t('common.prefix'),
        allowClear: true,
      },
    },
    {
      component: 'Input',
      fieldName: 'code',
      label: $t('rc.ruleGroup.code'),
      componentProps: {
        allowClear: true,
      },
    },
    {
      component: 'Input',
      fieldName: 'scenario',
      label: $t('rc.ruleGroup.scenario'),
      componentProps: {
        allowClear: true,
      },
    },
    {
      component: 'Select',
      fieldName: 'status',
      label: $t('rc.ruleGroup.status'),
      componentProps: {
        allowClear: true,
        options: [
          { label: $t('common.enabled'), value: 1 },
          { label: $t('common.disabled'), value: 0 },
        ],
      },
    },
  ];

  return schema;
}

export function useColumns<T = RcRuleGroupApi.RcRuleGroup>(
  onActionClick: OnActionClickFn<T>,
): VxeTableGridOptions['columns'] {
  const { saasEnabled } = useSaasEnabled();

  const columns: VxeTableGridOptions['columns'] = [
    {
      field: 'id',
      title: $t('common.id'),
      width: 90,
      sortable: true,
      sortType: 'auto',
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
      title: $t('rc.ruleGroup.name'),
      width: 200,
      sortable: true,
    },
    {
      field: 'code',
      title: $t('rc.ruleGroup.code'),
      width: 150,
      sortable: true,
    },
    {
      field: 'scenario',
      title: $t('rc.ruleGroup.scenario'),
      width: 150,
      sortable: true,
    },
    {
      field: 'description',
      title: $t('rc.ruleGroup.description'),
      minWidth: 200,
    },
    {
      field: 'priority',
      title: $t('rc.ruleGroup.priority'),
      width: 100,
      sortable: true,
    },
    {
      field: 'status',
      title: $t('rc.ruleGroup.status'),
      width: 100,
      sortable: true,
      slots: { default: 'status' },
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
          nameTitle: $t('rc.ruleGroup.moduleShort'),
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
