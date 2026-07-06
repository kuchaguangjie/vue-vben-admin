import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemNoticeApi } from '#/api';

import { useSaasEnabled } from '#/hooks/common/use-saas-enabled';
import { $t } from '#/locales';
import { formatBackendTime } from '#/utils/value-format';

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

  schema.push({
    component: 'Input',
    fieldName: 'name',
    label: $t('system.noticeCategory.name'),
    rules: 'required',
  });

  return schema;
}

// form fields - to adjust - when edit
export function formFieldsToAdjustForEdit(): VbenFormSchema[] {
  return [];
}

// form fields - to remove - when create
export function formFieldsToRemoveForCreate(): string[] {
  return ['id', 'tenantId'];
}

// form fields - to remove - when preview
export function formFieldsToRemoveForPreview(): string[] {
  return [];
}

export function useGridFormSchema(): VbenFormSchema[] {
  const schema: VbenFormSchema[] = [
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('system.noticeCategory.name'),
      componentProps: {
        placeholder: $t('common.prefix'),
        allowClear: true,
      },
    },
    {
      component: 'Input',
      fieldName: 'id',
      label: $t('common.id'),
      componentProps: {
        allowClear: true,
      },
    },
  ];

  return schema;
}

export function useColumns<T = SystemNoticeApi.SystemNoticeCategory>(
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
      title: $t('system.noticeCategory.name'),
      width: 200,
      sortable: true,
    },
    {
      field: 'createdAt',
      title: $t('common.createdAt'),
      width: 160,
      sortable: true,
      formatter: ({ cellValue }) => formatBackendTime(cellValue),
    },
    {
      align: 'center',
      cellRender: {
        attrs: {
          nameField: 'name',
          nameTitle: $t('system.noticeCategory.module'),
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
