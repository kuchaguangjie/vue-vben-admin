import type { Ref } from 'vue';
import { ref } from 'vue';

import { $t } from '#/locales';
import { confirmDialog } from '#/utils/dialog';

export interface StatusToggleOptions<T extends { id: number }> {
  getRowName: (row: T) => string;
  updateStatus: (data: { id: number; status: number }) => Promise<any>;
  onRefresh: () => void;
  statusMap?: Record<number | string, string>;
  confirmTitle?: string;
}

export function useStatusToggle<T extends { id: number }>(
  options: StatusToggleOptions<T>,
) {
  const {
    getRowName,
    updateStatus,
    onRefresh,
    statusMap = {
      0: $t('common.disabled'),
      1: $t('common.enabled'),
    },
    confirmTitle = $t('ui.confirm.title'),
  } = options;

  const isToggling: Ref<boolean> = ref(false);

  async function onStatusChange(
    newStatus: number,
    row: T,
  ): Promise<boolean> {
    const rowName = getRowName(row);
    const statusText = statusMap[newStatus] ?? String(newStatus);

    try {
      isToggling.value = true;
      await confirmDialog(
        $t('ui.confirm.statusChange', [rowName, statusText]),
        confirmTitle,
      );
      await updateStatus({ id: row.id, status: newStatus });
      onRefresh();
      return true;
    } catch {
      return false;
    } finally {
      isToggling.value = false;
    }
  }

  return {
    onStatusChange,
    isToggling,
  };
}
