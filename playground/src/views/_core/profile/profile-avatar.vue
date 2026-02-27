<script setup lang="ts">
import { ref } from 'vue';
import { CircleStencil, Cropper } from 'vue-advanced-cropper';
import 'vue-advanced-cropper/dist/style.css';

import { $t } from '@vben/locales';

import { VbenAvatar } from '@vben-core/shadcn-ui';

import { message, TabPane, Tabs } from 'ant-design-vue';

import { getSysAvatarListApi, updateUserAvatarApi, UserApi } from '#/api';

defineProps<{
  currentAvatar: string;
}>();
const emit = defineEmits<{
  success: [avatarUrl: string];
}>();

const MAX_SIZE = 400;
const showModal = ref(false);
const previewImage = ref('');
const cropperRef = ref();
const uploading = ref(false);

// --- 系统头像相关状态 ---
const sysAvatarList = ref<UserApi.AvatarPreviewItem[]>([]);
const loadingSysList = ref(false);
const activeTab = ref('upload'); // 'upload' | 'system'

// 1. 打开弹窗逻辑增强
async function openAvatarModal() {
  showModal.value = true;
  // 默认进入上传 tab
  activeTab.value = 'upload';
  // 预加载系统列表
  if (sysAvatarList.value.length === 0) {
    await loadSystemAvatars();
  }
}

async function loadSystemAvatars() {
  loadingSysList.value = true;
  try {
    const res = await getSysAvatarListApi();
    sysAvatarList.value = res.avatarList;
  } finally {
    loadingSysList.value = false;
  }
}

// 2. 处理本地文件选择
function handleFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.addEventListener('load', (event) => {
    previewImage.value = event.target?.result as string;
    activeTab.value = 'upload';
    showModal.value = true;
  });
  reader.readAsDataURL(file);
}

const getCanvasBlob = (canvas: HTMLCanvasElement): Promise<Blob | null> =>
  new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85));

// 3. 核心：统一确认更新逻辑
async function handleConfirmUpdate(sysAvatarPath?: string) {
  if (uploading.value) return;
  uploading.value = true;

  try {
    let res;
    if (sysAvatarPath) {
      // 分支 0: 选择系统头像 (直接传路径字符串)
      res = await updateUserAvatarApi(
        UserApi.AvatarUpdateType.SYSTEM,
        sysAvatarPath,
      );
    } else {
      // 分支 1: 裁剪上传
      if (!cropperRef.value) return;
      const { canvas, coordinates } = cropperRef.value.getResult();
      if (!canvas || !coordinates) return;

      const outputSize = Math.min(coordinates.width, MAX_SIZE);
      const drawCanvas = document.createElement('canvas');
      drawCanvas.width = drawCanvas.height = outputSize;
      const ctx = drawCanvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context error');

      ctx.drawImage(canvas, 0, 0, outputSize, outputSize);
      const blob = await getCanvasBlob(drawCanvas);
      if (!blob) throw new Error('Blob generation failed');

      const avatarFile = new File([blob], `avatar_${Date.now()}.jpg`, {
        type: 'image/jpeg',
      });
      res = await updateUserAvatarApi(
        UserApi.AvatarUpdateType.UPLOAD,
        avatarFile,
      );
    }

    emit('success', res.avatar);
    message.success($t('profile.msg.avatarUploadSuccess'));
    showModal.value = false;
    previewImage.value = ''; // 清空预览
  } catch (error: any) {
    message.error(
      $t('common.messages.uploadFailed', { error: error.message || error }),
    );
  } finally {
    uploading.value = false;
  }
}
</script>

<template>
  <div
    class="group relative size-20 cursor-pointer overflow-hidden rounded-full border border-secondary shadow-sm"
  >
    <VbenAvatar :src="currentAvatar" class="size-full object-cover" />

    <div
      class="absolute inset-0 flex flex-col items-center justify-center bg-black/50 opacity-0 transition-all duration-300 group-hover:opacity-100"
      @click="openAvatarModal"
    >
      <span class="text-[12px] font-medium text-white">{{
        $t('profile.label.changeAvatar')
      }}</span>
    </div>

    <div
      v-if="showModal"
      class="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      @click.self="showModal = false"
    >
      <div
        class="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-zinc-900"
      >
        <div class="px-4 pt-4">
          <Tabs v-model:active-key="activeTab">
            <TabPane key="upload" :tab="$t('common.action.userUpload')">
              <div class="flex flex-col items-center py-4">
                <div
                  v-if="!previewImage"
                  class="flex h-64 w-full flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-zinc-700"
                >
                  <input
                    id="avatar-input"
                    type="file"
                    accept="image/*"
                    class="hidden"
                    @change="handleFileChange"
                  />
                  <label
                    for="avatar-input"
                    class="cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                  >
                    {{
                      `${$t('common.action.uploadImage')} (${$t('profile.crop.title')})`
                    }}
                  </label>
                </div>
                <div v-else class="h-80 w-full bg-zinc-100 dark:bg-zinc-800">
                  <Cropper
                    ref="cropperRef"
                    class="h-full w-full"
                    :src="previewImage"
                    :stencil-component="CircleStencil"
                    :auto-zoom="true"
                  />
                </div>
              </div>
            </TabPane>

            <TabPane key="system" :tab="$t('common.action.chooseSystemImage')">
              <div class="grid h-80 grid-cols-4 gap-4 overflow-y-auto p-4">
                <div
                  v-if="loadingSysList"
                  class="col-span-4 flex justify-center py-10"
                >
                  <span class="animate-spin">🌀</span>
                </div>
                <div
                  v-for="item in sysAvatarList"
                  :key="item.relativePath"
                  class="group relative aspect-square cursor-pointer overflow-hidden rounded-lg border-2 border-transparent hover:border-blue-500"
                  @click="handleConfirmUpdate(item.relativePath)"
                >
                  <img :src="item.url" class="size-full object-cover" />
                  <div
                    class="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100"
                  >
                    <span class="text-xs text-white">{{
                      $t('common.action.choose')
                    }}</span>
                  </div>
                </div>
              </div>
            </TabPane>
          </Tabs>
        </div>

        <div
          v-if="activeTab === 'upload'"
          class="flex justify-end gap-3 bg-gray-50 p-4 dark:bg-zinc-800/50"
        >
          <button
            @click="showModal = false"
            class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            :disabled="uploading"
          >
            {{ $t('common.action.cancel') }}
          </button>
          <button
            v-if="previewImage"
            @click="handleConfirmUpdate()"
            :disabled="uploading"
            class="flex items-center rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            <span
              v-if="uploading"
              class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
            ></span>
            {{
              uploading
                ? $t('profile.crop.saving')
                : $t('common.action.confirm')
            }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
