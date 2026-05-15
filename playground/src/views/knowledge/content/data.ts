import type { VbenFormSchema } from '#/adapter/form';
import type { OnActionClickFn, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { KnowledgeCategoryApi, KnowledgeContentApi } from '#/api';

import { ref } from 'vue';

import { message } from 'ant-design-vue';

import { getKnowledgeCategoryList } from '#/api';
import { useSaasEnabled } from '#/hooks/common/use-saas-enabled';
import { $t } from '#/locales';
import { usePreviewLink } from '#/utils/use-preview-link';

export const categoryList = ref<KnowledgeCategoryApi.KnowledgeCategory[]>([]);
export const categoryOptions = ref<any[]>([]);
export const categoryMap = ref<Record<number, string>>({});
export function categoryIdToName(id: number): string {
  return categoryMap.value[id] || '';
}

export async function loadCategoryOptions() {
  try {
    const result = await getKnowledgeCategoryList();
    categoryList.value = result;
    categoryOptions.value = result.map((item) => ({
      label: item.name,
      value: item.id,
    }));
    const map: Record<number, string> = {};
    for (const item of result) {
      map[item.id] = item.name;
    }
    categoryMap.value = map;
  } catch {
    message.error($t('ui.message.loadFailed'));
  }
}

export function useFormSchema(): VbenFormSchema[] {
  const { saasEnabled } = useSaasEnabled();

  const schema: VbenFormSchema[] = [];

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
      component: 'Select',
      fieldName: 'categoryId',
      label: $t('knowledge.content.category'),
      componentProps: {
        options: categoryOptions,
        allowClear: true,
        placeholder: $t('ui.form.selectPlaceholder'),
        style: { width: '100%' },
      },
    },
    {
      component: 'Select',
      fieldName: 'format',
      label: $t('knowledge.content.format'),
      componentProps: {
        options: [
          { label: $t('knowledge.content.formatMarkdown'), value: 'md' },
          { label: $t('knowledge.content.formatJson'), value: 'json' },
          { label: $t('knowledge.content.formatYaml'), value: 'yaml' },
          { label: $t('knowledge.content.formatText'), value: 'txt' },
        ],
        allowClear: false,
        placeholder: $t('ui.form.selectPlaceholder'),
        style: { width: '100%' },
      },
    },
    {
      component: 'Input',
      fieldName: 'title',
      label: $t('knowledge.content.titleField'),
      rules: 'required',
    },
    {
      component: 'Textarea',
      fieldName: 'summary',
      label: $t('knowledge.content.summary'),
      componentProps: {
        rows: 2,
      },
    },
    {
      component: 'Textarea',
      fieldName: 'content',
      label: $t('knowledge.content.content'),
      rules: 'required',
      componentProps: {
        rows: 15,
        style: { fontFamily: 'monospace' },
      },
    },
    {
      component: 'Select',
      fieldName: 'tags',
      label: $t('knowledge.content.tags'),
      componentProps: {
        mode: 'tags',
        placeholder: '点击添加标签，回车确认',
        tokenSeparators: [',', ' '],
        style: { width: '100%' },
      },
    },
    {
      component: 'Input',
      fieldName: 'source',
      label: $t('knowledge.content.source'),
    },
    {
      component: 'Input',
      fieldName: 'sourceUrl',
      label: $t('knowledge.content.sourceUrl'),
    },
    {
      component: 'Select',
      fieldName: 'language',
      label: $t('knowledge.content.language'),
      componentProps: {
        options: [
          { label: $t('knowledge.content.languageZhCn'), value: 'zh-CN' },
          { label: $t('knowledge.content.languageEnUs'), value: 'en-US' },
          { label: $t('knowledge.content.languageJaJp'), value: 'ja-JP' },
          { label: $t('knowledge.content.languageKoKr'), value: 'ko-KR' },
        ],
        allowClear: true,
        placeholder: $t('ui.form.selectPlaceholder'),
        style: { width: '100%' },
      },
    },
    {
      component: 'Select',
      fieldName: 'priority',
      label: $t('knowledge.content.priority'),
      componentProps: {
        options: [
          { label: $t('knowledge.content.priorityLow'), value: 0 },
          { label: $t('knowledge.content.priorityMedium'), value: 50 },
          { label: $t('knowledge.content.priorityHigh'), value: 100 },
        ],
        allowClear: false,
        placeholder: $t('ui.form.selectPlaceholder'),
      },
    },
    {
      component: 'RadioGroup',
      fieldName: 'status',
      label: $t('common.status'),
      componentProps: {
        options: [
          { label: $t('knowledge.content.statusDraft'), value: 0 },
          { label: $t('knowledge.content.statusPublished'), value: 1 },
          { label: $t('knowledge.content.statusArchived'), value: 2 },
        ],
      },
    },
    {
      component: 'Switch',
      fieldName: 'isPrivate',
      label: $t('knowledge.content.isPrivate'),
      componentProps: {
        checkedChildren: $t('knowledge.content.yes'),
        unCheckedChildren: $t('knowledge.content.no'),
      },
    },
  );

  return schema;
}

export function formFieldsToAdjustForEdit(): VbenFormSchema[] {
  return [];
}

export function formFieldsToRemoveForCreate(): string[] {
  return ['tenantId'];
}

export function formFieldsToRemoveForPreview(): string[] {
  return ['status', 'isPrivate'];
}

export function useGridFormSchema(): VbenFormSchema[] {
  const schema: VbenFormSchema[] = [
    {
      component: 'Select',
      fieldName: 'categoryId',
      label: $t('knowledge.content.category'),
      componentProps: {
        options: categoryOptions,
        allowClear: true,
        placeholder: $t('ui.form.selectPlaceholder'),
      },
    },
    {
      component: 'Input',
      fieldName: 'title',
      label: $t('knowledge.content.titleField'),
      componentProps: {
        allowClear: true,
      },
    },
    {
      component: 'Select',
      fieldName: 'format',
      label: $t('knowledge.content.format'),
      componentProps: {
        allowClear: true,
        options: [
          { label: $t('knowledge.content.formatMarkdown'), value: 'md' },
          { label: $t('knowledge.content.formatJson'), value: 'json' },
          { label: $t('knowledge.content.formatText'), value: 'txt' },
          { label: $t('knowledge.content.formatYaml'), value: 'yaml' },
        ],
        placeholder: $t('ui.form.selectPlaceholder'),
      },
    },
    {
      component: 'Select',
      fieldName: 'status',
      label: $t('common.status'),
      componentProps: {
        allowClear: true,
        options: [
          { label: $t('knowledge.content.statusDraft'), value: 0 },
          { label: $t('knowledge.content.statusPublished'), value: 1 },
          { label: $t('knowledge.content.statusArchived'), value: 2 },
        ],
      },
    },
    {
      component: 'Select',
      fieldName: 'isPrivate',
      label: $t('knowledge.content.isPrivate'),
      componentProps: {
        allowClear: true,
        options: [
          { label: $t('knowledge.content.yes'), value: true },
          { label: $t('knowledge.content.no'), value: false },
        ],
      },
    },
  ];

  return schema;
}

export function useColumns<T = KnowledgeContentApi.KnowledgeContent>(
  onActionClick: OnActionClickFn<T>,
  onPreview: (row: any) => void,
): VxeTableGridOptions['columns'] {
  const { saasEnabled } = useSaasEnabled();

  const columns: VxeTableGridOptions['columns'] = [
    usePreviewLink(
      {
        field: 'id',
        title: $t('knowledge.content.id'),
        width: 90,
        sortable: true,
      },
      onPreview,
    ),
    {
      field: 'title',
      title: $t('knowledge.content.titleField'),
      minWidth: 200,
      sortable: true,
    },
    {
      field: 'categoryId',
      title: $t('knowledge.content.category'),
      width: 120,
      cellRender: {
        name: 'CellSpan',
        render: ({ row }) => categoryIdToName(row.categoryId),
      },
    },
    {
      field: 'format',
      title: $t('knowledge.content.format'),
      width: 100,
    },
    {
      field: 'tags',
      title: $t('knowledge.content.tags'),
      minWidth: 150,
      cellRender: {
        name: 'CellTagList',
      },
    },
    {
      field: 'status',
      title: $t('knowledge.content.status'),
      width: 100,
      sortable: true,
      slots: { default: 'status' },
    },
    {
      field: 'isPrivate',
      title: $t('knowledge.content.isPrivate'),
      width: 80,
      slots: { default: 'isPrivate' },
    },
    {
      field: 'language',
      title: $t('knowledge.content.language'),
      width: 100,
    },
    {
      field: 'priority',
      title: $t('knowledge.content.priority'),
      width: 80,
      sortable: true,
    },
    {
      field: 'viewCount',
      title: $t('knowledge.content.viewCount'),
      width: 100,
      sortable: true,
    },
    {
      field: 'useCount',
      title: $t('knowledge.content.useCount'),
      width: 100,
      sortable: true,
    },
    {
      field: 'createdAt',
      title: $t('knowledge.content.createdAt'),
      width: 160,
      sortable: true,
    },
    {
      field: 'publishedAt',
      title: $t('knowledge.content.publishedAt'),
      width: 160,
      sortable: true,
    },
  ];

  if (saasEnabled.value) {
    columns.push({
      field: 'tenantId',
      title: $t('system.tenant.id'),
      width: 100,
      sortable: true,
    });
  }

  columns.push({
    align: 'center',
    cellRender: {
      attrs: {
        nameField: 'title',
        nameTitle: $t('knowledge.content.moduleShort'),
        onClick: onActionClick,
      },
      name: 'CellOperation',
    },
    field: 'operation',
    fixed: 'right',
    title: $t('knowledge.content.operation'),
    width: 130,
  });

  return columns;
}
