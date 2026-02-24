<script setup lang="ts">
import { ref } from 'vue';
// 引入核心组件和圆形模板
import { CircleStencil, Cropper } from 'vue-advanced-cropper';
import 'vue-advanced-cropper/dist/style.css';

import { $t } from '@vben/locales';

import { VbenAvatar } from '@vben-core/shadcn-ui';

import { message } from 'ant-design-vue';

import { updateUserAvatarApi } from '#/api';

defineProps<{
  currentAvatar: string;
}>();

const emit = defineEmits(['updateSuccess']);
const MAX_SIZE = 400; // 最大尺寸, (边长);

const showModal = ref(false);
const previewImage = ref('');
const cropperRef = ref();
const uploading = ref(false);

// 1. 处理文件选择
function handleFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) {
    console.warn('no file');
    return;
  }

  const reader = new FileReader();
  reader.addEventListener('load', (event) => {
    previewImage.value = event.target?.result as string;
    showModal.value = true;
  });
  reader.readAsDataURL(file);
}

// 2. crop & 上传
async function handleConfirmUpdate() {
  if (!cropperRef.value) return;

  const result = cropperRef.value.getResult();
  const { canvas, coordinates } = result; // coordinates 是用户在原图上选取的像素坐标
  if (!canvas || !coordinates) return;

  const originalWidth = coordinates.width;
  const outputSize = Math.min(originalWidth, MAX_SIZE);
  console.warn(
    `[crop] original size: ${originalWidth}px, output size: ${outputSize}px`,
  );

  // resize
  const drawCanvas = document.createElement('canvas');
  drawCanvas.width = outputSize;
  drawCanvas.height = outputSize;
  const ctx = drawCanvas.getContext('2d');
  if (ctx) {
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    // 将 result.canvas 绘制到我们的 drawCanvas 上，自动完成缩放
    ctx.drawImage(canvas, 0, 0, outputSize, outputSize);
  }

  drawCanvas.toBlob(
    async (blob: Blob | null) => {
      if (!blob) return;

      // convert to file, with given name
      const fileName = `avatar_${Date.now()}.jpg`;
      // 将 blob 转换为 File 对象，第二个参数就是你想要的文件名
      const avatarFile = new File([blob], fileName, {
        type: 'image/jpeg',
      });

      // upload
      try {
        uploading.value = true;
        const res = await updateUserAvatarApi(avatarFile);
        emit('updateSuccess', res.avatarUrl);
        message.success($t('profile.msg.avatarUploadSuccess'));
        showModal.value = false;
      } catch (error) {
        message.error($t('common.messages.uploadFailed', { error }));
      } finally {
        uploading.value = false;
      }
    },
    'image/jpeg',
    0.85,
  );
}
</script>

<template>
  <div
    class="group relative size-20 cursor-pointer overflow-hidden rounded-full border border-secondary shadow-sm"
  >
    <VbenAvatar :src="currentAvatar" class="size-full object-cover" />

    <label
      class="absolute inset-0 flex flex-col items-center justify-center bg-black/50 opacity-0 transition-all duration-300 group-hover:opacity-100"
      for="avatar-input"
    >
      <span class="text-[12px] font-medium text-white">{{
        $t('profile.label.changeAvatar')
      }}</span>
    </label>

    <input
      id="avatar-input"
      type="file"
      accept="image/*"
      class="hidden"
      @change="handleFileChange"
    />

    <div
      v-if="showModal"
      class="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
    >
      <div
        class="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-zinc-900"
      >
        <div class="border-b p-4 text-lg font-bold dark:border-zinc-800">
          {{ $t('profile.crop.title') }}
        </div>

        <div class="relative h-80 w-full bg-zinc-100 dark:bg-zinc-800">
          <Cropper
            ref="cropperRef"
            class="h-full w-full"
            :src="previewImage"
            :stencil-component="CircleStencil"
            :stencil-props="{
              aspectRatio: 1,
            }"
            :auto-zoom="true"
          />
        </div>

        <div class="flex justify-end gap-3 bg-gray-50 p-4 dark:bg-zinc-800/50">
          <button
            @click="showModal = false"
            class="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 dark:text-gray-400"
            :disabled="uploading"
          >
            {{ $t('common.action.cancel') }}
          </button>
          <button
            @click="handleConfirmUpdate"
            :disabled="uploading"
            class="flex items-center justify-center rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
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

<style scoped>
/* vue-advanced-cropper 默认背景，可以根据需要微调 */
:deep(.vue-advanced-cropper__background) {
  background: #18181b;
}
</style>
