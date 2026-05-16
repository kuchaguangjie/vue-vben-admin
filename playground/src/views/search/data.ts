import type { VbenFormSchema } from '#/adapter/form';

import { computed, ref } from 'vue';

import { getKnowledgeCategoryList } from '#/api';
import { $t } from '#/locales';

export const categoryOptions = ref<any[]>([]);
export const categoryMap = ref<Record<number, string>>({});

export async function loadCategoryOptions() {
  try {
    const result = await getKnowledgeCategoryList();
    categoryOptions.value = result.map((item: any) => ({
      label: item.name,
      value: item.id,
    }));
    const map: Record<number, string> = {};
    for (const item of result) {
      map[item.id] = item.name;
    }
    categoryMap.value = map;
  } catch {
    // 静默失败
  }
}

export function useSearchFormSchema(): VbenFormSchema[] {
  const statusOptions = computed(() => [
    { label: $t('search.statusDraft'), value: 0 },
    { label: $t('search.statusPublished'), value: 1 },
    { label: $t('search.statusArchived'), value: 2 },
  ]);

  return [
    {
      component: 'Input',
      fieldName: 'q',
      label: $t('search.knowledge.keyword'),
      componentProps: {
        placeholder: $t('search.knowledge.pleaseEnterKeyword'),
        allowClear: true,
      },
      rules: 'required',
    },
    {
      component: 'Select',
      fieldName: 'categoryId',
      label: $t('search.knowledge.category'),
      componentProps: {
        options: categoryOptions,
        allowClear: true,
        placeholder: $t('search.knowledge.category'),
      },
    },
    {
      component: 'Input',
      fieldName: 'tags',
      label: $t('search.knowledge.tags'),
      componentProps: {
        placeholder: $t('search.knowledge.tags'),
        allowClear: true,
      },
    },
    {
      component: 'Select',
      fieldName: 'status',
      label: $t('search.knowledge.status'),
      componentProps: {
        allowClear: true,
        options: statusOptions.value,
        placeholder: $t('search.knowledge.status'),
      },
    },
  ];
}
