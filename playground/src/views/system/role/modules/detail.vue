<script lang="ts" setup>
import type { DataNode } from 'ant-design-vue/es/tree';

import type { Recordable } from '@vben-core/typings';

import { nextTick, ref } from 'vue'; // 复用已有的 Schema 定义
import { Tree, useVbenDrawer } from '@vben/common-ui';
import { IconifyIcon } from '@vben/icons';

import { Spin, Tabs } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { getDetailRole } from '#/api';
import { $t } from '#/locales';

import { useFormSchema, useFormSchemaRemovePreview } from '../data';

const TabPane = Tabs.TabPane;

const loadingData = ref(false);

const menuOptions = ref<DataNode[]>([]);
const apiOptions = ref<DataNode[]>([]);

const roleUsage = ref<any>({});
const roleEffectUsage = ref<any>({});

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
    const {
      role,
      inheritCodes,
      menuTreeWithChosen,
      apiTreeWithChosen,
      usage,
      effectUsage,
    } = await getDetailRole(roleId);

    roleUsage.value = usage;
    roleEffectUsage.value = effectUsage;

    // 填充 数据 - form
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
    <div class="h-full p-4">
      <Tabs default-active-key="1" class="vben-tabs-card">
        <TabPane key="1" tab="Form">
          <div class="pt-4">
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
                      <IconifyIcon
                        v-if="value.meta.icon"
                        :icon="value.meta.icon"
                      />
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
        </TabPane>

        <TabPane key="2" tab="Usage">
          <div class="pt-4">
            <Tabs
              tab-position="left"
              default-active-key="2-0"
              class="inner-usage-tabs"
            >
              <TabPane key="2-0" tab="统计 overview">
                <div class="px-4">
                  <div>
                    直接 子角色数: {{ roleUsage?.childrenRoleNames?.length }}
                  </div>
                  <div>直接 部门数: {{ roleUsage?.deptIds?.length }}</div>
                  <div>直接 用户数: {{ roleUsage?.userIds?.length }}</div>
                </div>
              </TabPane>
              <TabPane key="2-1" tab="Children Role">
                <li v-for="rn in roleUsage?.childrenRoleNames" :key="rn">
                  {{ rn }}
                </li>
              </TabPane>
              <TabPane key="2-2" tab="Department">
                <li v-for="deptId in roleUsage?.deptIds" :key="deptId">
                  {{ deptId }}
                </li>
              </TabPane>
              <TabPane key="2-3" tab="User">
                <li v-for="userId in roleUsage?.userIds" :key="userId">
                  {{ userId }}
                </li>
              </TabPane>
            </Tabs>
          </div>
        </TabPane>
        <TabPane key="3" tab="Effect Usage">
          <div class="pt-4">
            <Tabs
              tab-position="right"
              default-active-key="3-0"
              class="inner-usage-tabs"
            >
              <TabPane key="3-0" tab="统计 overview">
                <div class="px-4">这里显示 Effective usage 统计</div>
              </TabPane>
              <TabPane key="3-1" tab="Children Role">
                <div class="px-4">这里显示 Effective Children Role 的数据</div>
              </TabPane>
              <TabPane key="3-2" tab="Department">
                <div class="px-4">这里显示 Effective Dept 的关联信息</div>
              </TabPane>
              <TabPane key="3-3" tab="User">
                <div class="px-4">这里显示关联的 Effective User 列表</div>
              </TabPane>
            </Tabs>
          </div>
        </TabPane>
      </Tabs>
    </div>
  </Drawer>
</template>
<style scoped>
/* 如果希望 Tab 占满高度，可以微调样式 */
:deep(.ant-tabs-content) {
  height: 100%;
}

/* 针对嵌套 Tabs 的微调，让左侧边栏更有质感 */
:deep(.inner-usage-tabs .ant-tabs-nav) {
  min-width: 120px;
}

:deep(.ant-tabs-tabpane) {
  padding-left: 8px;
}
</style>
