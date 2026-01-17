<script lang="ts" setup>
import type { DataNode } from 'ant-design-vue/es/tree';

import type { Recordable } from '@vben-core/typings';

import { nextTick, ref } from 'vue'; // 复用已有的 Schema 定义

import { Tree, useVbenDrawer } from '@vben/common-ui';
import { IconifyIcon } from '@vben/icons';

import { Spin } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { getDetailRole } from '#/api';
import { $t } from '#/locales';

import { useFormSchema, useFormSchemaRemovePreview } from '../data';

const loadingData = ref(false);

const menuOptions = ref<DataNode[]>([]);
const apiOptions = ref<DataNode[]>([]);

const [Form, formApi] = useVbenForm({
  // 直接复用 form.vue 的 schema，保持数据定义唯一
  schema: useFormSchema(),
  // 关键：设为只读模式, UI 会自动从输入框变为展示文本
  commonConfig: {
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
async function loadDetail(roleId: number) {
  loadingData.value = true;
  try {
    // load data
    const { role, inheritCodes, menuTreeWithChosen, apiTreeWithChosen } =
      await getDetailRole(roleId);

    // 填充数据
    // TODO
    await formApi.setValues(role);
    if (inheritCodes && inheritCodes.length > 0)
      await formApi.setFieldValue('roleCodes', inheritCodes);

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

function getNodeClass(node: Recordable<any>) {
  const classes: string[] = [];
  if (node.value?.type === 'button') {
    classes.push('inline-flex');
  }

  return classes.join(' ');
}
</script>

<template>
  <Drawer
    :title="`${$t('system.role.module')} ${$t('common.previewDetail')}`"
    :cancel-text="$t('common.action.close')"
    :show-confirm-button="false"
  >
    <div class="p-4">
      <Form>
        <template #permissions="slotProps">
          <Spin :spinning="loadingData" wrapper-class-name="w-full">
            <Tree
              :tree-data="menuOptions"
              multiple
              bordered
              :default-expanded-level="2"
              :get-node-class="getNodeClass"
              v-bind="slotProps"
              value-field="id"
              label-field="meta.title"
              icon-field="meta.icon"
            >
              <template #node="{ value }">
                <IconifyIcon v-if="value.meta.icon" :icon="value.meta.icon" />
                {{ $t(value.meta.title) }}
              </template>
            </Tree>
          </Spin>
        </template>
        <template #apis="slotProps">
          <Spin :spinning="loadingData" wrapper-class-name="w-full">
            <Tree
              :tree-data="apiOptions"
              multiple
              bordered
              :default-expanded-level="2"
              :get-node-class="getNodeClass"
              v-bind="slotProps"
              value-field="id"
            >
              <template #node="{ value }">
                {{ $t(value.path) }} ({{ $t(value.action) }})
              </template>
            </Tree>
          </Spin>
        </template>
      </Form>
    </div>
  </Drawer>
</template>
