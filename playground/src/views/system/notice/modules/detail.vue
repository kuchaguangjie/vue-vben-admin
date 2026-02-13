<script lang="ts" setup>
import type { DataNode } from 'ant-design-vue/es/tree';

import type { Recordable } from '@vben-core/typings';

import { nextTick, ref } from 'vue'; // 复用已有的 Schema 定义

import { Tree, useVbenDrawer } from '@vben/common-ui';
import { IconifyIcon } from '@vben/icons';

import {
  Col,
  Row,
  Spin,
  Statistic,
  Table,
  Tabs,
  Typography,
} from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { getDetailNotice } from '#/api';
import { $t } from '#/locales';

import { formFieldsToRemoveForPreview, useFormSchema } from '../data';

const TabPane = Tabs.TabPane;
const Text = Typography.Text;

const loadingData = ref(false);

const menuOptions = ref<DataNode[]>([]);
const apiOptions = ref<DataNode[]>([]);

const du = ref<any>({});
const effectDu = ref<any>({});

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
  destroyOnClose: true,
  async onOpenChange(isOpen) {
    if (isOpen) {
      await formApi.removeSchemaByFields(formFieldsToRemoveForPreview());
      await nextTick();

      const id = drawerApi.getData<any>().id;
      await loadDetail(id);
    }
  },
});

// for get detail, load data & update value.
async function loadDetail(noticeId: number) {
  loadingData.value = true;
  try {
    // load data
    const {
      notice,
      inheritCodes,
      menuTreeWithChosen,
      apiTreeWithChosen,
      detailedUsage,
      effectDetailedUsage,
    } = await getDetailNotice(noticeId);

    du.value = detailedUsage;
    effectDu.value = effectDetailedUsage;

    // 填充 数据 - form
    await formApi.setValues(notice);
    if (inheritCodes && inheritCodes.length > 0)
      await formApi.setFieldValue('noticeCodes', inheritCodes);

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

// 角色列定义
const noticeColumns = [
  { title: $t('common.id'), dataIndex: 'id', width: 80 },
  { title: $t('system.notice.title'), dataIndex: 'title' },
  { title: $t('system.notice.code'), dataIndex: 'code' },
];

// 部门列定义
const deptColumns = [
  { title: $t('system.dept.id'), dataIndex: 'id', width: 100 },
  { title: $t('system.dept.name'), dataIndex: 'name' },
];

// 用户列定义
const userColumns = [
  { title: $t('system.user.id'), dataIndex: 'id', width: 80 },
  { title: $t('system.user.nick'), dataIndex: 'nick' },
  { title: $t('system.user.username'), dataIndex: 'username' },
];
</script>

<template>
  <Drawer
    :title="`${$t('system.notice.module')} ${$t('common.previewDetail')}`"
    :cancel-text="$t('common.action.close')"
    :show-confirm-button="false"
  >
    <div class="h-full p-4">
      <Tabs default-active-key="1" class="vben-tabs-card">
        <TabPane key="1" :tab="$t('system.notice.detail.tabBasic')">
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
        <TabPane key="2" :tab="$t('system.notice.detail.tabUsage')">
          <div class="p-4">
            <div class="mb-6 border-b border-gray-700 pb-4">
              <Row :gutter="16">
                <Col :span="8">
                  <Statistic
                    :title="$t('system.notice.detail.statChildrenNoticeCount')"
                    :value="du?.childrenNotices?.length || 0"
                    :value-style="{ color: '#3f51b5' }"
                  />
                </Col>
                <Col :span="8">
                  <Statistic
                    :title="$t('system.notice.detail.statDeptCount')"
                    :value="du?.depts?.length || 0"
                    :value-style="{ color: '#009688' }"
                  />
                </Col>
                <Col :span="8">
                  <Statistic
                    :title="$t('system.notice.detail.statUserCount')"
                    :value="du?.users?.length || 0"
                    :value-style="{ color: '#ff9800' }"
                  />
                </Col>
              </Row>
            </div>

            <Tabs
              tab-position="left"
              default-active-key="2-1"
              class="inner-usage-tabs"
            >
              <TabPane key="2-1" :tab="$t('system.notice.detail.subTabNotice')">
                <div class="pl-4">
                  <Table
                    size="small"
                    :pagination="false"
                    :columns="noticeColumns"
                    :data-source="du?.childrenNotices"
                  >
                    <template #bodyCell="{ column, record }">
                      <template v-if="column.dataIndex === 'code'">
                        <Text code copyable>{{ record.code }}</Text>
                      </template>
                    </template>
                  </Table>
                </div>
              </TabPane>

              <TabPane key="2-2" :tab="$t('system.notice.detail.subTabDept')">
                <div class="pl-4">
                  <Table
                    size="small"
                    :pagination="false"
                    :columns="deptColumns"
                    :data-source="du?.depts"
                  />
                </div>
              </TabPane>

              <TabPane key="2-3" :tab="$t('system.notice.detail.subTabUser')">
                <div class="pl-4">
                  <Table
                    size="small"
                    :pagination="false"
                    :columns="userColumns"
                    :data-source="du?.users"
                  />
                </div>
              </TabPane>
            </Tabs>
          </div>
        </TabPane>
        <TabPane key="3" :tab="$t('system.notice.detail.tabEffectUsage')">
          <div class="p-4">
            <div class="mb-6 border-b border-gray-700 pb-4">
              <Row :gutter="16">
                <Col :span="8">
                  <Statistic
                    :title="$t('system.notice.detail.statChildrenNoticeCount')"
                    :value="effectDu?.childrenNotices?.length || 0"
                    :value-style="{ color: '#3f51b5' }"
                  />
                </Col>
                <Col :span="8">
                  <Statistic
                    :title="$t('system.notice.detail.statDeptCount')"
                    :value="effectDu?.depts?.length || 0"
                    :value-style="{ color: '#009688' }"
                  />
                </Col>
                <Col :span="8">
                  <Statistic
                    :title="$t('system.notice.detail.statUserCount')"
                    :value="effectDu?.users?.length || 0"
                    :value-style="{ color: '#ff9800' }"
                  />
                </Col>
              </Row>
            </div>

            <Tabs
              tab-position="right"
              default-active-key="3-1"
              class="inner-usage-tabs"
            >
              <TabPane key="3-1" :tab="$t('system.notice.detail.subTabNotice')">
                <div class="pl-4">
                  <Table
                    size="small"
                    :pagination="false"
                    :columns="noticeColumns"
                    :data-source="effectDu?.childrenNotices"
                  >
                    <template #bodyCell="{ column, record }">
                      <template v-if="column.dataIndex === 'code'">
                        <Text code copyable>{{ record.code }}</Text>
                      </template>
                    </template>
                  </Table>
                </div>
              </TabPane>

              <TabPane key="3-2" :tab="$t('system.notice.detail.subTabDept')">
                <div class="pl-4">
                  <Table
                    size="small"
                    :pagination="false"
                    :columns="deptColumns"
                    :data-source="effectDu?.depts"
                  />
                </div>
              </TabPane>

              <TabPane key="3-3" :tab="$t('system.notice.detail.subTabUser')">
                <div class="pl-4">
                  <Table
                    size="small"
                    :pagination="false"
                    :columns="userColumns"
                    :data-source="effectDu?.users"
                  />
                </div>
              </TabPane>
            </Tabs>
          </div>
        </TabPane>
      </Tabs>
    </div>
  </Drawer>
</template>
<style scoped></style>
