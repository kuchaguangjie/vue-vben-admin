<script lang="ts" setup>
import type { GenApi } from '#/api';

import { onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';

import {
  Button,
  Card,
  Input,
  InputNumber,
  message,
  Select,
  Switch,
  Tabs,
} from 'ant-design-vue';

import {
  executeSql,
  generateGorm,
  generateSql,
  getSqlTypeOptions,
  getTableList,
  saveSql,
} from '#/api/system/gen';
import { $t } from '#/locales';

const sqlTypeOptions = ref<GenApi.SqlTypeOption[]>([]);
const tableList = ref<GenApi.GenTableInfo[]>([]);
const selectedExistingTable = ref('');
const existingTableOptions = ref<{ label: string; value: string }[]>([]);

const tableName = ref('');
const tableComment = ref('');

const isSoftDelete = ref(true);
const isTenant = ref(true);
const hasVersion = ref(true);
const hasCreated = ref(true);
const hasUpdated = ref(true);

const columns = ref<GenApi.GenTableColumn[]>([
  {
    fieldName: 'id',
    fieldType: 'bigserial',
    isPrimary: true,
    isAuto: true,
    isRequired: true,
    remark: '主键',
  },
  {
    fieldName: 'name',
    fieldType: 'varchar',
    fieldLength: 100,
    isRequired: true,
    isIndex: true,
    remark: '名称',
  },
  {
    fieldName: 'status',
    fieldType: 'smallint',
    isRequired: true,
    defaultValue: '0',
    remark: '状态',
  },
]);

const sqlResult = ref<GenApi.GenSqlResult | null>(null);
const activeTab = ref('full');
const isGenerating = ref(false);
const isSaving = ref(false);
const isExecuting = ref(false);
const isGeneratingGorm = ref(false);
const lastSavedPath = ref('');
const executeResult = ref<GenApi.GenExecuteSqlResult | null>(null);
const generateGormResult = ref<GenApi.GenGenerateGormResult | null>(null);
const canGenerateGorm = ref(false);

onMounted(() => {
  loadSqlTypeOptions();
  loadTableList();
});

async function loadSqlTypeOptions() {
  sqlTypeOptions.value = await getSqlTypeOptions();
}

async function loadTableList() {
  const tables = await getTableList();
  tableList.value = tables;
  existingTableOptions.value = tables.map((t) => ({
    label: t.tableComment ? `${t.tableName} (${t.tableComment})` : t.tableName,
    value: t.tableName,
  }));
}

function addColumn() {
  columns.value.push({
    fieldName: '',
    fieldType: 'varchar',
    fieldLength: 100,
    isPrimary: false,
    isAuto: false,
    isRequired: false,
    isUnique: false,
    isIndex: false,
    defaultValue: '',
    remark: '',
  });
}

function removeColumn(index: number) {
  if (columns.value.length <= 1) {
    message.warning('至少需要一个字段');
    return;
  }
  columns.value.splice(index, 1);
}

async function handleGenerate() {
  if (!tableName.value.trim()) {
    message.warning('请输入表名');
    return;
  }

  for (const col of columns.value) {
    if (!col.fieldName.trim()) {
      message.warning('请填写所有字段名');
      return;
    }
  }

  isGenerating.value = true;
  try {
    const design: GenApi.GenTableDesign = {
      tableName: tableName.value.trim(),
      tableComment: tableComment.value.trim(),
      isSoftDelete: isSoftDelete.value,
      isTenant: isTenant.value,
      hasVersion: hasVersion.value,
      hasCreated: hasCreated.value,
      hasUpdated: hasUpdated.value,
      columns: columns.value.map((col) => ({
        ...col,
        fieldName: col.fieldName.trim(),
        fieldLength: col.fieldLength || 0,
        fieldScale: col.fieldScale || 0,
        defaultValue: col.defaultValue?.trim() || '',
        remark: col.remark?.trim() || '',
      })),
    };

    sqlResult.value = await generateSql(design);
    message.success($t('system.gen.generateSuccess'));
  } finally {
    isGenerating.value = false;
  }
}

function handleClear() {
  tableName.value = '';
  tableComment.value = '';
  isSoftDelete.value = true;
  isTenant.value = true;
  hasVersion.value = true;
  hasCreated.value = true;
  hasUpdated.value = true;
  columns.value = [
    {
      fieldName: 'id',
      fieldType: 'bigserial',
      isPrimary: true,
      isAuto: true,
      isRequired: true,
      remark: '主键',
    },
  ];
  sqlResult.value = null;
  selectedExistingTable.value = '';
  canGenerateGorm.value = false;
  executeResult.value = null;
  generateGormResult.value = null;
}

function handleSelectExistingTable(value: string) {
  if (value) {
    tableName.value = value;
    canGenerateGorm.value = true;
  } else {
    canGenerateGorm.value = false;
  }
}

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    message.success($t('system.gen.copied'));
  } catch {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.append(textarea);
    textarea.select();
    document.execCommand('copy');
    textarea.remove();
    message.success($t('system.gen.copied'));
  }
}

function needsLength(fieldType: string) {
  return ['char', 'varchar'].includes(fieldType);
}

function needsScale(fieldType: string) {
  return ['decimal', 'numeric'].includes(fieldType);
}

async function handleSaveSql() {
  if (!sqlResult.value) {
    message.warning('请先生成 SQL');
    return;
  }

  isSaving.value = true;
  try {
    const result = await saveSql({
      tableName: tableName.value.trim(),
      sql: sqlResult.value.fullSql,
    });
    lastSavedPath.value = result.filePath;
    message.success(`已保存到 ${result.filePath}`, 5);
  } finally {
    isSaving.value = false;
  }
}

async function handleExecuteSql() {
  if (!sqlResult.value) {
    message.warning('请先生成 SQL');
    return;
  }

  executeResult.value = null;
  canGenerateGorm.value = false;
  isExecuting.value = true;
  try {
    const result = await executeSql({
      tableName: tableName.value.trim(),
      sql: sqlResult.value.fullSql,
    });
    executeResult.value = result;
    if (result.success) {
      canGenerateGorm.value = true;
      message.success($t('system.gen.executeSuccess'), 5);
    } else {
      message.error($t('system.gen.executeFailed'), 5);
    }
  } finally {
    isExecuting.value = false;
  }
}

async function handleGenerateGorm() {
  if (!tableName.value.trim()) {
    message.warning('请输入表名');
    return;
  }

  generateGormResult.value = null;
  isGeneratingGorm.value = true;
  try {
    const result = await generateGorm({
      tableName: tableName.value.trim(),
    });
    generateGormResult.value = result;
    if (result.success) {
      message.success($t('system.gen.generateGormSuccess'), 5);
    } else {
      message.error($t('system.gen.generateGormFailed'), 5);
    }
  } finally {
    isGeneratingGorm.value = false;
  }
}
</script>

<template>
  <Page auto-content-height>
    <div class="space-y-4 p-4">
      <Card :title="$t('system.gen.section.basic')">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label
              class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              选择已有表
            </label>
            <Select
              v-model:value="selectedExistingTable"
              :options="existingTableOptions"
              placeholder="选择已有表（可选）"
              allow-clear
              show-search
              :filter-option="
                (input: string, option: { label: string }) =>
                  (option?.label ?? '')
                    .toLowerCase()
                    .includes(input.toLowerCase())
              "
              style="width: 100%"
              @change="handleSelectExistingTable"
            />
          </div>
          <div>
            <label
              class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {{ $t('system.gen.tableName') }}
              <span class="text-red-500">*</span>
            </label>
            <Input v-model:value="tableName" placeholder="e.g., my_table" />
          </div>
          <div>
            <label
              class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {{ $t('system.gen.tableComment') }}
            </label>
            <Input v-model:value="tableComment" />
          </div>
        </div>
      </Card>

      <Card :title="$t('system.gen.section.columns')">
        <template #extra>
          <Button type="primary" @click="addColumn">
            {{ $t('system.gen.btnAddField') }}
          </Button>
        </template>

        <div class="overflow-x-auto">
          <table class="w-full border-collapse">
            <thead>
              <tr class="bg-gray-50 dark:bg-gray-800">
                <th
                  class="border border-gray-200 px-3 py-2 text-left text-sm text-gray-800 dark:border-gray-700 dark:text-gray-200"
                >
                  {{ $t('system.gen.fieldName') }}
                </th>
                <th
                  class="border border-gray-200 px-3 py-2 text-left text-sm text-gray-800 dark:border-gray-700 dark:text-gray-200"
                >
                  {{ $t('system.gen.fieldType') }}
                </th>
                <th
                  class="border border-gray-200 px-3 py-2 text-center text-sm text-gray-800 dark:border-gray-700 dark:text-gray-200"
                >
                  {{ $t('system.gen.fieldLength') }}
                </th>
                <th
                  class="border border-gray-200 px-3 py-2 text-center text-sm text-gray-800 dark:border-gray-700 dark:text-gray-200"
                >
                  {{ $t('system.gen.fieldScale') }}
                </th>
                <th
                  class="border border-gray-200 px-3 py-2 text-left text-sm text-gray-800 dark:border-gray-700 dark:text-gray-200"
                >
                  {{ $t('system.gen.defaultValue') }}
                </th>
                <th
                  class="border border-gray-200 px-3 py-2 text-center text-sm text-gray-800 dark:border-gray-700 dark:text-gray-200"
                >
                  {{ $t('system.gen.isPrimary') }}
                </th>
                <th
                  class="border border-gray-200 px-3 py-2 text-center text-sm text-gray-800 dark:border-gray-700 dark:text-gray-200"
                >
                  {{ $t('system.gen.isRequired') }}
                </th>
                <th
                  class="border border-gray-200 px-3 py-2 text-center text-sm text-gray-800 dark:border-gray-700 dark:text-gray-200"
                >
                  {{ $t('system.gen.isUnique') }}
                </th>
                <th
                  class="border border-gray-200 px-3 py-2 text-center text-sm text-gray-800 dark:border-gray-700 dark:text-gray-200"
                >
                  {{ $t('system.gen.isIndex') }}
                </th>
                <th
                  class="border border-gray-200 px-3 py-2 text-left text-sm text-gray-800 dark:border-gray-700 dark:text-gray-200"
                >
                  {{ $t('system.gen.remark') }}
                </th>
                <th
                  class="border border-gray-200 px-3 py-2 text-center text-sm text-gray-800 dark:border-gray-700 dark:text-gray-200"
                >
                  {{ $t('common.operation') }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(col, index) in columns" :key="index">
                <td
                  class="border border-gray-200 px-2 py-1 dark:border-gray-700"
                >
                  <Input
                    v-model:value="col.fieldName"
                    size="small"
                    placeholder="field_name"
                  />
                </td>
                <td
                  class="border border-gray-200 px-2 py-1 dark:border-gray-700"
                >
                  <Select
                    v-model:value="col.fieldType"
                    :options="sqlTypeOptions"
                    size="small"
                    style="width: 140px"
                  />
                </td>
                <td
                  class="border border-gray-200 px-2 py-1 dark:border-gray-700"
                >
                  <InputNumber
                    v-model:value="col.fieldLength"
                    :disabled="
                      !needsLength(col.fieldType) && !needsScale(col.fieldType)
                    "
                    :min="1"
                    size="small"
                    style="width: 80px"
                  />
                </td>
                <td
                  class="border border-gray-200 px-2 py-1 dark:border-gray-700"
                >
                  <InputNumber
                    v-model:value="col.fieldScale"
                    :disabled="!needsScale(col.fieldType)"
                    :min="0"
                    size="small"
                    style="width: 70px"
                  />
                </td>
                <td
                  class="border border-gray-200 px-2 py-1 dark:border-gray-700"
                >
                  <Input
                    v-model:value="col.defaultValue"
                    size="small"
                    placeholder="'value'"
                  />
                </td>
                <td
                  class="border border-gray-200 px-2 py-1 text-center dark:border-gray-700"
                >
                  <Switch v-model:checked="col.isPrimary" size="small" />
                </td>
                <td
                  class="border border-gray-200 px-2 py-1 text-center dark:border-gray-700"
                >
                  <Switch v-model:checked="col.isRequired" size="small" />
                </td>
                <td
                  class="border border-gray-200 px-2 py-1 text-center dark:border-gray-700"
                >
                  <Switch v-model:checked="col.isUnique" size="small" />
                </td>
                <td
                  class="border border-gray-200 px-2 py-1 text-center dark:border-gray-700"
                >
                  <Switch v-model:checked="col.isIndex" size="small" />
                </td>
                <td
                  class="border border-gray-200 px-2 py-1 dark:border-gray-700"
                >
                  <Input v-model:value="col.remark" size="small" />
                </td>
                <td
                  class="border border-gray-200 px-2 py-1 text-center dark:border-gray-700"
                >
                  <Button size="small" danger @click="removeColumn(index)">
                    删除
                  </Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      <Card :title="$t('system.gen.section.options')">
        <div class="flex flex-wrap gap-6">
          <div class="flex items-center gap-2">
            <Switch v-model:checked="isTenant" />
            <span class="text-sm">{{ $t('system.gen.isTenant') }}</span>
          </div>
          <div class="flex items-center gap-2">
            <Switch v-model:checked="hasVersion" />
            <span class="text-sm">{{ $t('system.gen.hasVersion') }}</span>
          </div>
          <div class="flex items-center gap-2">
            <Switch v-model:checked="hasCreated" />
            <span class="text-sm">{{ $t('system.gen.hasCreated') }}</span>
          </div>
          <div class="flex items-center gap-2">
            <Switch v-model:checked="hasUpdated" />
            <span class="text-sm">{{ $t('system.gen.hasUpdated') }}</span>
          </div>
          <div class="flex items-center gap-2">
            <Switch v-model:checked="isSoftDelete" />
            <span class="text-sm">{{ $t('system.gen.isSoftDelete') }}</span>
          </div>
        </div>
      </Card>

      <div class="flex justify-center gap-4">
        <Button type="primary" :loading="isGenerating" @click="handleGenerate">
          {{ $t('system.gen.btnGenerate') }}
        </Button>
        <Button type="default" @click="handleClear">
          {{ $t('system.gen.btnClear') }}
        </Button>
      </div>

      <Card
        v-if="canGenerateGorm && !sqlResult"
        title="已有表 - 生成 GORM 代码"
      >
        <div class="flex flex-col gap-4">
          <div class="text-sm text-gray-600 dark:text-gray-400">
            已选择表: <span class="font-medium">{{ tableName }}</span>
          </div>
          <div>
            <Button
              type="primary"
              :loading="isGeneratingGorm"
              @click="handleGenerateGorm"
            >
              {{ $t('system.gen.btnGenerateGorm') }}
            </Button>
          </div>
          <div v-if="generateGormResult" class="rounded-md p-3 text-sm">
            <div class="mb-1 font-medium">GORM 生成结果:</div>
            <div
              :class="[
                generateGormResult.success
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400',
              ]"
            >
              {{ generateGormResult.message }}
            </div>
            <div
              v-if="generateGormResult.error"
              class="mt-2 text-sm text-red-500 dark:text-red-400"
            >
              <pre class="whitespace-pre-wrap">{{
                generateGormResult.error
              }}</pre>
            </div>
          </div>
        </div>
      </Card>

      <Card v-if="sqlResult" :title="$t('system.gen.section.result')">
        <template #extra>
          <div class="flex gap-2">
            <Button
              type="primary"
              size="small"
              :loading="isExecuting"
              @click="handleExecuteSql"
            >
              {{ $t('system.gen.btnExecute') }}
            </Button>
            <Button
              v-if="canGenerateGorm"
              type="primary"
              size="small"
              :loading="isGeneratingGorm"
              @click="handleGenerateGorm"
            >
              {{ $t('system.gen.btnGenerateGorm') }}
            </Button>
            <Button
              type="default"
              size="small"
              :loading="isSaving"
              @click="handleSaveSql"
            >
              {{ $t('system.gen.btnSave') }}
            </Button>
            <Button
              type="default"
              size="small"
              @click="copyToClipboard(sqlResult.fullSql)"
            >
              {{ $t('system.gen.btnCopy') }}
            </Button>
          </div>
        </template>

        <div
          v-if="lastSavedPath"
          class="mb-3 text-sm text-green-600 dark:text-green-400"
        >
          上次保存路径: {{ lastSavedPath }}
        </div>

        <div v-if="executeResult" class="mb-3 rounded-md p-3 text-sm">
          <div class="mb-1 font-medium">
            {{ $t('system.gen.executeResult') }}:
          </div>
          <div
            :class="[
              executeResult.success
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400',
            ]"
          >
            {{ executeResult.message }}
          </div>
          <div
            v-if="executeResult.error"
            class="mt-2 text-sm text-red-500 dark:text-red-400"
          >
            <pre class="whitespace-pre-wrap">{{ executeResult.error }}</pre>
          </div>
        </div>

        <div v-if="generateGormResult" class="mb-3 rounded-md p-3 text-sm">
          <div class="mb-1 font-medium">GORM 生成结果:</div>
          <div
            :class="[
              generateGormResult.success
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400',
            ]"
          >
            {{ generateGormResult.message }}
          </div>
          <div
            v-if="generateGormResult.error"
            class="mt-2 text-sm text-red-500 dark:text-red-400"
          >
            <pre class="whitespace-pre-wrap">{{
              generateGormResult.error
            }}</pre>
          </div>
        </div>

        <Tabs v-model:active-key="activeTab">
          <Tabs.TabPane key="full" :tab="$t('system.gen.fullSql')">
            <pre
              class="overflow-x-auto rounded-md bg-gray-900 p-4 text-sm text-green-400"
            ><code>{{ sqlResult.fullSql }}</code></pre>
          </Tabs.TabPane>
          <Tabs.TabPane key="create" :tab="$t('system.gen.createTableSql')">
            <pre
              class="overflow-x-auto rounded-md bg-gray-900 p-4 text-sm text-green-400"
            ><code>{{ sqlResult.createTableSql }}</code></pre>
          </Tabs.TabPane>
          <Tabs.TabPane
            v-if="sqlResult.indexSql"
            key="index"
            :tab="$t('system.gen.indexSql')"
          >
            <pre
              class="overflow-x-auto rounded-md bg-gray-900 p-4 text-sm text-green-400"
            ><code>{{ sqlResult.indexSql }}</code></pre>
          </Tabs.TabPane>
        </Tabs>
      </Card>
    </div>
  </Page>
</template>

<style scoped>
pre {
  max-height: 600px;
  overflow-y: auto;
  word-break: break-all;
  white-space: pre-wrap;
}
</style>
