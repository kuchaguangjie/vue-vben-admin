<script lang="ts" setup>
import type { DataNode } from 'ant-design-vue/es/tree';

import type { SystemNoticeApi } from '#/api/system/notice';

import { computed, nextTick, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { useVbenForm } from '#/adapter/form';
import {
  createNotice,
  preCreateNotice,
  preUpdateNotice,
  updateNotice,
} from '#/api/system/notice';
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

const menuOptions = ref<DataNode[]>([]);
const apiOptions = ref<DataNode[]>([]);

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
        await loadForUpdate(data.id, data.code); // load data, for update
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
    const { notices, menuRoots, apiRoots } = await preCreateNotice();

    // set data - notice
    updateSchemaForNotice(notices);

    // set data - menu
    menuOptions.value = menuRoots as unknown as DataNode[];

    // set data - api
    apiOptions.value = apiRoots as unknown as DataNode[];
  } finally {
    loadingData.value = false;
  }
}

// for edit, load data & update form value.
async function loadForUpdate(id: number, code: string) {
  loadingData.value = true;
  try {
    // load data
    const { notices, inheritCodes, menuTreeWithChosen, apiTreeWithChosen } =
      await preUpdateNotice(id);

    // set data - notice
    updateSchemaForNotice(notices, code);
    await nextTick();
    if (inheritCodes && inheritCodes.length > 0)
      await formApi.setFieldValue('noticeCodes', inheritCodes); // 选中 继承的角色

    // set data - menu
    const { roots: menuRoots, chosenIds: menuChosenIds } = menuTreeWithChosen;
    menuOptions.value = menuRoots as unknown as DataNode[];
    await nextTick();
    await formApi.setFieldValue('permissions', menuChosenIds); // 选中 已有的 menu

    // set data - api
    const { roots: apiRoots, chosenIds: apiChosenIds } = apiTreeWithChosen;
    apiOptions.value = apiRoots as unknown as DataNode[];
    await nextTick();
    await formApi.setFieldValue('apis', apiChosenIds); // 选中 已有的 api
  } finally {
    loadingData.value = false;
  }
}

/**
 * update schema
 * @param notices all notices
 * @param code current notice's code, for create it's not provided.
 */
function updateSchemaForNotice(notices: any, code?: string) {
  // 角色选项
  const noticeOptions = notices.map((notice: any) => ({
    label: notice.name,
    value: notice.code,
    disabled: notice.code === code, // 不可选中自己
  }));

  // 动态更新表单字段的选项
  formApi.updateSchema([
    {
      fieldName: 'noticeCodes',
      component: 'TreeSelect',
      label: $t('system.notice.setInheritNotices'),
      componentProps: {
        treeData: noticeOptions,
        allowClear: true,
        class: 'w-full',
        multiple: true, // 启用多选
        treeCheckable: true,
        showCheckedStrategy: 'SHOW_CHILD',
        treeCheckStrictly: true, // 上/下 不关联, 可独立选择
        treeDefaultExpandAll: true, // 默认展开所有
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
