import { IconifyIcon } from '@vben/icons';

import { useClipboard } from '@vueuse/core';
import { Popover as APopover, message } from 'ant-design-vue';

import { $t } from '#/locales';

export function useCopyColumn(options: {
  field: string;
  icon?: string;
  title: string;
  width?: number | string;
}) {
  const { copy } = useClipboard();
  const iconName = options.icon || 'lucide:copy';

  // 格式化：弹窗用（格式化, 带缩进, 完整）
  const formatValue = (v: any) => {
    // eslint-disable-next-line eqeqeq
    if (v == null) return '';
    if (typeof v === 'object') return JSON.stringify(v, null, 2);
    return String(v);
  };

  // 格式化：单元格用（单行, 截断）
  const formatValueSingleLine = (v: any) => {
    // eslint-disable-next-line eqeqeq
    if (v == null) return '';
    if (typeof v === 'object') return JSON.stringify(v);
    return String(v);
  };

  const handleCopy = async (value: any) => {
    const text = formatValue(value);
    if (!text) return;
    await copy(text);
    message.success($t('common.messages.copied'));
  };

  return {
    ...options,
    slots: {
      default: ({ row, column }: any) => {
        const val = row[column.field];
        return (
          <div class="group flex min-h-[24px] w-full items-center justify-between overflow-hidden px-2">
            <APopover mouseEnterDelay={0.5} placement="top">
              {{
                content: () => (
                  <pre class="m-0 max-w-[400px] overflow-auto whitespace-pre-wrap break-all text-[12px] leading-relaxed opacity-90">
                    {formatValue(val)}
                  </pre>
                ),
                default: () => (
                  <div class="flex-1 cursor-help truncate text-sm">
                    {formatValueSingleLine(val)}
                  </div>
                ),
              }}
            </APopover>
            <div
              class="invisible ml-2 flex-shrink-0 cursor-pointer text-primary transition-all active:opacity-70 group-hover:visible"
              onClick={(e: Event) => {
                e.stopPropagation();
                handleCopy(val);
              }}
            >
              <IconifyIcon class="size-4" icon={iconName} />
            </div>
          </div>
        );
      },
    },
  };
}
