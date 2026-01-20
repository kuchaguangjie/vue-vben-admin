<script lang="ts" setup>
import type { SystemDeptApi } from '#/api';

import { nextTick, ref } from 'vue'; // 复用已有的 Schema 定义

import { useVbenDrawer } from '@vben/common-ui';

import { Col, Row, Statistic, Table, Tabs, Typography } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { getDetailDept } from '#/api';
import { $t } from '#/locales';

import { useFormSchema, useFormSchemaRemovePreview } from '../data';

const TabPane = Tabs.TabPane;
const Text = Typography.Text;

const loadingData = ref(false);
const formData = ref<SystemDeptApi.SystemDept>();
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
      // adjust ui fields
      await formApi.removeSchemaByFields(useFormSchemaRemovePreview());
      await nextTick();

      // load data & fill
      const id = drawerApi.getData<any>().id;
      await loadDetail(id);
    }
  },
});

// for get detail, load data & update value.
async function loadDetail(deptId: number) {
  loadingData.value = true;
  try {
    // load data
    const {
      dept,
      parentDeptName,
      roleNames,
      detailedUsage,
      effectDetailedUsage,
    } = await getDetailDept(deptId);

    du.value = detailedUsage;
    effectDu.value = effectDetailedUsage;

    if (dept.pid === 0) dept.pid = undefined; // avoid shown 0 when no pid;
    formData.value = dept;

    // 填充 数据 - form
    await formApi.setValues(dept);
    await formApi.setFieldValue('pid', parentDeptName);
    if (roleNames && roleNames.length > 0)
      await formApi.setFieldValue('roleCodes', roleNames);
  } finally {
    loadingData.value = false;
  }
}

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
    :title="`${$t('system.dept.module')} ${$t('common.previewDetail')}`"
    :cancel-text="$t('common.action.close')"
    :show-confirm-button="false"
  >
    <div class="h-full p-4">
      <Tabs default-active-key="1" class="vben-tabs-card">
        <TabPane key="1" :tab="$t('system.dept.detail.tabBasic')">
          <div class="pt-4">
            <Form />
          </div>
        </TabPane>
        <TabPane key="2" :tab="$t('system.dept.detail.tabUsage')">
          <div class="p-4">
            <div class="mb-6 border-b border-gray-700 pb-4">
              <Row :gutter="16">
                <Col :span="8">
                  <Statistic
                    :title="$t('system.dept.detail.statChildrenDeptCount')"
                    :value="du?.childrenDepts?.length || 0"
                    :value-style="{ color: '#3f51b5' }"
                  />
                </Col>
                <Col :span="8">
                  <Statistic
                    :title="$t('system.dept.detail.statUserCount')"
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
              <TabPane key="2-1" :tab="$t('system.dept.detail.subTabDept')">
                <div class="pl-4">
                  <Table
                    size="small"
                    :pagination="false"
                    :columns="deptColumns"
                    :data-source="du?.childrenDepts"
                  >
                    <template #bodyCell="{ column, record }">
                      <template v-if="column.dataIndex === 'code'">
                        <Text code copyable>{{ record.code }}</Text>
                      </template>
                    </template>
                  </Table>
                </div>
              </TabPane>

              <TabPane key="2-2" :tab="$t('system.dept.detail.subTabUser')">
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
        <TabPane key="3" :tab="$t('system.dept.detail.tabEffectUsage')">
          <div class="p-4">
            <div class="mb-6 border-b border-gray-700 pb-4">
              <Row :gutter="16">
                <Col :span="8">
                  <Statistic
                    :title="$t('system.dept.detail.statChildrenDeptCount')"
                    :value="effectDu?.childrenDepts?.length || 0"
                    :value-style="{ color: '#3f51b5' }"
                  />
                </Col>
                <Col :span="8">
                  <Statistic
                    :title="$t('system.dept.detail.statUserCount')"
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
              <TabPane key="3-1" :tab="$t('system.dept.detail.subTabDept')">
                <div class="pl-4">
                  <Table
                    size="small"
                    :pagination="false"
                    :columns="deptColumns"
                    :data-source="effectDu?.childrenDepts"
                  >
                    <template #bodyCell="{ column, record }">
                      <template v-if="column.dataIndex === 'code'">
                        <Text code copyable>{{ record.code }}</Text>
                      </template>
                    </template>
                  </Table>
                </div>
              </TabPane>

              <TabPane key="3-2" :tab="$t('system.dept.detail.subTabUser')">
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
