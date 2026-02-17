<script lang="ts" setup>
import type { SystemNoticeApi } from '#/api/system/notice';
import {
  createNotice,
  preCreateNotice,
  updateNotice,
} from '#/api/system/notice';

import { computed, nextTick, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import { $t } from '#/locales';
import { extractTreeValue } from '#/utils/value-format';

import {
  formFieldsToAdjustForEdit,
  formFieldsToRemoveForCreate,
  useFormSchema,
} from '../data';

const emits = defineEmits(['success']);

const formData = ref<SystemNoticeApi.SystemNotice>();

const [Form, formApi] = useVbenForm({
  schema: useFormSchema(),
  showDefaultActions: false,
});

const loadingData = ref(false);

const id = ref();
const [Drawer, drawerApi] = useVbenDrawer({
  destroyOnClose: true,
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;

    const values = await formApi.getValues();
    extractTreeValue(values, ['noticeCodes']);

    drawerApi.lock();
    (id.value ? updateNotice(id.value, values) : createNotice(values))
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
      const data = drawerApi.getData<SystemNoticeApi.SystemNotice>();
      await formApi.resetForm();

      // 判断 new / edit 模式
      const isEdit = data && data.id;
      if (isEdit) {
        formData.value = data;
        id.value = data.id;
      } else {
        id.value = undefined;
      }

      // update form fields
      if (isEdit) {
        formApi.updateSchema(formFieldsToAdjustForEdit());
      } else {
        await formApi.removeSchemaByFields(formFieldsToRemoveForCreate());
      }
      // Wait for Vue to flush DOM updates (form fields mounted)
      await nextTick();

      // get data & update field value
      if (isEdit) {
        await formApi.setValues(data);
        await loadForUpdate(); // load data, for update
      } else {
        await loadForCreate(); // load data, for create
      }
    }
  },
});

// for new, load data & update form value.
async function loadForCreate() {
  loadingData.value = true;
  try {
    // load data
    const { categoryList } = await preCreateNotice();

    // set data - notice
    updateSchemaForNotice(categoryList);
  } finally {
    loadingData.value = false;
  }
}

// for edit, load data & update form value.
async function loadForUpdate() {
  return loadForCreate();
}

/**
 * update schema
 */
function updateSchemaForNotice(categoryList: any[]) {
  const categoryOptions = categoryList.map((item: any) => ({
    label: item.name,
    value: item.id,
  }));

  // 动态更新表单字段的选项
  formApi.updateSchema([
    {
      component: 'Select',
      fieldName: 'categoryId',
      label: $t('system.notice.category'),
      rules: 'required',
      // 使用 colProps 确保表单项有足够的宽度，避免缩成一团
      componentProps: {
        multiple: false, // 单选
        style: { width: '90%', minWidth: '100px' },
        allowClear: true,
        showArrow: true,
        options: categoryOptions,
      },
    },
  ]);
}

const getDrawerTitle = computed(() => {
  return formData.value?.id
    ? $t('common.edit', $t('system.notice.moduleShort'))
    : $t('common.create', $t('system.notice.moduleShort'));
});
</script>
<template>
  <Drawer :title="getDrawerTitle">
    <Form />
  </Drawer>
</template>
<style lang="css" scoped></style>
