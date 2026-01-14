<script lang="ts" setup>
import { Page } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { loadMemAll } from '#/api/system/mem';

const [BaseForm] = useVbenForm({
  submitButtonOptions: {
    content: $t('system.mem.btnLoadAll'),
  },
  handleSubmit: onSubmit,
  resetButtonOptions: {
    show: false,
  },
  layout: 'horizontal',
  schema: [],
});

async function onSubmit(values: Record<string, any>) {
  await loadMemAll(values);
  message.success($t('system.mem.loadSuccess'));
  // 失败时 (e.g http 500), 自动从 显示错误提示 (result.message);
}
</script>
<template>
  <Page auto-content-height>
    <BaseForm />
  </Page>
</template>
<style scoped></style>
