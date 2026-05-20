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
const showApiKeyText = ref(false);

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
      message.success($t('ui.actionMessage.createSuccess'));
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
      showApiKeyText.value = false;
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
  message.success('已复制');
}

function toggleShowApiKey() {
  showApiKeyText.value = !showApiKeyText.value;
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
          <div class="relative flex-1">
            <input
              :type="showApiKeyText ? 'text' : 'password'"
              :value="apiKey"
              readonly
              class="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 pr-16 text-gray-800"
            />
            <button
              type="button"
              class="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-500 hover:text-gray-700"
              @click="toggleShowApiKey"
            >
              {{ showApiKeyText ? '隐藏' : '显示' }}
            </button>
          </div>
          <button
            type="button"
            class="rounded-md bg-primary px-4 py-2 text-white"
            @click="copyApiKey"
          >
            {{ $t('common.messages.copy') }}
          </button>
        </div>
        <div class="mt-2 text-sm text-warning">
          {{ $t('system.apiKey.copyWarning') }}
        </div>
      </div>
    </div>
  </Drawer>
</template>
