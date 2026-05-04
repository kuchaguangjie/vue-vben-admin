import type { Ref } from 'vue';

import type { SystemUserApi } from '#/api/system/user';

import { IconifyIcon } from '@vben/icons';

import { useClipboard } from '@vueuse/core';
import { message, Popover } from 'ant-design-vue';

import { $t } from '#/locales';

export function getUserCoreDisplay(
  userId: number,
  userCore: null | SystemUserApi.UserCore,
) {
  return userCore && userCore.nick ? userCore?.nick : `id=${userId}`;
}

export function useUserCoreColumn(
  options: {
    field: string;
    title: string;
    width?: number | string;
  },
  userCoreMapRef: Ref,
) {
  const { copy } = useClipboard();

  // 复制 ID
  const handleCopy = async (user: SystemUserApi.UserCore) => {
    if (!user?.id) return;
    await copy(String(user.id));
    message.success($t('common.messages.copiedId'));
  };

  return {
    ...options,
    slots: {
      default: ({ row, column }: any) => {
        const userId = row[column.field] as number;
        const userCore = userCoreMapRef?.value[userId];
        const displayName = getUserCoreDisplay(userId, userCore);

        if (userCore) {
          return (
            <div class="group flex min-h-[24px] w-full items-center justify-between overflow-hidden px-2">
              <Popover mouseEnterDelay={0.3} placement="top">
                {{
                  content: () => (
                    <div class="flex flex-col gap-1.5 p-1 text-sm">
                      {[
                        {
                          label: $t('common.id'),
                          value: userCore?.id,
                          isMono: true,
                        },
                        {
                          label: $t('system.tenant.id'),
                          value: userCore?.tenantId ?? '-',
                          isMono: true,
                        },
                        {
                          label: $t('system.user.username'),
                          value: userCore?.username,
                        },
                        {
                          label: $t('system.user.nick'),
                          value: userCore?.nick,
                        },
                      ].map((item) => (
                        <div class="flex items-center">
                          <span class="w-auto text-right opacity-60">
                            {item.label}:
                          </span>
                          <span
                            class={`ml-3 w-auto flex-1 text-right ${item.isMono ? 'font-mono' : ''}`}
                          >
                            {item.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  ),
                  default: () => (
                    <div class="flex-1 cursor-help truncate text-sm">
                      {displayName}
                    </div>
                  ),
                }}
              </Popover>

              <div
                class="invisible ml-2 flex-shrink-0 cursor-pointer text-primary transition-all active:opacity-70 group-hover:visible"
                onClick={(e: Event) => {
                  e.stopPropagation();
                  handleCopy(userCore);
                }}
                title={$t('common.messages.copyId')}
              >
                <IconifyIcon class="size-4" icon="lucide:copy" />
              </div>
            </div>
          );
        }

        return (
          <Popover mouseEnterDelay={0.3} placement="top">
            {{
              content: () => (
                <div class="p-1 text-sm text-muted-foreground">
                  {$t('common.userNotFound')} (ID: {userId})
                </div>
              ),
              default: () => (
                <span class="cursor-help text-sm text-muted-foreground">
                  {displayName}
                </span>
              ),
            }}
          </Popover>
        );
      },
    },
  };
}
