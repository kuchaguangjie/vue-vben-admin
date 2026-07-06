import type { VbenFormSchema } from '#/adapter/form';
import type { VxeTableGridOptions } from '#/adapter/vxe-table';

import { useSaasEnabled } from '#/hooks/common/use-saas-enabled';
import { useUserCoreMap } from '#/hooks/common/use-user-core-map';
import { $t } from '#/locales';
import { useCopyColumn } from '#/utils/use-copy-column';
import { useUserCoreColumn } from '#/utils/user-core';
import { formatBackendTime } from '#/utils/value-format';

// for search list
export function useGridFormSchema(isPlatformAdmin = false): VbenFormSchema[] {
  const { saasEnabled } = useSaasEnabled();

  const schema: VbenFormSchema[] = [
    {
      component: 'Input',
      fieldName: 'instance',
      label: $t('system.log.instance'),
      componentProps: {
        placeholder: $t('common.prefix'),
        allowClear: true,
      },
    },
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
    {
      component: 'Select',
      fieldName: 'app',
      label: $t('system.log.app'),
      componentProps: {
        allowClear: true,
        placeholder: '',
        options: [
          { label: $t('system.log.appAdmin'), value: 'admin' },
          { label: $t('system.log.appUser'), value: 'user' },
        ],
      },
    },
  ];

  if (saasEnabled.value && isPlatformAdmin) {
    schema.unshift({
      component: 'Input',
      fieldName: 'tenantId',
      label: $t('system.tenant.id'),
      componentProps: {
        type: 'number',
        allowClear: true,
        placeholder: $t('common.currentTenant'),
      },
    });
  }

  return schema;
}

export function useColumns(): VxeTableGridOptions['columns'] {
  const { saasEnabled } = useSaasEnabled();
  const { userCoreMap } = useUserCoreMap();

  const columns: VxeTableGridOptions['columns'] = [
    {
      field: 'id',
      title: $t('system.log.id'),
      width: 120,
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
      field: 'instance',
      title: $t('system.log.instance'),
      width: 200,
    },
    {
      field: 'app',
      title: $t('system.log.app'),
      width: 100,
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
    useUserCoreColumn(
      {
        field: 'createdBy',
        title: $t('common.createdBy'),
        width: 120,
      },
      userCoreMap,
    ),
  );

  return columns;
}
