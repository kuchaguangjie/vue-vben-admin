<script setup lang="ts">
import { ref } from 'vue';
// 引入核心组件和圆形模板
import { CircleStencil, Cropper } from 'vue-advanced-cropper';
import 'vue-advanced-cropper/dist/style.css';

import { VbenAvatar } from '@vben-core/shadcn-ui';

import { message } from 'ant-design-vue';

import { updateUserAvatarApi } from '#/api';

defineProps<{
  currentAvatar?: string;
}>();

const emit = defineEmits(['updateSuccess']);

const showModal = ref(false);
const previewImage = ref('');
const cropperRef = ref();
const uploading = ref(false);

// 1. 处理文件选择
function handleFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.addEventListener('load', (event) => {
    previewImage.value = event.target?.result as string;
    showModal.value = true;
  });
  reader.readAsDataURL(file);
}

// 2. 核心上传逻辑
async function handleConfirmUpdate() {
  if (!cropperRef.value) return;

  // 获取裁剪结果的 canvas
  const { canvas } = cropperRef.value.getResult();
  if (!canvas) return;

  canvas.toBlob(async (blob: Blob | null) => {
    if (!blob) return;

    try {
      uploading.value = true;
      const formData = new FormData();
      formData.append('file', blob, 'avatar.png');

      // TODO: 这里调用你的单接口 API
      const res = await updateUserAvatarApi(formData);
      emit('updateSuccess', res.avatarUrl);

      message.success('头像已更新');
      showModal.value = false;
    } catch {
      message.error('更新失败');
    } finally {
      uploading.value = false;
    }
  }, 'image/png');
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
      <span class="text-[12px] font-medium text-white">更换头像</span>
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
          裁剪头像
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
            取消
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
            {{ uploading ? '正在保存...' : '确定' }}
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
