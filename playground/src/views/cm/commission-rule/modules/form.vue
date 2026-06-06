<script lang="ts" setup>
import type { CmCommissionRuleApi } from '#/api/cm/commission-rule';

import { computed, nextTick, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import {
  createCmCommissionRule,
  updateCmCommissionRule,
} from '#/api/cm/commission-rule';
import { $t } from '#/locales';

import { useFormSchema } from '../data';

const emits = defineEmits(['success']);

const formData = ref<CmCommissionRuleApi.CmCommissionRule>();

const [Form, formApi] = useVbenForm({
  schema: useFormSchema(),
  showDefaultActions: false,
});

const id = ref<number | undefined>();
const [Drawer, drawerApi] = useVbenDrawer({
  destroyOnClose: true,
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;

    const values = await formApi.getValues();

    drawerApi.lock();
    (id.value
      ? updateCmCommissionRule(id.value, {
          id: id.value,
          sceneKey: values.sceneKey as string,
          totalRate: values.totalRate as number,
          userLevel1Rate: values.userLevel1Rate as number,
          userLevel2Rate: values.userLevel2Rate as number,
          userLevel3Rate: values.userLevel3Rate as number,
          userMaxLevel: values.userMaxLevel as number,
          tenantLevel1Rate: values.tenantLevel1Rate as number,
          tenantMaxLevel: values.tenantMaxLevel as number,
          maxAmount: values.maxAmount as number,
          status: values.status as number,
          remark: values.remark as string,
        })
      : createCmCommissionRule({
          sceneKey: values.sceneKey as string,
          totalRate: values.totalRate as number,
          userLevel1Rate: values.userLevel1Rate as number,
          userLevel2Rate: values.userLevel2Rate as number,
          userLevel3Rate: values.userLevel3Rate as number,
          userMaxLevel: values.userMaxLevel as number,
          tenantLevel1Rate: values.tenantLevel1Rate as number,
          tenantMaxLevel: values.tenantMaxLevel as number,
          maxAmount: values.maxAmount as number,
          status: values.status as number,
          remark: values.remark as string,
        })
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
      const data = drawerApi.getData<CmCommissionRuleApi.CmCommissionRule>();
      await formApi.resetForm();

      const isEdit = data && data.id;
      if (isEdit) {
        formData.value = data;
        id.value = data.id;
      } else {
        id.value = undefined;
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
    ? $t('ui.actionTitle.edit', [$t('cm.commissionRule.moduleShort')])
    : $t('ui.actionTitle.create', [$t('cm.commissionRule.moduleShort')]);
});
</script>

<template>
  <Drawer :title="getDrawerTitle">
    <Form />
  </Drawer>
</template>
