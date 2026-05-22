<script lang="ts" setup>
import type { RcRuleGroupApi } from '#/api/rc/rule-group';

import { computed, nextTick, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import { createRcRuleGroup, updateRcRuleGroup } from '#/api/rc/rule-group';
import { $t } from '#/locales';

import { formFieldsToRemoveForCreate, useFormSchema } from '../data';

const emits = defineEmits(['success']);

const formData = ref<RcRuleGroupApi.RcRuleGroup>();

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
    (id.value ? updateRcRuleGroup(id.value, values) : createRcRuleGroup(values))
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
      const data = drawerApi.getData<RcRuleGroupApi.RcRuleGroup>();
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
    ? $t('ui.actionTitle.edit', [$t('rc.ruleGroup.moduleShort')])
    : $t('ui.actionTitle.create', [$t('rc.ruleGroup.moduleShort')]);
});
</script>

<template>
  <Drawer :title="getDrawerTitle">
    <Form />
  </Drawer>
</template>

<style lang="css" scoped></style>
