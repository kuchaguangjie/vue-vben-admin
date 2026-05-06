<script lang="ts" setup>
import { nextTick, ref } from 'vue'; // 复用已有的 Schema 定义

import { useVbenDrawer } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import { getNoticeDetail } from '#/api/system/notice';
import { $t } from '#/locales';

import { formFieldsToRemoveForPreview, useFormSchema } from '../data';

const loadingData = ref(false);

const [Form, formApi] = useVbenForm({
  // 直接复用 form.vue 的 schema，保持数据定义唯一
  schema: useFormSchema(),
  // 关键：设为只读模式, UI 会自动从输入框变为展示文本
  commonConfig: {
    wrapperClass: 'pointer-events-none opacity-60', // 不可点击
  },
  showDefaultActions: false,
});

const [Drawer, drawerApi] = useVbenDrawer({
  destroyOnClose: true,
  async onOpenChange(isOpen) {
    if (isOpen) {
      await formApi.removeSchemaByFields(formFieldsToRemoveForPreview());
      await nextTick();

      const data = drawerApi.getData<any>();
      await loadDetail(data.id, data.tenantId);
    }
  },
});

// for get detail, load data & update value.
async function loadDetail(noticeId: number, tenantId?: number) {
  loadingData.value = true;
  try {
    // load data
    const notice = await getNoticeDetail(noticeId, tenantId);

    // 填充 数据 - form
    await formApi.setValues(notice);
  } finally {
    loadingData.value = false;
  }
}
</script>

<template>
  <Drawer
    :title="`${$t('system.notice.moduleShort')} ${$t('common.previewDetail')}`"
    :cancel-text="$t('common.action.close')"
    :show-confirm-button="false"
  >
    <div class="h-full p-4">
      <Form />
    </div>
  </Drawer>
</template>
<style scoped></style>
