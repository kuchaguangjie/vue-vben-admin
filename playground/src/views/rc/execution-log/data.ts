import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { RcExecutionLogApi } from '#/api';

import { ref } from 'vue';

import { getRcRuleGroupList, getRcRuleList } from '#/api';
import { useSaasEnabled } from '#/hooks/common/use-saas-enabled';
import { $t } from '#/locales';

export function useGridFormSchema(): VbenFormSchema[] {
  const ruleGroupOptions = ref<{ label: string; value: number }[]>([]);
  const ruleOptions = ref<{ label: string; value: number }[]>([]);

  const schema: VbenFormSchema[] = [
    {
      component: 'Select',
      fieldName: 'groupId',
      label: $t('rc.rule.groupName'),
      componentProps: {
        allowClear: true,
        options: ruleGroupOptions,
        showSearch: true,
        onChange: async (value: number | undefined) => {
          if (value) {
            const rules = await getRcRuleList({ groupId: value, status: 1 });
            ruleOptions.value = rules.map((rule) => ({
              label: rule.name,
              value: rule.id,
            }));
          } else {
            ruleOptions.value = [];
          }
        },
      },
    },
    {
      component: 'Select',
      fieldName: 'ruleId',
      label: $t('rc.rule.name'),
      componentProps: {
        allowClear: true,
        options: ruleOptions,
        showSearch: true,
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
      component: 'Input',
      fieldName: 'userId',
      label: $t('system.user.id'),
      componentProps: {
        allowClear: true,
      },
    },
    {
      component: 'Select',
      fieldName: 'result',
      label: $t('rc.executionLog.result'),
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
      component: 'DatePicker',
      fieldName: 'startDate',
      label: $t('common.startDate'),
      componentProps: {
        allowClear: true,
        format: 'YYYY-MM-DD',
        valueFormat: 'YYYY-MM-DD',
      },
    },
    {
      component: 'DatePicker',
      fieldName: 'endDate',
      label: $t('common.endDate'),
      componentProps: {
        allowClear: true,
        format: 'YYYY-MM-DD',
        valueFormat: 'YYYY-MM-DD',
      },
    },
  ];

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

export function useColumns<T = RcExecutionLogApi.RcExecutionLog>(
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
      field: 'scenario',
      title: $t('rc.ruleGroup.scenario'),
      width: 150,
      sortable: true,
    },
    {
      field: 'groupId',
      title: $t('rc.rule.groupName'),
      width: 120,
      sortable: true,
    },
    {
      field: 'ruleId',
      title: $t('rc.rule.name'),
      width: 120,
      sortable: true,
    },
    {
      field: 'userId',
      title: $t('system.user.id'),
      width: 100,
      sortable: true,
    },
    {
      field: 'result',
      title: $t('rc.executionLog.result'),
      width: 100,
      sortable: true,
      slots: { default: 'result' },
    },
    {
      field: 'riskLevel',
      title: $t('rc.rule.riskLevel'),
      width: 120,
      sortable: true,
      slots: { default: 'riskLevel' },
    },
    {
      field: 'errorCode',
      title: $t('rc.rule.errorCode'),
      width: 120,
    },
    {
      field: 'executionTimeMs',
      title: $t('rc.executionLog.executionTimeMs'),
      width: 120,
      sortable: true,
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
          nameField: 'id',
          nameTitle: $t('rc.executionLog.moduleShort'),
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
