import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';

import { $t } from '#/locales';
import { useCopyColumn } from '#/utils/use-copy-column';
import { formatBackendTime } from '#/utils/value-format';

// for search list
export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'code',
      label: $t('system.mem.code'),
    },
    {
      component: 'RangePicker',
      fieldName: 'createdAtRangeMs',
      label: $t('system.mem.createdAt'),
      componentProps: {
        valueFormat: 'x', // in ms
      },
    },
  ];
}

export function useColumns(): VxeTableGridOptions['columns'] {
  return [
    {
      field: 'id',
      title: $t('system.mem.id'),
      width: 150,
    },
    {
      field: 'code',
      title: $t('system.mem.code'),
      width: 250,
    },
    useCopyColumn({
      field: 'data',
      title: $t('system.mem.data'),
      width: 300,
    }),
    {
      field: 'createdAt',
      title: $t('system.mem.createdAt'),
      width: 160,
      formatter: ({ cellValue }) => formatBackendTime(cellValue), // 时间格式转换
    },
    {
      field: 'createdBy',
      title: $t('system.mem.createdBy'),
      width: 150,
    },
  ];
}
