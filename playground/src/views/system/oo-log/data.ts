import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';

import { h } from 'vue';

import { Tag } from 'ant-design-vue';

import { useSaasEnabled } from '#/hooks/common/use-saas-enabled';
import { $t } from '#/locales';

export function useGridFormSchema(): VbenFormSchema[] {
  const schema: VbenFormSchema[] = [
    {
      component: 'Select',
      fieldName: 'module',
      label: $t('system.ooLog.module'),
      componentProps: {
        allowClear: false,
        options: [
          { label: $t('system.ooLog.moduleAdmin'), value: 'admin' },
          { label: $t('system.ooLog.moduleUser'), value: 'user' },
        ],
      },
      defaultValue: 'admin',
    },
    {
      component: 'Input',
      fieldName: 'keyword',
      label: $t('system.ooLog.keyword'),
      componentProps: {
        placeholder: $t('common.prefix'),
        allowClear: true,
      },
    },
    {
      component: 'RangePicker',
      fieldName: 'timeRange',
      label: $t('system.ooLog.timeRange'),
      componentProps: {
        showTime: true,
        valueFormat: 'YYYY-MM-DD HH:mm:ss',
      },
    },
  ];

  return schema;
}

export function useColumns(): VxeTableGridOptions['columns'] {
  const { saasEnabled } = useSaasEnabled();

  const columns: VxeTableGridOptions['columns'] = [
    {
      field: 'timestamp',
      title: $t('system.ooLog.timestamp'),
      width: 180,
    },
    {
      field: 'level',
      title: $t('system.ooLog.level'),
      width: 100,
      align: 'center',
      formatter: ({ cellValue }) => {
        const color = getLevelColor(cellValue);
        return h(Tag, { color }, () => cellValue);
      },
    },
    {
      field: 'message',
      title: $t('system.ooLog.message'),
      minWidth: 300,
      showOverflow: 'title',
    },
    {
      field: 'caller',
      title: $t('system.ooLog.caller'),
      width: 250,
    },
  ];

  if (saasEnabled.value) {
    columns.push({
      field: 'tenantId',
      title: $t('system.tenant.id'),
      width: 90,
    });
  }

  columns.push(
    {
      field: 'userId',
      title: $t('system.ooLog.userId'),
      width: 100,
    },
    {
      field: 'username',
      title: $t('system.ooLog.username'),
      width: 150,
    },
    {
      field: 'requestId',
      title: $t('system.ooLog.requestId'),
      width: 200,
    },
  );

  return columns;
}

export function getLevelColor(level: string): string {
  const lowerLevel = level?.toLowerCase() || '';
  switch (lowerLevel) {
    case 'debug': {
      return 'blue';
    }
    case 'error':
    case 'fatal':
    case 'panic': {
      return 'red';
    }
    case 'info': {
      return 'green';
    }
    case 'warn':
    case 'warning': {
      return 'gold';
    }
    default: {
      return 'default';
    }
  }
}
