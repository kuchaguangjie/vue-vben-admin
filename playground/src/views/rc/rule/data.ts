import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { RcRuleApi } from '#/api';

import { ref, watch } from 'vue';

import { getRcRuleGroupList } from '#/api';
import { useSaasEnabled } from '#/hooks/common/use-saas-enabled';
import { $t } from '#/locales';

export function useFormSchema(): VbenFormSchema[] {
  const { saasEnabled } = useSaasEnabled();
  const ruleGroupOptions = ref<{ label: string; value: number }[]>([]);

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
      component: 'Select',
      fieldName: 'groupId',
      label: $t('rc.rule.groupName'),
      rules: 'required',
      componentProps: {
        options: ruleGroupOptions,
        showSearch: true,
        filterOption: (input: string, option: { label: string }) => {
          return option.label.toLowerCase().includes(input.toLowerCase());
        },
      },
    },
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('rc.rule.name'),
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'code',
      label: $t('rc.rule.code'),
      rules: 'required',
    },
    {
      component: 'Textarea',
      fieldName: 'description',
      label: $t('rc.rule.description'),
      componentProps: {
        rows: 2,
      },
    },
    {
      component: 'InputNumber',
      fieldName: 'priority',
      label: $t('rc.rule.priority'),
      componentProps: {
        min: 0,
      },
    },
    {
      component: 'Textarea',
      fieldName: 'conditions',
      label: $t('rc.rule.conditions'),
      rules: 'required',
      componentProps: {
        rows: 6,
      },
    },
    {
      component: 'RadioGroup',
      fieldName: 'action',
      label: $t('rc.rule.action'),
      rules: 'required',
      componentProps: {
        options: [
          { label: $t('rc.rule.actionPass'), value: 'pass' },
          { label: $t('rc.rule.actionReject'), value: 'reject' },
        ],
      },
    },
    {
      component: 'RadioGroup',
      fieldName: 'riskLevel',
      label: $t('rc.rule.riskLevel'),
      rules: 'required',
      componentProps: {
        options: [
          { label: $t('rc.rule.riskLevelLow'), value: 'low' },
          { label: $t('rc.rule.riskLevelMedium'), value: 'medium' },
          { label: $t('rc.rule.riskLevelHigh'), value: 'high' },
          { label: $t('rc.rule.riskLevelCritical'), value: 'critical' },
        ],
      },
    },
    {
      component: 'Input',
      fieldName: 'errorCode',
      label: $t('rc.rule.errorCode'),
    },
    {
      component: 'Textarea',
      fieldName: 'errorMsg',
      label: $t('rc.rule.errorMsg'),
      componentProps: {
        rows: 2,
      },
    },
    {
      component: 'RadioGroup',
      fieldName: 'status',
      label: $t('rc.rule.status'),
      componentProps: {
        options: [
          { label: $t('common.enabled'), value: 1 },
          { label: $t('common.disabled'), value: 0 },
        ],
      },
    },
  );

  watch(
    () => ruleGroupOptions.value,
    () => {},
    { immediate: true },
  );

  (async () => {
    try {
      const groups = await getRcRuleGroupList({ status: 1 });
      ruleGroupOptions.value = groups.map((group) => ({
        label: group.name,
        value: group.id,
      }));
    } catch {
      console.error('Failed to load rule groups');
    }
  })();

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
  const ruleGroupOptions = ref<{ label: string; value: number }[]>([]);

  const schema: VbenFormSchema[] = [
    {
      component: 'Select',
      fieldName: 'groupId',
      label: $t('rc.rule.groupName'),
      componentProps: {
        allowClear: true,
        options: ruleGroupOptions,
        showSearch: true,
      },
    },
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('rc.rule.name'),
      componentProps: {
        placeholder: $t('common.prefix'),
        allowClear: true,
      },
    },
    {
      component: 'Input',
      fieldName: 'code',
      label: $t('rc.rule.code'),
      componentProps: {
        allowClear: true,
      },
    },
    {
      component: 'Select',
      fieldName: 'action',
      label: $t('rc.rule.action'),
      componentProps: {
        allowClear: true,
        options: [
          { label: $t('rc.rule.actionPass'), value: 'pass' },
          { label: $t('rc.rule.actionReject'), value: 'reject' },
        ],
      },
    },
    {
      component: 'Select',
      fieldName: 'riskLevel',
      label: $t('rc.rule.riskLevel'),
      componentProps: {
        allowClear: true,
        options: [
          { label: $t('rc.rule.riskLevelLow'), value: 'low' },
          { label: $t('rc.rule.riskLevelMedium'), value: 'medium' },
          { label: $t('rc.rule.riskLevelHigh'), value: 'high' },
          { label: $t('rc.rule.riskLevelCritical'), value: 'critical' },
        ],
      },
    },
    {
      component: 'Select',
      fieldName: 'status',
      label: $t('rc.rule.status'),
      componentProps: {
        allowClear: true,
        options: [
          { label: $t('common.enabled'), value: 1 },
          { label: $t('common.disabled'), value: 0 },
        ],
      },
    },
  ];

  (async () => {
    try {
      const groups = await getRcRuleGroupList();
      ruleGroupOptions.value = groups.map((group) => ({
        label: group.name,
        value: group.id,
      }));
    } catch {
      console.error('Failed to load rule groups');
    }
  })();

  return schema;
}

export function useColumns<T = RcRuleApi.RcRule>(
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
      field: 'groupId',
      title: $t('rc.rule.groupName'),
      width: 150,
      sortable: true,
    },
    {
      field: 'name',
      title: $t('rc.rule.name'),
      width: 200,
      sortable: true,
    },
    {
      field: 'code',
      title: $t('rc.rule.code'),
      width: 150,
      sortable: true,
    },
    {
      field: 'action',
      title: $t('rc.rule.action'),
      width: 100,
      sortable: true,
      slots: { default: 'action' },
    },
    {
      field: 'riskLevel',
      title: $t('rc.rule.riskLevel'),
      width: 120,
      sortable: true,
      slots: { default: 'riskLevel' },
    },
    {
      field: 'priority',
      title: $t('rc.rule.priority'),
      width: 100,
      sortable: true,
    },
    {
      field: 'status',
      title: $t('rc.rule.status'),
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
          nameTitle: $t('rc.rule.moduleShort'),
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
