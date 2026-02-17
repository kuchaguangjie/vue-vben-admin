import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemNoticeApi } from '#/api';

import { $t } from '#/locales';
import { usePreviewLink } from '#/utils/use-preview-link';
import { formatBackendTime } from '#/utils/value-format';
import { ref } from 'vue';

export const categoryMap = ref<Record<number, string>>({}); // id > name
export function categoryIdToMap(id: number): string {
  return categoryMap.value[id] || '';
}

// form - new/edit
export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'id',
      label: $t('common.id'),
      disabled: true, // 不可编辑
    },
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
      // 使用 colProps 确保表单项有足够的宽度，避免缩成一团
      componentProps: {
        multiple: false, // 单选
        style: { width: '90%', minWidth: '100px' },
        allowClear: true,
        showArrow: true,
        options: [
          { label: 'holiday', value: 'holiday' },
          { label: 'bonus', value: 'bonus' },
        ],
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
    {
      component: 'Input',
      fieldName: 'version',
      label: '', // 空标签使其不显示
      componentProps: {
        style: { display: 'none' }, // 隐藏输入框
        disabled: true, // 不可编辑
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
  ];
}

// form fields - to adjust - when edit
export function formFieldsToAdjustForEdit(): VbenFormSchema[] {
  return [];
}

// form fields - to remove - when create
export function formFieldsToRemoveForCreate(): string[] {
  return ['id'];
}

// form fields - to remove - when preview
export function formFieldsToRemoveForPreview(): string[] {
  return [];
}

export function useGridFormSchema(): VbenFormSchema[] {
  return [
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
      component: 'Input',
      fieldName: 'category',
      label: $t('system.notice.category'),
      componentProps: {
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
}

export function useColumns<T = SystemNoticeApi.SystemNotice>(
  onActionClick: OnActionClickFn<T>,
  onPreview: (row: any) => void,
  // onStatusChange?: (newStatus: any, row: T) => PromiseLike<boolean | undefined>,
): VxeTableGridOptions['columns'] {
  return [
    usePreviewLink(
      {
        field: 'id',
        title: $t('common.id'),
        width: 90,
        sortable: true,
      },
      onPreview,
    ),
    {
      field: 'title',
      title: $t('system.notice.title'),
      width: 200,
      sortable: true,
    },
    {
      field: 'category',
      title: $t('system.notice.category'),
      width: 100,
      sortable: true,
    },
    {
      field: 'push',
      title: $t('system.notice.push'),
      width: 90,
      formatter: ({ cellValue }) =>
        cellValue ? $t('common.boolOptions.yes') : $t('common.boolOptions.no'),
      sortable: true,
    },
    {
      field: 'tags',
      title: $t('system.notice.tags'),
      width: 100,
    },
    {
      field: 'status',
      title: $t('common.status'),
      width: 100,
      formatter: ({ cellValue }) => noticeStatusToI18n(cellValue), // 时间格式转换
      sortable: true,
    },
    {
      field: 'createdAt',
      title: $t('common.createdAt'),
      width: 160,
      formatter: ({ cellValue }) => formatBackendTime(cellValue), // 时间格式转换
      sortable: true,
    },
    {
      field: 'createdBy',
      title: $t('common.createdBy'),
      width: 100,
    },
    {
      field: 'publishedAt',
      title: $t('common.publishedAt'),
      width: 160,
      formatter: ({ cellValue }) => formatBackendTime(cellValue), // 时间格式转换
      sortable: true,
    },
    {
      field: 'publishedBy',
      title: $t('common.publishedBy'),
      width: 100,
    },
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
  ];
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
