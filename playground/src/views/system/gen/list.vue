<script lang="ts" setup>
import type { GenApi, SystemApiApi, SystemMenuApi } from '#/api';

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
  TreeSelect,
} from 'ant-design-vue';

import { getApiTreeRoots } from '#/api/system/api';
import {
  createApiForGen,
  createMenuForGen,
  executeSql,
  generateCode,
  generateFrontend,
  generateGorm,
  generateSql,
  getSqlTypeOptions,
  getTableList,
  saveSql,
} from '#/api/system/gen';
import { getMenuTreeRoots } from '#/api/system/menu';
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
const moduleName = ref('');
const canGenerateCode = ref(false);
const isGeneratingCode = ref(false);
const generateCodeResult = ref<GenApi.GenGenerateCodeResult | null>(null);

const canGenerateFrontend = ref(false);
const isGeneratingFrontend = ref(false);
const generateFrontendResult = ref<GenApi.GenGenerateFrontendResult | null>(
  null,
);

const menuTreeData = ref<SystemMenuApi.SystemMenu[]>([]);
const selectedMenuParentId = ref<number | undefined>(undefined);
const isCreatingMenu = ref(false);
const createMenuResult = ref<GenApi.GenCreateMenuResult | null>(null);
const canCreateMenu = ref(false);

const apiTreeData = ref<SystemApiApi.SystemApi[]>([]);
const selectedApiParentId = ref<number | undefined>(undefined);
const isCreatingApi = ref(false);
const createApiResult = ref<GenApi.GenCreateApiResult | null>(null);
const canCreateApi = ref(false);

onMounted(() => {
  loadSqlTypeOptions();
  loadTableList();
  loadMenuTree();
  loadApiTree();
});

async function loadMenuTree() {
  menuTreeData.value = await getMenuTreeRoots({});
}

async function loadApiTree() {
  apiTreeData.value = await getApiTreeRoots({ type: 1 });
}

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
  moduleName.value = '';
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
  canGenerateCode.value = false;
  canGenerateFrontend.value = false;
  canCreateMenu.value = false;
  canCreateApi.value = false;
  executeResult.value = null;
  generateGormResult.value = null;
  generateCodeResult.value = null;
  generateFrontendResult.value = null;
  createMenuResult.value = null;
  createApiResult.value = null;
  selectedMenuParentId.value = undefined;
  selectedApiParentId.value = undefined;
}

function handleSelectExistingTable(value: string) {
  moduleName.value = '';
  canGenerateCode.value = false;
  canCreateMenu.value = false;
  canCreateApi.value = false;
  generateGormResult.value = null;
  generateCodeResult.value = null;
  generateFrontendResult.value = null;
  createMenuResult.value = null;
  createApiResult.value = null;
  selectedMenuParentId.value = undefined;
  selectedApiParentId.value = undefined;

  if (value) {
    tableName.value = value;
    canGenerateGorm.value = true;
    canGenerateFrontend.value = true;
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
  canGenerateCode.value = false;
  isGeneratingGorm.value = true;
  try {
    const result = await generateGorm({
      tableName: tableName.value.trim(),
    });
    generateGormResult.value = result;
    if (result.success) {
      canGenerateCode.value = true;
      canGenerateFrontend.value = true;
      message.success($t('system.gen.generateGormSuccess'), 5);
    } else {
      message.error($t('system.gen.generateGormFailed'), 5);
    }
  } finally {
    isGeneratingGorm.value = false;
  }
}

async function handleGenerateCode() {
  if (!tableName.value.trim()) {
    message.warning('请输入表名');
    return;
  }
  if (!moduleName.value.trim()) {
    message.warning('请输入模块名');
    return;
  }

  generateCodeResult.value = null;
  generateFrontendResult.value = null;
  canCreateMenu.value = false;
  isGeneratingCode.value = true;
  try {
    const result = await generateCode({
      tableName: tableName.value.trim(),
      moduleName: moduleName.value.trim(),
    });
    generateCodeResult.value = result;
    if (result.success) {
      if (result.isPartialReady) {
        canGenerateFrontend.value = true;
        canCreateApi.value = true;
        canCreateMenu.value = true;
        if (result.skippedFiles && result.skippedFiles.length > 0) {
          message.warning(result.message, 5);
        } else {
          message.success($t('system.gen.generateCodeSuccess'), 5);
        }
      } else {
        canGenerateFrontend.value = true;
        canCreateApi.value = true;
        canCreateMenu.value = true;
        message.success($t('system.gen.generateCodeSuccess'), 5);
      }
    } else {
      message.error(result.message || $t('system.gen.generateCodeFailed'), 5);
    }
  } finally {
    isGeneratingCode.value = false;
  }
}

async function handleGenerateFrontend() {
  if (!tableName.value.trim()) {
    message.warning('请输入表名');
    return;
  }
  if (!moduleName.value.trim()) {
    message.warning('请输入模块名');
    return;
  }

  generateFrontendResult.value = null;
  isGeneratingFrontend.value = true;
  try {
    const result = await generateFrontend({
      tableName: tableName.value.trim(),
      moduleName: moduleName.value.trim(),
    });
    generateFrontendResult.value = result;
    if (result.success) {
      canCreateMenu.value = true;
      message.success('前端代码模板生成成功', 5);
    } else {
      message.error(result.message || '前端代码模板生成失败', 5);
    }
  } finally {
    isGeneratingFrontend.value = false;
  }
}

async function handleCreateMenu() {
  if (!tableName.value.trim()) {
    message.warning('请输入表名');
    return;
  }
  if (!moduleName.value.trim()) {
    message.warning('请输入模块名');
    return;
  }

  createMenuResult.value = null;
  isCreatingMenu.value = true;
  try {
    const result = await createMenuForGen({
      tableName: tableName.value.trim(),
      moduleName: moduleName.value.trim(),
      menuParentId: selectedMenuParentId.value,
    });
    createMenuResult.value = result;
    if (result.success) {
      message.success(result.message, 5);
      loadMenuTree();
    } else {
      message.error(result.message || '创建菜单失败', 5);
    }
  } finally {
    isCreatingMenu.value = false;
  }
}

async function handleCreateApi() {
  if (!tableName.value.trim()) {
    message.warning('请输入表名');
    return;
  }
  if (!moduleName.value.trim()) {
    message.warning('请输入模块名');
    return;
  }

  createApiResult.value = null;
  isCreatingApi.value = true;
  try {
    const result = await createApiForGen({
      tableName: tableName.value.trim(),
      moduleName: moduleName.value.trim(),
      apiParentId: selectedApiParentId.value,
    });
    createApiResult.value = result;
    if (result.success) {
      message.success(result.message, 5);
      loadApiTree();
    } else {
      message.error(result.message || '创建 API 失败', 5);
    }
  } finally {
    isCreatingApi.value = false;
  }
}
</script>

<template>
  <Page auto-content-height>
    <div class="space-y-4 p-4">
      <Card :title="$t('system.gen.section.basic')">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div class="md:col-span-3">
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
          <div>
            <label
              class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              模块名
              <span class="text-red-500" v-if="canGenerateCode">*</span>
            </label>
            <Input
              v-model:value="moduleName"
              placeholder="e.g., product, category"
            />
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

      <Card
        v-if="canGenerateCode && !sqlResult"
        title="生成 Service 和 API 代码"
      >
        <div class="flex flex-col gap-4">
          <div class="text-sm text-gray-600 dark:text-gray-400">
            已完成 GORM 代码生成，可以继续生成 Service 和 API 代码
          </div>
          <div>
            <Button
              type="primary"
              :loading="isGeneratingCode"
              @click="handleGenerateCode"
            >
              生成 Service 和 API 代码
            </Button>
          </div>
          <div v-if="generateCodeResult" class="rounded-md p-3 text-sm">
            <div class="mb-1 font-medium">代码生成结果:</div>
            <div
              :class="[
                generateCodeResult.success
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400',
              ]"
            >
              {{ generateCodeResult.message }}
            </div>
            <div
              v-if="generateCodeResult.error"
              class="mt-2 text-sm text-red-500 dark:text-red-400"
            >
              <pre class="whitespace-pre-wrap">{{
                generateCodeResult.error
              }}</pre>
            </div>
            <div
              v-if="
                generateCodeResult.files && generateCodeResult.files.length > 0
              "
              class="mt-3"
            >
              <div class="mb-1 font-medium">生成的文件:</div>
              <ul class="list-disc pl-5">
                <li
                  v-for="file in generateCodeResult.files"
                  :key="file.fileName"
                  class="text-gray-600 dark:text-gray-400"
                >
                  {{ file.filePath }}
                </li>
              </ul>
            </div>
            <div
              v-if="
                generateCodeResult.skippedFiles &&
                generateCodeResult.skippedFiles.length > 0
              "
              class="mt-3"
            >
              <div
                class="mb-1 font-medium text-yellow-600 dark:text-yellow-400"
              >
                跳过的已存在文件:
              </div>
              <ul class="list-disc pl-5">
                <li
                  v-for="fileName in generateCodeResult.skippedFiles"
                  :key="fileName"
                  class="text-yellow-600 dark:text-yellow-400"
                >
                  {{ fileName }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Card>

      <Card v-if="canCreateApi && !sqlResult" title="生成数据库 API">
        <div class="flex flex-col gap-4">
          <div class="text-sm text-gray-600 dark:text-gray-400">
            已完成 Service 和 API 代码生成，可继续创建数据库 API 记录
          </div>
          <div>
            <label
              class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              选择上级 API 目录
            </label>
            <TreeSelect
              v-model:value="selectedApiParentId"
              :tree-data="apiTreeData"
              :field-names="{
                label: 'path',
                value: 'id',
                children: 'children',
              }"
              class="w-full"
              placeholder="选择上级 API 目录（可选）"
              show-search
              tree-default-expand-all
            />
          </div>
          <div>
            <Button
              type="primary"
              :loading="isCreatingApi"
              @click="handleCreateApi"
            >
              生成数据库 API 记录
            </Button>
          </div>
          <div v-if="createApiResult" class="rounded-md p-3 text-sm">
            <div class="mb-1 font-medium">API 创建结果:</div>
            <div
              :class="[
                createApiResult.success
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400',
              ]"
            >
              {{ createApiResult.message }}
            </div>
            <div
              v-if="createApiResult.error"
              class="mt-2 text-sm text-red-500 dark:text-red-400"
            >
              <pre class="whitespace-pre-wrap">{{ createApiResult.error }}</pre>
            </div>
            <div
              v-if="createApiResult.apiIds && createApiResult.apiIds.length > 0"
              class="mt-3"
            >
              <div class="mb-1 font-medium">创建的 API 数量:</div>
              <span class="text-gray-600 dark:text-gray-400">
                {{ createApiResult.apiIds.length }} 个
              </span>
            </div>
          </div>
        </div>
      </Card>

      <Card v-if="canGenerateFrontend && !sqlResult" title="生成前端代码模板">
        <div class="flex flex-col gap-4">
          <div class="text-sm text-gray-600 dark:text-gray-400">
            前后端分离开发，可独立生成前端代码模板（GORM 模型需已存在）
          </div>
          <div>
            <Button
              type="primary"
              :loading="isGeneratingFrontend"
              @click="handleGenerateFrontend"
            >
              生成前端代码模板
            </Button>
          </div>
          <div v-if="generateFrontendResult" class="rounded-md p-3 text-sm">
            <div class="mb-1 font-medium">前端代码生成结果:</div>
            <div
              :class="[
                generateFrontendResult.success
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400',
              ]"
            >
              {{ generateFrontendResult.message }}
            </div>
            <div
              v-if="generateFrontendResult.error"
              class="mt-2 text-sm text-red-500 dark:text-red-400"
            >
              <pre class="whitespace-pre-wrap">{{
                generateFrontendResult.error
              }}</pre>
            </div>
            <div
              v-if="
                generateFrontendResult.files &&
                generateFrontendResult.files.length > 0
              "
              class="mt-3"
            >
              <div class="mb-1 font-medium">生成的文件:</div>
              <ul class="list-disc pl-5">
                <li
                  v-for="file in generateFrontendResult.files"
                  :key="file.fileName"
                  class="text-gray-600 dark:text-gray-400"
                >
                  {{ file.filePath }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Card>

      <Card v-if="canCreateMenu && !sqlResult" title="生成数据库菜单">
        <div class="flex flex-col gap-4">
          <div class="text-sm text-gray-600 dark:text-gray-400">
            已完成前端代码生成，可继续创建数据库菜单记录
          </div>
          <div>
            <label
              class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              选择上级菜单
            </label>
            <TreeSelect
              v-model:value="selectedMenuParentId"
              :tree-data="menuTreeData"
              :field-names="{
                label: 'name',
                value: 'id',
                children: 'children',
              }"
              class="w-full"
              placeholder="选择上级菜单（可选）"
              show-search
              tree-default-expand-all
            />
          </div>
          <div>
            <Button
              type="primary"
              :loading="isCreatingMenu"
              @click="handleCreateMenu"
            >
              生成数据库菜单记录
            </Button>
          </div>
          <div v-if="createMenuResult" class="rounded-md p-3 text-sm">
            <div class="mb-1 font-medium">菜单创建结果:</div>
            <div
              :class="[
                createMenuResult.success
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400',
              ]"
            >
              {{ createMenuResult.message }}
            </div>
            <div
              v-if="createMenuResult.error"
              class="mt-2 text-sm text-red-500 dark:text-red-400"
            >
              <pre class="whitespace-pre-wrap">{{
                createMenuResult.error
              }}</pre>
            </div>
            <div v-if="createMenuResult.menuId" class="mt-3">
              <div class="mb-1 font-medium">创建的菜单 ID:</div>
              <span class="text-gray-600 dark:text-gray-400">
                {{ createMenuResult.menuId }}
              </span>
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
              v-if="canGenerateCode"
              type="primary"
              size="small"
              :loading="isGeneratingCode"
              @click="handleGenerateCode"
            >
              生成 Service 和 API
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

        <div v-if="generateCodeResult" class="mb-3 rounded-md p-3 text-sm">
          <div class="mb-1 font-medium">代码生成结果:</div>
          <div
            :class="[
              generateCodeResult.success
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400',
            ]"
          >
            {{ generateCodeResult.message }}
          </div>
          <div
            v-if="generateCodeResult.error"
            class="mt-2 text-sm text-red-500 dark:text-red-400"
          >
            <pre class="whitespace-pre-wrap">{{
              generateCodeResult.error
            }}</pre>
          </div>
          <div
            v-if="
              generateCodeResult.files && generateCodeResult.files.length > 0
            "
            class="mt-3"
          >
            <div class="mb-1 font-medium">生成的文件:</div>
            <ul class="list-disc pl-5">
              <li
                v-for="file in generateCodeResult.files"
                :key="file.fileName"
                class="text-gray-600 dark:text-gray-400"
              >
                {{ file.filePath }}
              </li>
            </ul>
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
