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
      label: $t('system.log.code'),
    },
    {
      component: 'RangePicker',
      fieldName: 'createdAtRangeMs',
      label: $t('system.log.createdAt'),
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
      title: $t('system.log.id'),
      width: 150,
    },
    {
      field: 'code',
      title: $t('system.log.code'),
      width: 250,
    },
    useCopyColumn({
      field: 'data',
      title: $t('system.log.data'),
      width: 300,
    }),
    {
      field: 'createdAt',
      title: $t('system.log.createdAt'),
      width: 160,
      formatter: ({ cellValue }) => formatBackendTime(cellValue), // 时间格式转换
    },
    {
      field: 'createdBy',
      title: $t('system.log.createdBy'),
      width: 150,
    },
  ];
}
