<script lang="ts" setup>
import type { SystemWsApi } from '#/api/system/ws';

import { computed, onMounted, ref } from 'vue';

import { Page, VbenButton } from '@vben/common-ui';

import {
  Card,
  Col,
  Descriptions,
  InputNumber,
  message,
  Row,
  Statistic,
  Table,
  Tabs,
  Tag,
} from 'ant-design-vue';

import { getWsStat } from '#/api/system/ws';
import { $t } from '#/locales';
import { formatBackendTime } from '#/utils/value-format';

const displayData = ref<null | SystemWsApi.SystemWsStat>(null);
const loading = ref(false);
const filterTenantId = ref<number | undefined>();
const activeTab = ref('global');

onMounted(() => {
  handleStat();
});

async function handleStat(showSuccess: boolean = false) {
  try {
    loading.value = true;
    displayData.value = await getWsStat({ tenantId: filterTenantId.value });
    if (showSuccess) message.success($t('common.messages.success'));
  } finally {
    loading.value = false;
  }
}

const tenantStatsList = computed(() => {
  const stats = displayData.value?.stat?.tenantStats;
  if (!stats) return [];
  return Object.values(stats);
});

const columns = [
  {
    title: $t('system.ws.stat.tenantId'),
    dataIndex: 'tenantId',
    key: 'tenantId',
    width: 150,
    render: (val: number) => (val === 0 ? $t('common.platform') : val),
  },
  {
    title: $t('system.ws.stat.connCount'),
    dataIndex: 'connCount',
    key: 'connCount',
    width: 150,
    align: 'right',
  },
  {
    title: $t('system.ws.stat.userCount'),
    dataIndex: 'userCount',
    key: 'userCount',
    width: 150,
    align: 'right',
  },
  {
    title: $t('system.ws.stat.sidCount'),
    dataIndex: 'sidCount',
    key: 'sidCount',
    width: 150,
    align: 'right',
  },
];
</script>

<template>
  <Page auto-content-height>
    <div class="flex w-full items-center justify-between p-4">
      <div class="flex items-center gap-2">
        <span class="text-lg font-bold">{{ $t('system.ws.title') }}</span>
        <Tag v-if="displayData" color="blue">
          {{ $t('common.statAt') }}: {{ formatBackendTime(displayData.statAt) }}
        </Tag>
      </div>
      <VbenButton :loading="loading" type="primary" @click="handleStat(true)">
        {{ $t('system.ws.btnGetStat') }}
      </VbenButton>
    </div>

    <div v-if="displayData" class="p-4 pt-0">
      <Tabs v-model:active-key="activeTab">
        <Tabs.TabPane :tab="$t('system.ws.section.global')" key="global">
          <Card :title="$t('system.ws.section.stat')" class="mb-4 shadow-sm">
            <Row :gutter="16">
              <Col :span="5">
                <Statistic
                  :title="$t('system.ws.stat.instanceCount')"
                  :value="displayData.stat?.instanceCount"
                  class="text-center"
                />
              </Col>
              <Col :span="5">
                <Statistic
                  :title="$t('system.ws.stat.connCount')"
                  :value="displayData.stat?.connCount"
                  class="text-center"
                />
              </Col>
              <Col :span="5">
                <Statistic
                  :title="$t('system.ws.stat.sidCount')"
                  :value="displayData.stat?.sidCount"
                  class="text-center"
                />
              </Col>
              <Col :span="5" v-if="!displayData.config.isCluster">
                <Statistic
                  :title="$t('system.ws.stat.userCount')"
                  :value="displayData.stat?.userCount"
                  class="text-center"
                />
              </Col>
            </Row>
          </Card>

          <Card :title="$t('system.ws.section.config')" class="shadow-sm">
            <Descriptions bordered :column="1" size="small">
              <Descriptions.Item :label="$t('system.ws.config.isCluster')">
                <span class="font-medium">{{
                  displayData.config.isCluster
                    ? $t('common.enableStatus.enabled')
                    : $t('common.enableStatus.disabled')
                }}</span>
              </Descriptions.Item>
              <Descriptions.Item :label="$t('system.ws.config.maxConnPerSid')">
                <span class="font-medium">{{
                  displayData.config.isCluster
                    ? 1
                    : displayData.config.maxConnPerSid
                }}</span>
              </Descriptions.Item>

              <Descriptions.Item>
                <template #label>
                  <div class="flex items-center gap-2">
                    <span>{{ $t('system.ws.config.rateLimit.title') }}</span>
                    <Tag
                      :color="
                        displayData.config?.rateLimit.enable
                          ? 'success'
                          : 'error'
                      "
                      class="status-tag"
                    >
                      <span class="status-dot"></span>
                      {{
                        displayData.config?.rateLimit.enable
                          ? $t('common.enableStatus.enabled')
                          : $t('common.enableStatus.disabled')
                      }}
                    </Tag>
                  </div>
                </template>

                <div
                  v-if="displayData.config?.rateLimit.enable"
                  class="flex flex-col gap-2"
                >
                  <div class="text-sm">
                    <span class="text-gray-500">
                      {{ $t('system.ws.config.rateLimit.rate') }}:
                    </span>
                    <span class="ml-2 font-mono font-bold text-blue-600">
                      {{ displayData.config.rateLimit.rate }}
                    </span>
                  </div>
                  <div class="text-sm">
                    <span class="text-gray-500">
                      {{ $t('system.ws.config.rateLimit.burst') }}:
                    </span>
                    <span class="ml-2 font-mono font-bold text-blue-600">
                      {{ displayData.config.rateLimit.burst }}
                    </span>
                  </div>
                </div>
                <span v-else class="italic text-gray-400">
                  {{ $t('common.enableStatus.disabled') }}
                </span>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Tabs.TabPane>

        <Tabs.TabPane :tab="$t('system.ws.section.tenantStat')" key="tenant">
          <Card class="mb-4 shadow-sm">
            <div class="flex items-center gap-2">
              <!-- prettier-ignore -->
              <span class="text-sm text-gray-500">{{ $t('system.ws.stat.tenantId') }}:</span>
              <InputNumber
                v-model:value="filterTenantId"
                :placeholder="$t('common.inputPlaceholder')"
                :min="0"
                style="width: 120px"
                @change="handleStat()"
              />
            </div>
          </Card>

          <Card :title="$t('system.ws.section.tenantStat')" class="shadow-sm">
            <Table
              :columns="columns"
              :data-source="tenantStatsList"
              :pagination="{
                pageSize: 20,
                showSizeChanger: true,
                showTotal: (total) => `${total} ${$t('common.items')}`,
              }"
              row-key="tenantId"
              size="small"
              :scroll="{ x: 600 }"
              bordered
            />
          </Card>
        </Tabs.TabPane>
      </Tabs>
    </div>
  </Page>
</template>

<style scoped>
.status-tag {
  display: inline-flex;
  align-items: center;
  padding: 0 8px;
  font-size: 11px;
  font-weight: bold;
  line-height: 1.6;
  border-radius: 12px;
}

.status-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  margin-right: 6px;
  background-color: currentcolor;
  border-radius: 50%;
}
</style>
