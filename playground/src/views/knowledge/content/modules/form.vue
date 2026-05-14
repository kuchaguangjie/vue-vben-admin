<script lang="ts" setup>
import type { KnowledgeContentApi } from '#/api';

import { computed, nextTick, ref, watch } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import { createKnowledgeContent, updateKnowledgeContent } from '#/api';
import { $t } from '#/locales';

import { formFieldsToRemoveForCreate, useFormSchema } from '../data';

const emits = defineEmits(['success']);

const formData = ref<KnowledgeContentApi.KnowledgeContent>();

const [Form, formApi] = useVbenForm({
  schema: useFormSchema(),
  showDefaultActions: false,
});

const id = ref();
const currentFormat = ref<string>('md');

function formatJson(content: string): string {
  try {
    const parsed = JSON.parse(content);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return content;
  }
}

function formatYaml(content: string): string {
  const lines = content.split('\n');
  const formatted: string[] = [];
  let indentLevel = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      formatted.push('');
      continue;
    }

    if (trimmed.startsWith('- ')) {
      if (formatted.length > 0) {
        const prevLine = formatted[formatted.length - 1];
        if (prevLine.trim() && !prevLine.trim().startsWith('- ')) {
          indentLevel = Math.max(0, indentLevel);
        }
      }
      formatted.push('  '.repeat(indentLevel) + trimmed);
    } else if (trimmed.includes(':')) {
      if (trimmed.endsWith(':')) {
        formatted.push('  '.repeat(indentLevel) + trimmed);
        indentLevel++;
      } else {
        formatted.push('  '.repeat(indentLevel) + trimmed);
      }
    } else {
      formatted.push('  '.repeat(indentLevel) + line.trim());
    }
  }

  return formatted.join('\n');
}

function formatContentByFormat(content: string, format: string): string {
  if (!content) return content;

  switch (format) {
    case 'json': {
      return formatJson(content);
    }
    case 'yaml': {
      return formatYaml(content);
    }
    default: {
      return content;
    }
  }
}

async function handleFormatChange(newFormat: string) {
  currentFormat.value = newFormat;

  const values = await formApi.getValues();
  if (values.content) {
    const formattedContent = formatContentByFormat(values.content, newFormat);
    if (formattedContent !== values.content) {
      await formApi.setValues({ content: formattedContent });
    }
  }
}

watch(currentFormat, async (newFormat) => {
  if (newFormat) {
    await handleFormatChange(newFormat);
  }
});

const [Drawer, drawerApi] = useVbenDrawer({
  destroyOnClose: true,
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;

    const values = await formApi.getValues();

    if (values.format === 'json') {
      values.content = formatJson(values.content);
    }

    drawerApi.lock();
    (id.value
      ? updateKnowledgeContent(id.value, values)
      : createKnowledgeContent(values)
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
      const data = drawerApi.getData<KnowledgeContentApi.KnowledgeContent>();
      await formApi.resetForm();

      const isEdit = data && data.id;
      if (isEdit) {
        formData.value = data;
        id.value = data.id;
        currentFormat.value = data.format || 'md';
      } else {
        id.value = undefined;
        currentFormat.value = 'md';
      }

      if (!isEdit) {
        await formApi.removeSchemaByFields(formFieldsToRemoveForCreate());
      }
      await nextTick();

      if (isEdit) {
        const displayData = { ...data };
        if (displayData.format === 'json') {
          displayData.content = formatJson(displayData.content);
        }
        await formApi.setValues(displayData);
      } else {
        await formApi.setValues({ format: 'md', tags: [] });
      }
    }
  },
});

const getDrawerTitle = computed(() => {
  return formData.value?.id
    ? $t('ui.actionTitle.edit', [$t('knowledge.content.moduleShort')])
    : $t('ui.actionTitle.create', [$t('knowledge.content.moduleShort')]);
});
</script>

<template>
  <Drawer :title="getDrawerTitle">
    <Form />
  </Drawer>
</template>

<style lang="css" scoped></style>
