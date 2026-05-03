import type { Ref, VxeTableGridOptions } from '@vben/plugins/vxe-table';

import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn } from '#/adapter/vxe-table';
import type { SystemUserApi } from '#/api';
import type { SystemDeptApi } from '#/api/system/dept';

import { z } from '#/adapter/form';
import { useSaasEnabled } from '#/hooks/common/use-saas-enabled';
import { $t } from '#/locales';
import { usePreviewLink } from '#/utils/use-preview-link';
import { useUserCoreColumn } from '#/utils/user-core';
import { formatBackendTime } from '#/utils/value-format';

/**
 * 获取编辑表单的字段配置。如果没有使用多语言，可以直接export一个数组常量
 */
export function useFormSchema(): VbenFormSchema[] {
  const { saasEnabled } = useSaasEnabled();

  const schema: VbenFormSchema[] = [
    {
      component: 'Input',
      fieldName: 'id',
      label: $t('system.dept.id'),
      disabled: true, // 不可编辑
    },
  ];

  if (saasEnabled.value) {
    schema.push({
      component: 'Input',
      fieldName: 'tenantId',
      label: $t('system.tenant.id'),
      disabled: true, // 不可编辑
    });
  }

  schema.push(
    {
      component: 'Input',
      fieldName: 'name',
      label: $t('system.dept.name'),
      rules: z
        .string()
        .min(2, $t('ui.formRules.minLength', [$t('system.dept.name'), 2]))
        .max(20, $t('ui.formRules.maxLength', [$t('system.dept.name'), 20])),
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
      component: 'TreeSelect',
      componentProps: {
        allowClear: true,
        class: 'w-full',
        labelField: 'name',
        valueField: 'id',
        childrenField: 'children',
      },
      fieldName: 'pid',
      label: $t('system.dept.parentDept'),
    },
    {
      fieldName: 'roleCodes',
      component: 'TreeSelect',
      label: $t('system.user.setRoles'),
      componentProps: {
        multiple: true, // 启用多选
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
      label: $t('system.dept.status'),
    },
    {
      component: 'Textarea',
      componentProps: {
        maxLength: 50,
        rows: 3,
        showCount: true,
      },
      fieldName: 'remark',
      label: $t('system.dept.remark'),
      rules: z
        .string()
        .max(50, $t('ui.formRules.maxLength', [$t('system.dept.remark'), 50]))
        .optional(),
    },
  );

  return schema;
}

// form fields - to remove - when create
export function formFieldsToRemoveForCreate(): string[] {
  return ['id', 'tenantId'];
}

// form fields - to adjust - when edit
export function formFieldsToAdjustForEdit(): VbenFormSchema[] {
  return [];
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
      fieldName: 'name',
      label: $t('system.dept.name'),
      componentProps: {
        placeholder: $t('common.prefix'),
      },
    },
    { component: 'Input', fieldName: 'id', label: $t('system.dept.id') },
    {
      component: 'Select',
      componentProps: {
        allowClear: true,
        options: [
          { label: $t('common.enabled'), value: 1 },
          { label: $t('common.disabled'), value: 0 },
        ],
      },
      fieldName: 'status',
      label: $t('system.dept.status'),
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

/**
 * 获取表格列配置
 * @description 使用函数的形式返回列数据而不是直接export一个Array常量，是为了响应语言切换时重新翻译表头
 * @param onActionClick 表格操作按钮点击事件
 * @param onPreview
 * @param userCoreMap
 */
export function useColumns(
  onActionClick: OnActionClickFn<SystemDeptApi.SystemDept>,
  onPreview: (row: any) => void,
  userCoreMap: Ref<Record<number, SystemUserApi.UserCore>>,
): VxeTableGridOptions<SystemDeptApi.SystemDept>['columns'] {
  const { saasEnabled } = useSaasEnabled();

  const columns: VxeTableGridOptions<SystemDeptApi.SystemDept>['columns'] = [
    usePreviewLink(
      {
        field: 'id',
        title: $t('common.id'),
        width: 75,
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
      align: 'left',
      field: 'name',
      fixed: 'left',
      title: $t('system.dept.name'),
      treeNode: true,
      width: 150,
      sortable: true,
    },
    {
      cellRender: { name: 'CellTag' },
      field: 'status',
      title: $t('system.dept.status'),
      width: 100,
      sortable: true,
    },
    {
      field: 'remark',
      title: $t('system.dept.remark'),
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
      align: 'right',
      cellRender: {
        attrs: {
          nameField: 'name',
          nameTitle: $t('system.dept.module'),
          onClick: onActionClick,
        },
        name: 'CellOperation',
        options: [
          {
            code: 'append',
            text: $t('common.newChild'),
          },
          'edit',
          {
            code: 'delete',
            disabled: (row: SystemDeptApi.SystemDept) => {
              return !!(row.children && row.children.length > 0);
            },
          },
        ],
      },
      field: 'operation',
      fixed: 'right',
      headerAlign: 'center',
      showOverflow: false,
      title: $t('system.dept.operation'),
      width: 200,
    },
  );

  return columns;
}
