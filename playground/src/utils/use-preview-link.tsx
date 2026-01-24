// src/hooks/use-preview-link.tsx
import { IconifyIcon } from '@vben/icons';

interface PreviewOptions {
  field: string;
  sortable?: boolean;
  title: string;
  width?: number | string;
}

export function usePreviewLink(
  options: PreviewOptions,
  onPreview: (row: any) => void,
) {
  const { field, title, width = 120, sortable } = options;

  return {
    field,
    title,
    width,
    sortable,
    slots: {
      default: ({ row }: any) => (
        <div
          class="group flex cursor-pointer items-center gap-1 text-primary hover:underline"
          onClick={() => onPreview(row)}
        >
          {/* 只在 hover 时显示的微小提示 */}
          <IconifyIcon
            class="invisible size-3 group-hover:visible"
            icon="lucide:eye"
          />
          <span class="font-medium">{row[field]}</span>
        </div>
      ),
    },
  };
}
