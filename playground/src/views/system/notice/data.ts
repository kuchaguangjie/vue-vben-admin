import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { SystemNoticeApi } from '#/api';

import { z } from '#/adapter/form';
import { $t } from '#/locales';
import { usePreviewLink } from '#/utils/use-preview-link';
import { formatBackendTime } from '#/utils/value-format';

// form - new/edit
export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'id',
      label: $t('system.notice.id'),
      disabled: true, // 不可编辑
    },
    {
      component: 'Input',
      fieldName: 'title',
      label: $t('system.notice.title'),
      rules: 'required',
    },
    {
      component: 'Input',
      fieldName: 'code',
      label: $t('system.notice.code'),
      defaultValue: 'notice_',
      rules: z
        .string()
        .min(1, { message: '代码长度不能少于1个字符' })
        .max(20, { message: '代码长度不能超过20个字符' })
        // 限制 字符集: 字母、数字、下划线
        .regex(/^\w+$/, {
          message: $t('system.notice.codeValidation'),
        }),
      componentProps: {
        placeholder: '1 ~ 20 个字符',
        maxlength: 20,
        showCount: true,
      },
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
      component: 'RadioGroup',
      componentProps: {
        buttonStyle: 'solid',
        options: [
          { label: $t('common.enabled'), value: 1 },
          { label: $t('common.disabled'), value: 0 },
        ],
        optionType: 'button',
      },
      defaultValue: 1,
      fieldName: 'status',
      label: $t('common.status'),
    },
    {
      component: 'Textarea',
      fieldName: 'remark',
      label: $t('system.notice.remark'),
    },
    {
      fieldName: 'noticeCodes',
      component: 'TreeSelect',
      label: $t('system.notice.setInheritNotices'),
      componentProps: {
        multiple: true, // 启用多选
      },
    },
    {
      component: 'Input',
      fieldName: 'permissions',
      formItemClass: 'items-start',
      label: $t('system.notice.setPermissions'),
      modelPropName: 'modelValue',
    },
    {
      component: 'Input',
      fieldName: 'apis',
      formItemClass: 'items-start',
      label: $t('system.notice.setApis'),
      modelPropName: 'modelValue',
    },
  ];
}

// form fields - to adjust - when edit
export function formFieldsToAdjustForEdit(): VbenFormSchema[] {
  return [
    {
      component: 'Input',
      fieldName: 'code',
      label: $t('system.notice.code'),
      componentProps: {
        disabled: true, // 不可编辑
      },
    },
  ];
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
      width: 100,
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
