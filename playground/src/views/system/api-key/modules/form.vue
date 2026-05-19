<script lang="ts" setup>
import type { SystemApiKeyApi } from '#/api';

import { nextTick, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { createApiKey, getBotUserList } from '#/api/system/api-key';
import { $t } from '#/locales';

import { formFieldsToRemoveForCreate, useFormSchema } from '../data';

const emits = defineEmits(['success']);

const apiKey = ref<string>('');
const showApiKey = ref(false);

const [Form, formApi] = useVbenForm({
  schema: useFormSchema(),
  showDefaultActions: false,
});

const [Drawer, drawerApi] = useVbenDrawer({
  destroyOnClose: true,
  async onConfirm() {
    if (showApiKey.value) {
      drawerApi.close();
      return;
    }

    const { valid } = await formApi.validate();
    if (!valid) return;

    const values = await formApi.getValues();

    if (values.expiresAt && values.expiryType === 'custom') {
      values.expiresAt = Math.floor(
        new Date(values.expiresAt).getTime() / 1000,
      );
    }

    drawerApi.lock();
    try {
      const result = await createApiKey(
        values as SystemApiKeyApi.ApiKeyCreateReq,
      );
      apiKey.value = result.key;
      showApiKey.value = true;
      message.success($t('ui.message.createSuccess'));
      emits('success');
    } finally {
      drawerApi.unlock();
    }
  },

  async onOpenChange(isOpen) {
    if (isOpen) {
      await formApi.resetForm();
      await formApi.removeSchemaByFields(formFieldsToRemoveForCreate());
      showApiKey.value = false;
      apiKey.value = '';

      const botUsers = await getBotUserList();
      const userOptions = botUsers.map((user) => ({
        label: user.nick || user.username,
        value: user.id,
      }));
      formApi.updateSchema([
        {
          fieldName: 'userId',
          componentProps: { options: userOptions },
        },
      ]);

      await nextTick();
    }
  },
});

function copyApiKey() {
  navigator.clipboard.writeText(apiKey.value);
  message.success($t('ui.message.copied'));
}
</script>

<template>
  <Drawer
    :title="$t('ui.actionTitle.create', [$t('system.apiKey.moduleShort')])"
  >
    <Form v-if="!showApiKey" />
    <div v-if="showApiKey" class="space-y-4">
      <div class="mb-4 text-success">
        {{ $t('system.apiKey.createSuccessNotice') }}
      </div>
      <div class="form-item">
        <label class="form-label">{{ $t('system.apiKey.apiKey') }}</label>
        <div class="flex items-center gap-2">
          <input
            :value="apiKey"
            readonly
            class="flex-1 rounded-md border bg-gray-50 px-3 py-2"
          />
          <button
            type="button"
            class="rounded-md bg-primary px-4 py-2 text-white"
            @click="copyApiKey"
          >
            {{ $t('ui.action.copy') }}
          </button>
        </div>
        <div class="mt-2 text-sm text-warning">
          {{ $t('system.apiKey.copyWarning') }}
        </div>
      </div>
    </div>
  </Drawer>
</template>
