<script lang="ts" setup>
import type { KnowledgeCategoryApi } from '#/api/knowledge/category';

import { computed, nextTick, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import {
  createKnowledgeCategory,
  updateKnowledgeCategory,
} from '#/api/knowledge/category';
import { $t } from '#/locales';

import { formFieldsToRemoveForCreate, useFormSchema } from '../data';

const emits = defineEmits(['success']);

const formData = ref<KnowledgeCategoryApi.KnowledgeCategory>();

const [Form, formApi] = useVbenForm({
  schema: useFormSchema(),
  showDefaultActions: false,
});

const id = ref();
const [Drawer, drawerApi] = useVbenDrawer({
  destroyOnClose: true,
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;

    const values = await formApi.getValues();

    drawerApi.lock();
    (id.value
      ? updateKnowledgeCategory(id.value, values)
      : createKnowledgeCategory(values)
    )
      .then(() => {
        emits('success');
        drawerApi.close();
      })
      .catch(() => {
        drawerApi.unlock();
      });
  },

  async onOpenChange(isOpen) {
    if (isOpen) {
      const data = drawerApi.getData<KnowledgeCategoryApi.KnowledgeCategory>();
      await formApi.resetForm();

      const isEdit = data && data.id;
      if (isEdit) {
        formData.value = data;
        id.value = data.id;
      } else {
        id.value = undefined;
      }

      if (!isEdit) {
        await formApi.removeSchemaByFields(formFieldsToRemoveForCreate());
      }
      await nextTick();

      if (isEdit) {
        await formApi.setValues(data);
      }
    }
  },
});

const getDrawerTitle = computed(() => {
  return formData.value?.id
    ? $t('ui.actionTitle.edit', [$t('knowledge.category.moduleShort')])
    : $t('ui.actionTitle.create', [$t('knowledge.category.moduleShort')]);
});
</script>

<template>
  <Drawer :title="getDrawerTitle">
    <Form />
  </Drawer>
</template>

<style lang="css" scoped></style>
