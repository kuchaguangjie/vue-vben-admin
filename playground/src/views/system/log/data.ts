import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';

import { $t } from '#/locales';
import { formatBackendTime } from '#/utils/dateFormat';

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
    {
      field: 'data',
      title: $t('system.log.data'),
      width: 300,
      // 添加格式化器，将 JSON 对象转换为可读字符串
      formatter: ({ cellValue }) => {
        if (!cellValue) return '';

        try {
          // 如果已经是字符串，直接返回
          if (typeof cellValue === 'string') {
            return cellValue;
          }

          // 如果是对象，格式化为 JSON 字符串
          return JSON.stringify(cellValue, null, 2);
        } catch (error) {
          console.error('格式化 data 字段失败:', error);
          return String(cellValue);
        }
      },
    },
    {
      field: 'createdBy',
      title: $t('system.log.createdBy'),
      width: 150,
    },
    {
      field: 'createdAt',
      title: $t('system.log.createdAt'),
      width: 160,
      formatter: ({ cellValue }) => formatBackendTime(cellValue), // 时间格式转换
    },
  ];
}
