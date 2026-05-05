import type { Ref } from 'vue';

import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemTenantApi, SystemUserApi } from '#/api';

import { ref } from 'vue';

import type { SystemNoticeApi } from '#/api/system/notice';
import { useSaasEnabled } from '#/hooks/common/use-saas-enabled';
import { $t } from '#/locales';
import { usePreviewLink } from '#/utils/use-preview-link';
import { useUserCoreColumn } from '#/utils/user-core';
import { formatBackendTime } from '#/utils/value-format';

export const categoryList = ref<SystemNoticeApi.SystemNoticeCategory[]>([]);
export const categoryOptions = ref<any[]>([]);
export const categoryMap = ref<Record<number, string>>({});
export function categoryIdToNameMap(id: number): string {
  return categoryMap.value[id] || '';
}

export const tenantList = ref<SystemTenantApi.SystemTenant[]>([]);
export const tenantOptions = ref<any[]>([]);
export const tenantMap = ref<Record<number, string>>({});
export function tenantIdToNameMap(id: number): string {
  return tenantMap.value[id] || $t('system.tenant.platform');
}

const NoticePushScope = {
  Platform: 1,
  All: 2,
  Tenant: 3,
} as const;

export function pushScopeToI18n(pushScope: number): string {
  switch (pushScope) {
    case NoticePushScope.Platform:
      return $t('system.notice.pushScopeOption.platform');
    case NoticePushScope.All:
      return $t('system.notice.pushScopeOption.all');
    case NoticePushScope.Tenant:
      return $t('system.notice.pushScopeOption.tenant');
    default:
      return String(pushScope);
  }
}

export function useFormSchema(isPlatformAdmin = false): VbenFormSchema[] {
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
      fieldName: 'title',
      label: $t('system.notice.title'),
      rules: 'required',
    },
    {
      component: 'Select',
      fieldName: 'categoryId',
      label: $t('system.notice.category'),
      rules: 'required',
      componentProps: {
        multiple: false,
        style: { width: '90%', minWidth: '100px' },
        allowClear: true,
        showArrow: true,
        options: categoryOptions,
      },
    },
    {
      component: 'RadioGroup',
      componentProps: {
        buttonStyle: 'solid',
        options: [
          { label: $t('common.boolOptions.yes'), value: true },
          { label: $t('common.boolOptions.no'), value: false },
        ],
        optionType: 'button',
      },
      defaultValue: false,
      fieldName: 'push',
      label: $t('system.notice.push'),
    },
  );

  if (saasEnabled.value && isPlatformAdmin) {
    schema.push(
      {
        component: 'RadioGroup',
        componentProps: {
          buttonStyle: 'solid',
          options: [
            {
              label: $t('system.notice.pushScopeOption.platform'),
              value: NoticePushScope.Platform,
            },
            {
              label: $t('system.notice.pushScopeOption.all'),
              value: NoticePushScope.All,
            },
            {
              label: $t('system.notice.pushScopeOption.tenant'),
              value: NoticePushScope.Tenant,
            },
          ],
          optionType: 'button',
        },
        defaultValue: NoticePushScope.Platform,
        fieldName: 'pushScope',
        label: $t('system.notice.pushScope'),
      },
      {
        component: 'Select',
        fieldName: 'targetTenantId',
        label: $t('system.notice.targetTenant'),
        componentProps: {
          multiple: false,
          style: { width: '90%', minWidth: '100px' },
          allowClear: true,
          showArrow: true,
          options: tenantOptions,
          placeholder: $t('common.inputOrSelect'),
        },
      },
    );
  }

  schema.push(
    {
      component: 'Input',
      fieldName: 'version',
      label: '',
      componentProps: {
        style: { display: 'none' },
        disabled: true,
      },
    },
    {
      component: 'Select',
      fieldName: 'tags',
      label: $t('system.notice.tags'),
      // 使用 colProps 确保表单项有足够的宽度，避免缩成一团
      componentProps: {
        mode: 'tags',
        placeholder: $t('common.inputOrSelect'),
        style: { width: '90%', minWidth: '100px' },
        allowClear: true,
        showArrow: true,
        options: [
          { label: 'holiday', value: 'holiday' },
          { label: 'bonus', value: 'bonus' },
        ],
        maxTagCount: 'responsive', // 自动响应式隐藏多余标签，避免撑爆高度
      },
    },
    {
      component: 'RadioGroup',
      componentProps: {
        buttonStyle: 'solid',
        options: [
          { label: $t('system.notice.statusOption.draft'), value: 1 },
          { label: $t('system.notice.statusOption.published'), value: 2 },
        ],
        optionType: 'button',
      },
      defaultValue: 1,
      fieldName: 'status',
      label: $t('common.status'),
    },
    {
      component: 'Textarea',
      fieldName: 'data',
      label: $t('system.notice.data'),
    },
  );

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

export function useGridFormSchema(isPlatformAdmin = false): VbenFormSchema[] {
  const { saasEnabled } = useSaasEnabled();

  const schema: VbenFormSchema[] = [
    {
      component: 'Input',
      fieldName: 'title',
      label: $t('system.notice.title'),
      componentProps: {
        placeholder: $t('common.prefix'),
        allowClear: true,
      },
    },
    {
      component: 'Select',
      fieldName: 'categoryId',
      label: $t('system.notice.category'),
      componentProps: {
        allowClear: true,
        options: categoryOptions,
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
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [
          { label: $t('system.notice.statusOption.draft'), value: 1 },
          { label: $t('system.notice.statusOption.published'), value: 2 },
        ],
      },
      fieldName: 'status',
      label: $t('common.status'),
    },
    {
      component: 'RangePicker',
      fieldName: 'createdAtRangeMs',
      label: $t('common.createdAt'),
      componentProps: {
        valueFormat: 'x', // in ms
        showTime: true, // 选择 时/分/秒
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

export function useColumns<T = SystemNoticeApi.SystemNotice>(
  onActionClick: OnActionClickFn<T>,
  onPreview: (row: any) => void,
  userCoreMap: Ref<Record<number, SystemUserApi.UserCore>>,
): VxeTableGridOptions['columns'] {
  const { saasEnabled } = useSaasEnabled();

  const columns: VxeTableGridOptions['columns'] = [
    usePreviewLink(
      {
        field: 'id',
        title: $t('common.id'),
        width: 90,
        sortable: true,
      },
      onPreview,
    ),
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
      field: 'title',
      title: $t('system.notice.title'),
      width: 200,
      sortable: true,
    },
    {
      field: 'categoryId',
      title: $t('system.notice.category'),
      width: 100,
      sortable: true,
      formatter: ({ cellValue }) => categoryIdToNameMap(cellValue),
    },
    {
      field: 'push',
      title: $t('system.notice.push'),
      width: 90,
      formatter: ({ cellValue }) =>
        cellValue ? $t('common.boolOptions.yes') : $t('common.boolOptions.no'),
      sortable: true,
    },
  );

  if (saasEnabled.value) {
    columns.push(
      {
        field: 'pushScope',
        title: $t('system.notice.pushScope'),
        width: 110,
        formatter: ({ cellValue }) => pushScopeToI18n(cellValue),
        sortable: true,
      },
      {
        field: 'targetTenantId',
        title: $t('system.notice.targetTenant'),
        width: 120,
        formatter: ({ cellValue }) => tenantIdToNameMap(cellValue),
        sortable: true,
      },
    );
  }

  columns.push(
    {
      field: 'tags',
      title: $t('system.notice.tags'),
      width: 100,
    },
    {
      field: 'status',
      title: $t('common.status'),
      width: 100,
      formatter: ({ cellValue }) => noticeStatusToI18n(cellValue),
      sortable: true,
    },
    {
      field: 'createdAt',
      title: $t('common.createdAt'),
      width: 160,
      formatter: ({ cellValue }) => formatBackendTime(cellValue),
      sortable: true,
    },
    useUserCoreColumn(
      {
        field: 'createdBy',
        title: $t('common.createdBy'),
        width: 120,
      },
      userCoreMap,
    ),
    {
      field: 'publishedAt',
      title: $t('common.publishedAt'),
      width: 160,
      formatter: ({ cellValue }) => formatBackendTime(cellValue),
      sortable: true,
    },
    useUserCoreColumn(
      {
        field: 'publishedBy',
        title: $t('common.publishedBy'),
        width: 120,
      },
      userCoreMap,
    ),
    {
      align: 'center',
      cellRender: {
        attrs: {
          nameField: 'name',
          nameTitle: $t('system.notice.module'),
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

function noticeStatusToI18n(status: number): any {
  let result: any;
  switch (status) {
    case 1: {
      result = $t('system.notice.statusOption.draft');
      break;
    }
    case 2: {
      result = $t('system.notice.statusOption.published');
      break;
    }
    default: {
      result = status;
    }
  }
  return result;
}
