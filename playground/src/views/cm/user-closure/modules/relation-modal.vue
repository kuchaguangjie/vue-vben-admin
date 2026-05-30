<script lang="ts" setup>
import type { CmUserClosureApi } from '#/api/cm/user-closure';

import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import {
  Avatar,
  Descriptions,
  DescriptionsItem,
  Spin,
  Tag,
} from 'ant-design-vue';

import { getCmUserRelation } from '#/api/cm/user-closure';
import { $t } from '#/locales';

const loading = ref(false);
const relation = ref<CmUserClosureApi.CmUserRelationResp | null>(null);

const [Modal, modalApi] = useVbenModal({
  destroyOnClose: true,
  showConfirmButton: false,
  cancelText: $t('common.close'),
  async onOpenChange(isOpen) {
    if (isOpen) {
      const data = modalApi.getData<{ userId: number }>();
      if (data?.userId) {
        await loadRelation(data.userId);
      }
    }
  },
});

async function loadRelation(userId: number) {
  loading.value = true;
  try {
    relation.value = await getCmUserRelation(userId);
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <Modal :title="$t('cm.userClosure.relationTitle')">
    <Spin :spinning="loading">
      <template v-if="relation">
        <Descriptions :column="1" bordered size="small" class="mb-4">
          <DescriptionsItem :label="$t('cm.userClosure.directParent')">
            <template v-if="relation.directParent">
              <Avatar
                v-if="relation.directParent.avatar"
                :src="relation.directParent.avatar"
                :size="24"
                class="mr-2"
              />
              {{ relation.directParent.nick || relation.directParent.username }}
              <span class="ml-1 text-gray-400">
                (ID: {{ relation.directParent.userId }})
              </span>
            </template>
            <span v-else class="text-gray-400">—</span>
          </DescriptionsItem>
          <DescriptionsItem :label="$t('cm.userClosure.directChildrenCount')">
            {{ relation.directChildren?.length ?? 0 }}
          </DescriptionsItem>
          <DescriptionsItem :label="$t('cm.userClosure.totalDescendants')">
            {{ relation.descendants?.length ?? 0 }}
          </DescriptionsItem>
        </Descriptions>

        <div
          v-if="relation.directChildren && relation.directChildren.length > 0"
        >
          <h4 class="mb-2 font-medium">
            {{ $t('cm.userClosure.directChildren') }}
          </h4>
          <div class="flex flex-wrap gap-2">
            <Tag
              v-for="child in relation.directChildren"
              :key="child.userId"
              color="blue"
            >
              <Avatar
                v-if="child.avatar"
                :src="child.avatar"
                :size="18"
                class="mr-1"
              />
              {{ child.nick || child.username }}
              <span class="ml-1 text-gray-300">(ID: {{ child.userId }})</span>
            </Tag>
          </div>
        </div>

        <div
          v-if="relation.ancestors && relation.ancestors.length > 0"
          class="mt-4"
        >
          <h4 class="mb-2 font-medium">
            {{ $t('cm.userClosure.ancestorChain') }}
          </h4>
          <div class="flex flex-wrap items-center gap-1">
            <template
              v-for="(anc, index) in relation.ancestors"
              :key="anc.userId"
            >
              <Tag :color="anc.distance === 1 ? 'green' : 'default'">
                <Avatar
                  v-if="anc.avatar"
                  :src="anc.avatar"
                  :size="18"
                  class="mr-1"
                />
                {{ anc.nick || anc.username }}
                <span class="ml-1 text-gray-300">
                  ({{ $t('cm.userClosure.levelN', [anc.distance]) }})
                </span>
              </Tag>
              <span
                v-if="index < relation.ancestors.length - 1"
                class="text-gray-400"
              >
                ←
              </span>
            </template>
          </div>
        </div>

        <div
          v-if="relation.descendants && relation.descendants.length > 0"
          class="mt-4"
        >
          <h4 class="mb-2 font-medium">
            {{ $t('cm.userClosure.allDescendants') }}
          </h4>
          <div class="flex flex-wrap gap-2">
            <Tag
              v-for="desc in relation.descendants"
              :key="desc.userId"
              :color="desc.distance === 1 ? 'blue' : 'default'"
            >
              {{ desc.nick || desc.username }}
              <span class="ml-1 text-gray-300">
                ({{ $t('cm.userClosure.levelN', [desc.distance]) }})
              </span>
            </Tag>
          </div>
        </div>

        <div
          v-if="
            (!relation.ancestors || relation.ancestors.length === 0) &&
            (!relation.descendants || relation.descendants.length === 0)
          "
          class="py-4 text-center text-gray-400"
        >
          {{ $t('cm.userClosure.noRelation') }}
        </div>
      </template>
    </Spin>
  </Modal>
</template>
