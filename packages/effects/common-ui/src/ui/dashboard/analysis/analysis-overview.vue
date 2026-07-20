<script setup lang="ts">
import type { AnalysisOverviewItem } from '../typing';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  VbenCountToAnimator,
  VbenIcon,
} from '@vben-core/shadcn-ui';

interface Props {
  items?: AnalysisOverviewItem[];
  animate?: boolean;
  loading?: boolean;
}

defineOptions({
  name: 'AnalysisOverview',
});

withDefaults(defineProps<Props>(), {
  items: () => [],
  animate: true,
  loading: false,
});
</script>

<template>
  <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
    <template v-if="loading">
      <Card v-for="i in 4" :key="i" class="w-full">
        <CardHeader>
          <CardTitle
            class="h-5 w-20 animate-pulse rounded bg-gray-200 text-xl dark:bg-gray-700"
          />
        </CardHeader>
        <CardContent class="flex items-center justify-between">
          <span
            class="h-6 w-16 animate-pulse rounded bg-gray-200 text-xl dark:bg-gray-700"
          ></span>
          <span
            class="h-8 w-8 animate-pulse rounded bg-gray-200 dark:bg-gray-700"
          ></span>
        </CardContent>
        <CardFooter class="justify-between">
          <span
            class="h-4 w-12 animate-pulse rounded bg-gray-200 dark:bg-gray-700"
          ></span>
          <span
            class="h-4 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700"
          ></span>
        </CardFooter>
      </Card>
    </template>
    <template v-else v-for="item in items" :key="item.title">
      <Card :title="item.title" class="w-full">
        <CardHeader>
          <CardTitle class="text-xl">{{ item.title }}</CardTitle>
        </CardHeader>

        <CardContent class="flex items-center justify-between">
          <VbenCountToAnimator
            v-if="animate"
            :end-val="item.value"
            :start-val="item.value"
            class="text-xl"
            prefix=""
          />
          <span v-else class="text-xl">{{ item.value }}</span>
          <VbenIcon :icon="item.icon" class="size-8 flex-shrink-0" />
        </CardContent>
        <CardFooter class="justify-between">
          <span>{{ item.totalTitle }}</span>
          <VbenCountToAnimator
            v-if="animate"
            :end-val="item.totalValue"
            :start-val="item.totalValue"
            class="text-xl"
            prefix=""
          />
          <span v-else class="text-xl">{{ item.totalValue }}</span>
        </CardFooter>
      </Card>
    </template>
  </div>
</template>
