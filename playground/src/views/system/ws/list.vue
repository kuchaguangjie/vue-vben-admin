<script lang="ts" setup>
import type { SystemWsApi } from '#/api/system/ws';

import { onMounted, ref } from 'vue';

import { Page, VbenButton } from '@vben/common-ui';
import { $t } from '@vben/locales';

import {
  Card,
  Col,
  Descriptions,
  message,
  Row,
  Statistic,
  Tag,
} from 'ant-design-vue';

import { getWsStat } from '#/api/system/ws';
import { formatBackendTime } from '#/utils/value-format';

const displayData = ref<null | SystemWsApi.SystemWsStat>(null);
const loading = ref(false);

onMounted(() => {
  handleStat();
});

async function handleStat(showSuccess: boolean = false) {
  try {
    loading.value = true;
    displayData.value = await getWsStat();
    if (showSuccess) message.success($t('common.messages.success'));
  } finally {
    loading.value = false;
  }
}
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
                <span>{{
                  $t('system.ws.config.rateLimit.title') || 'Rate Limit'
                }}</span>
                <Tag
                  :color="
                    displayData.config?.rateLimit.enable ? 'success' : 'error'
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
    </div>
  </Page>
</template>

<style scoped>
/* 状态标签自定义样式 */
.status-tag {
  display: inline-flex;
  align-items: center;
  padding: 0 8px;
  font-size: 11px; /* 字体稍微小点 */
  font-weight: bold;
  line-height: 1.6;
  border-radius: 12px; /* 圆角矩形 */
}

/* 状态小圆点 */
.status-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  margin-right: 6px;
  background-color: currentcolor;
  border-radius: 50%;
}
</style>
