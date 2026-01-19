<script lang="ts" setup>
import { nextTick, ref } from 'vue'; // 复用已有的 Schema 定义

import { useVbenDrawer } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import { getDetailUser } from '#/api';
import { $t } from '#/locales';

import { useFormSchema, useFormSchemaRemovePreview } from '../data';

const loadingData = ref(false);

const [Form, formApi] = useVbenForm({
  // 直接复用 form.vue 的 schema，保持数据定义唯一
  schema: useFormSchema(),
  // 关键：设为只读模式, UI 会自动从输入框变为展示文本
  commonConfig: {
    // disabled: true,
    wrapperClass: 'pointer-events-none opacity-60', // 不可点击
  },
  showDefaultActions: false,
});

const [Drawer, drawerApi] = useVbenDrawer({
  async onOpenChange(isOpen) {
    if (isOpen) {
      await formApi.removeSchemaByFields(useFormSchemaRemovePreview());
      await nextTick();

      const id = drawerApi.getData<any>().id;
      await loadDetail(id);
    }
  },
});

// for get detail, load data & update value.
async function loadDetail(userId: number) {
  loadingData.value = true;
  try {
    // load data
    const { user, roleNames, deptNames } = await getDetailUser(userId);

    // 填充数据
    await formApi.setValues(user);
    if (roleNames && roleNames.length > 0)
      await formApi.setFieldValue('roleCodes', roleNames);
    if (deptNames && deptNames.length > 0)
      await formApi.setFieldValue('deptIds', deptNames);
  } finally {
    loadingData.value = false;
  }
}
</script>

<template>
  <Drawer
    :title="`${$t('system.user.module')} ${$t('common.previewDetail')}`"
    :cancel-text="$t('common.action.close')"
    :show-confirm-button="false"
  >
    <div class="p-4">
      <Form />
    </div>
  </Drawer>
</template>
