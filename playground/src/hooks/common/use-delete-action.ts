import type { Ref } from 'vue';

import { ref } from 'vue';

import { message } from 'ant-design-vue';

import { $t } from '#/locales';

export interface DeleteActionOptions<T extends { id: number }> {
  deleteApi: (id: number) => Promise<any>;
  getId?: (row: T) => number;
  getRowName: (row: T) => string;
  onRefresh: () => void;
}

export function useDeleteAction<T extends { id: number }>(
  options: DeleteActionOptions<T>,
) {
  const {
    getRowName,
    deleteApi,
    onRefresh,
    getId = (row: T) => row.id,
  } = options;

  const isDeleting: Ref<boolean> = ref(false);

  async function onDelete(row: T): Promise<void> {
    const rowName = getRowName(row);
    const rowId = getId(row);

    const hideLoading = message.loading({
      content: $t('ui.actionMessage.deleting', [rowName]),
      duration: 0,
      key: 'action_process_msg',
    });

    isDeleting.value = true;

    try {
      await deleteApi(rowId);
      message.success({
        content: $t('ui.actionMessage.deleteSuccess', [rowName]),
        key: 'action_process_msg',
      });
      onRefresh();
    } catch {
      hideLoading();
    } finally {
      isDeleting.value = false;
    }
  }

  return {
    onDelete,
    isDeleting,
  };
}
