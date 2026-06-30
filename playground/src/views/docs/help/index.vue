<script lang="ts" setup>
import { Page } from '@vben/common-ui';

import { $t } from '#/locales';

defineOptions({ name: 'Help' });
</script>

<template>
  <Page :title="$t('docs.helpTitle')">
    <template #description>
      <p class="mt-3 text-sm leading-6 text-foreground">
        {{ $t('docs.helpDescription') }}
      </p>
    </template>

    <div class="card-box p-5">
      <h5 class="text-lg text-foreground">{{ $t('docs.gettingStarted') }}</h5>
      <p class="mt-2 text-sm leading-6 text-foreground/80">
        {{ $t('docs.gettingStartedDesc') }}
      </p>
    </div>

    <div class="card-box mt-6 p-5">
      <h5 class="text-lg text-foreground">{{ $t('docs.navigation') }}</h5>
      <p class="mt-2 text-sm leading-6 text-foreground/80">
        {{ $t('docs.navigationDesc') }}
      </p>
    </div>

    <div class="card-box mt-6 p-5">
      <h5 class="text-lg text-foreground">{{ $t('docs.commonOps') }}</h5>
      <p class="mt-2 text-sm leading-6 text-foreground/80">
        {{ $t('docs.commonOpsDesc') }}
      </p>
    </div>

    <div class="card-box mt-6 p-5">
      <h5 class="text-lg text-foreground">{{ $t('docs.permissions') }}</h5>
      <p class="mt-2 text-sm leading-6 text-foreground/80">
        {{ $t('docs.permissionsDesc') }}
      </p>
    </div>

    <div class="card-box mt-6 p-5">
      <h5 class="text-lg text-foreground">{{ $t('docs.shortcuts') }}</h5>
      <p class="mt-2 text-sm leading-6 text-foreground/80">
        {{ $t('docs.shortcutsDesc') }}
      </p>
    </div>
  </Page>
</template>
