<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { $t } from '@vben/locales';

import { Button } from '@vben-core/shadcn-ui';

import { message } from 'ant-design-vue';

import { deleteUserSessionApi, getUserSessionsApi } from '#/api';
import { confirmDialog } from '#/utils/dialog';
import { formatBackendTime } from '#/utils/value-format';

const userSessionsRef = ref();

onMounted(loadUserSessions);

async function loadUserSessions() {
  const data = await getUserSessionsApi();
  userSessionsRef.value = data?.sessionInfos;
}

async function handleDelete(sid: string) {
  await confirmDialog(`要删除会话 ${sid} 吗？`, `删除会话`);
  await deleteUserSessionApi(sid);
  await loadUserSessions(); // 刷新
  message.success($t('common.messages.success'));
}
</script>
<template>
  <h1>User sessions</h1>
  <div>
    <div v-for="(si, i) in userSessionsRef" :key="i">
      {{
        `(${i}) [${si.sid}]: ${si.os}, ${si.browser}, ${si.ip}, ${formatBackendTime(si.createdAt)}`
      }}
      <span v-if="si.isCurrent">(current)</span>
      <span v-else><Button @click="handleDelete(si.sid)">Delete</Button></span>
    </div>
  </div>
</template>
