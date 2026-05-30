import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';

import { $t } from '#/locales';

export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'InputNumber',
      fieldName: 'userId',
      label: $t('cm.userClosure.userId'),
      rules: 'required',
      componentProps: {
        min: 1,
        placeholder: $t('cm.userClosure.userId'),
        style: 'width: 100%',
      },
    },
    {
      component: 'InputNumber',
      fieldName: 'parentId',
      label: $t('cm.userClosure.parentId'),
      rules: 'required',
      componentProps: {
        min: 1,
        placeholder: $t('cm.userClosure.parentId'),
        style: 'width: 100%',
      },
    },
  ];
}

export function formFieldsToRemoveForCreate(): string[] {
  return [];
}

export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'InputNumber',
      fieldName: 'descendantId',
      label: $t('cm.userClosure.descendantId'),
      componentProps: {
        min: 1,
        allowClear: true,
        placeholder: $t('cm.userClosure.descendantId'),
        style: 'width: 100%',
      },
    },
    {
      component: 'InputNumber',
      fieldName: 'ancestorId',
      label: $t('cm.userClosure.ancestorId'),
      componentProps: {
        min: 1,
        allowClear: true,
        placeholder: $t('cm.userClosure.ancestorId'),
        style: 'width: 100%',
      },
    },
  ];
}

export function useColumns(): VxeTableGridOptions['columns'] {
  return [
    {
      field: 'ancestorId',
      title: $t('cm.userClosure.ancestorId'),
      width: 100,
      sortable: true,
    },
    {
      field: 'ancestorUsername',
      title: $t('cm.userClosure.ancestorUsername'),
      width: 140,
    },
    {
      field: 'ancestorNick',
      title: $t('cm.userClosure.ancestorNick'),
      width: 140,
    },
    {
      field: 'descendantId',
      title: $t('cm.userClosure.descendantId'),
      width: 100,
      sortable: true,
    },
    {
      field: 'descendantUsername',
      title: $t('cm.userClosure.descendantUsername'),
      width: 140,
    },
    {
      field: 'descendantNick',
      title: $t('cm.userClosure.descendantNick'),
      width: 140,
    },
    {
      field: 'distance',
      title: $t('cm.userClosure.distance'),
      width: 90,
      sortable: true,
    },
    {
      field: 'createdAt',
      title: $t('common.createdAt'),
      width: 160,
      sortable: true,
    },
    {
      field: 'operation',
      title: $t('common.operation'),
      width: 180,
      fixed: 'right',
      align: 'center',
      slots: { default: 'operation' },
    },
  ];
}
