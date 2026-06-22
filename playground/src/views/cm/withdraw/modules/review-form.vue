<script lang="ts" setup>
import type { CmUserWithdrawApi } from '#/api/cm';

import { nextTick, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import { reviewUserWithdraw } from '#/api/cm';
import { $t } from '#/locales';

import { formatChannelInfo, useReviewFormSchema } from '../data';

const emits = defineEmits(['success']);

const withdrawData = ref<CmUserWithdrawApi.UserWithdraw>();

const [Form, formApi] = useVbenForm({
  schema: useReviewFormSchema(),
  showDefaultActions: false,
});

const [Drawer, drawerApi] = useVbenDrawer({
  destroyOnClose: true,
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;

    const values = await formApi.getValues();

    drawerApi.lock();
    reviewUserWithdraw({
      id: withdrawData.value!.id,
      pass: values.pass as boolean,
      remark: (values.remark as string) || '',
    })
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
      const data = drawerApi.getData<CmUserWithdrawApi.UserWithdraw>();
      withdrawData.value = data;
      await formApi.resetForm();
      await nextTick();
    }
  },
});
</script>

<template>
  <Drawer :title="$t('cm.userWithdraw.review')">
    <div v-if="withdrawData" class="mb-4 space-y-2">
      <p>
        <strong>{{ $t('cm.userWithdraw.withdrawNo') }}:</strong>
        {{ withdrawData.withdrawNo }}
      </p>
      <p>
        <strong>{{ $t('cm.userWithdraw.userName') }}:</strong>
        {{ withdrawData.userName }}
      </p>
      <p>
        <strong>{{ $t('cm.userWithdraw.withdrawAmount') }}:</strong>
        {{ withdrawData.withdrawAmount.toFixed(2) }}
      </p>
      <p>
        <strong>{{ $t('cm.userWithdraw.payChannel') }}:</strong>
        {{ withdrawData.payChannel }}
      </p>
      <p>
        <strong>{{ $t('cm.userWithdraw.receivingAccount') }}:</strong>
        {{ formatChannelInfo(withdrawData) }}
      </p>
    </div>
    <Form />
  </Drawer>
</template>
