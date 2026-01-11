<script lang="ts" setup>
import { useVbenDrawer } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import { $t } from '#/locales';

import { useFormSchema } from '../data'; // 复用已有的 Schema 定义

const [Form, formApi] = useVbenForm({
  // 直接复用 form.vue 的 schema，保持数据定义唯一
  schema: useFormSchema(),
  // 关键：设为只读模式, UI 会自动从输入框变为展示文本
  commonConfig: {
    disabled: true,
  },
  showDefaultActions: false,
});

const [Drawer, drawerApi] = useVbenDrawer({
  onOpenChange(isOpen) {
    if (isOpen) {
      const data = drawerApi.getData<any>();
      // 填充数据
      formApi.setValues(data);
    }
  },
});
</script>

<template>
  <Drawer
    :title="`${$t('system.user.name')} ${$t('common.previewDetail')}`"
    :show-confirm-btn="false"
    :cancel-text="$t('common.close')"
  >
    <div class="p-4">
      <Form />
    </div>
  </Drawer>
</template>
