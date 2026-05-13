<script lang="ts" setup>
import type { GenApi, SystemApiApi, SystemMenuApi } from '#/api';

import { onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';

import {
  Button,
  Card,
  Checkbox,
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
  oneClickGenerate,
  saveSql,
} from '#/api/system/gen';
import { getMenuTreeRoots } from '#/api/system/menu';
import { $t } from '#/locales';

// ============ 两个 Tab 的活跃状态 ============
const mainActiveTab = ref('table-design');

// ============ 表设计 Tab 的状态 ============
const sqlTypeOptions = ref<GenApi.SqlTypeOption[]>([]);

const designTableName = ref('');
const designTableComment = ref('');

const designIsSoftDelete = ref(true);
const designIsTenant = ref(true);
const designHasVersion = ref(true);
const designHasCreated = ref(true);
const designHasUpdated = ref(true);

const designColumns = ref<GenApi.GenTableColumn[]>([
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

const designSqlResult = ref<GenApi.GenSqlResult | null>(null);
const designActiveTab = ref('full');
const designIsGenerating = ref(false);
const designIsSaving = ref(false);
const designIsExecuting = ref(false);
const designLastSavedPath = ref('');
const designExecuteResult = ref<GenApi.GenExecuteSqlResult | null>(null);
const designIsCopying = ref(false);

// ============ 代码生成 Tab 的状态 ============
const tableList = ref<GenApi.GenTableInfo[]>([]);
const selectedExistingTable = ref('');
const existingTableOptions = ref<{ label: string; value: string }[]>([]);

const codeTableName = ref('');
const codeModuleName = ref('');

const codeIsGeneratingGorm = ref(false);
const codeGenerateGormResult = ref<GenApi.GenGenerateGormResult | null>(null);
const codeCanGenerateGorm = ref(false);

const codeCanGenerateCode = ref(false);
const codeIsGeneratingCode = ref(false);
const codeGenerateCodeResult = ref<GenApi.GenGenerateCodeResult | null>(null);

const codeCanGenerateFrontend = ref(false);
const codeIsGeneratingFrontend = ref(false);
const codeGenerateFrontendResult = ref<GenApi.GenGenerateFrontendResult | null>(
  null,
);

const menuTreeData = ref<SystemMenuApi.SystemMenu[]>([]);
const selectedMenuParentId = ref<number | undefined>(undefined);
const codeIsCreatingMenu = ref(false);
const codeCreateMenuResult = ref<GenApi.GenCreateMenuResult | null>(null);
const codeCanCreateMenu = ref(false);

const apiTreeData = ref<SystemApiApi.SystemApi[]>([]);
const selectedApiParentId = ref<number | undefined>(undefined);
const codeIsCreatingApi = ref(false);
const codeCreateApiResult = ref<GenApi.GenCreateApiResult | null>(null);
const codeCanCreateApi = ref(false);

const codeApiExecuteSql = ref(false);
const codeMenuExecuteSql = ref(false);
const codeIsCopying = ref(false);

// ============ 一键生成状态 ============
const codeGenMode = ref<'oneClick' | 'step'>('step');
const codeIsOneClickGenerating = ref(false);
const codeOneClickResult = ref<GenApi.GenOneClickGenerateResult | null>(null);

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

// ============ 表设计 Tab 的函数 ============
function designAddColumn() {
  designColumns.value.push({
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

function designRemoveColumn(index: number) {
  if (designColumns.value.length <= 1) {
    message.warning('至少需要一个字段');
    return;
  }
  designColumns.value.splice(index, 1);
}

async function designHandleGenerate() {
  if (!designTableName.value.trim()) {
    message.warning('请输入表名');
    return;
  }

  for (const col of designColumns.value) {
    if (!col.fieldName.trim()) {
      message.warning('请填写所有字段名');
      return;
    }
  }

  designIsGenerating.value = true;
  try {
    const design: GenApi.GenTableDesign = {
      tableName: designTableName.value.trim(),
      tableComment: designTableComment.value.trim(),
      isSoftDelete: designIsSoftDelete.value,
      isTenant: designIsTenant.value,
      hasVersion: designHasVersion.value,
      hasCreated: designHasCreated.value,
      hasUpdated: designHasUpdated.value,
      columns: designColumns.value.map((col) => ({
        ...col,
        fieldName: col.fieldName.trim(),
        fieldLength: col.fieldLength || 0,
        fieldScale: col.fieldScale || 0,
        defaultValue: col.defaultValue?.trim() || '',
        remark: col.remark?.trim() || '',
      })),
    };

    designSqlResult.value = await generateSql(design);
    message.success($t('system.gen.generateSuccess'));
  } finally {
    designIsGenerating.value = false;
  }
}

function designHandleClear() {
  designTableName.value = '';
  designTableComment.value = '';
  designIsSoftDelete.value = true;
  designIsTenant.value = true;
  designHasVersion.value = true;
  designHasCreated.value = true;
  designHasUpdated.value = true;
  designColumns.value = [
    {
      fieldName: 'id',
      fieldType: 'bigserial',
      isPrimary: true,
      isAuto: true,
      isRequired: true,
      remark: '主键',
    },
  ];
  designSqlResult.value = null;
  designExecuteResult.value = null;
  designLastSavedPath.value = '';
}

async function designCopyToClipboard(text: string) {
  designIsCopying.value = true;
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
  } finally {
    designIsCopying.value = false;
  }
}

async function designHandleSaveSql() {
  if (!designSqlResult.value) {
    message.warning('请先生成 SQL');
    return;
  }

  designIsSaving.value = true;
  try {
    const result = await saveSql({
      tableName: designTableName.value.trim(),
      sql: designSqlResult.value.fullSql,
    });
    designLastSavedPath.value = result.filePath;
    message.success(`已保存到 ${result.filePath}`, 5);
  } finally {
    designIsSaving.value = false;
  }
}

async function designHandleExecuteSql() {
  if (!designSqlResult.value) {
    message.warning('请先生成 SQL');
    return;
  }

  designExecuteResult.value = null;
  designIsExecuting.value = true;
  try {
    const result = await executeSql({
      tableName: designTableName.value.trim(),
      sql: designSqlResult.value.fullSql,
    });
    designExecuteResult.value = result;
    if (result.success) {
      message.success($t('system.gen.executeSuccess'), 5);
      // 刷新表列表，以便代码生成 Tab 可以看到新表
      loadTableList();
    } else {
      message.error($t('system.gen.executeFailed'), 5);
    }
  } finally {
    designIsExecuting.value = false;
  }
}

function designNeedsLength(fieldType: string) {
  return ['char', 'varchar'].includes(fieldType);
}

function designNeedsScale(fieldType: string) {
  return ['decimal', 'numeric'].includes(fieldType);
}

// ============ 代码生成 Tab 的函数 ============
function codeHandleSelectExistingTable(value: string) {
  codeModuleName.value = '';
  codeCanGenerateCode.value = false;
  codeCanCreateMenu.value = false;
  codeCanCreateApi.value = false;
  codeGenerateGormResult.value = null;
  codeGenerateCodeResult.value = null;
  codeGenerateFrontendResult.value = null;
  codeCreateMenuResult.value = null;
  codeCreateApiResult.value = null;
  selectedMenuParentId.value = undefined;
  selectedApiParentId.value = undefined;
  codeApiExecuteSql.value = false;
  codeMenuExecuteSql.value = false;

  if (value) {
    codeTableName.value = value;
    codeCanGenerateGorm.value = true;
    codeCanGenerateFrontend.value = true;
  } else {
    codeTableName.value = '';
    codeCanGenerateGorm.value = false;
    codeCanGenerateFrontend.value = false;
  }
}

async function codeCopyToClipboard(text: string) {
  codeIsCopying.value = true;
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
  } finally {
    codeIsCopying.value = false;
  }
}

async function codeHandleGenerateGorm() {
  if (!codeTableName.value.trim()) {
    message.warning('请输入表名');
    return;
  }

  codeGenerateGormResult.value = null;
  codeCanGenerateCode.value = false;
  codeIsGeneratingGorm.value = true;
  try {
    const result = await generateGorm({
      tableName: codeTableName.value.trim(),
    });
    codeGenerateGormResult.value = result;
    if (result.success) {
      codeCanGenerateCode.value = true;
      codeCanGenerateFrontend.value = true;
      message.success($t('system.gen.generateGormSuccess'), 5);
    } else {
      message.error($t('system.gen.generateGormFailed'), 5);
    }
  } finally {
    codeIsGeneratingGorm.value = false;
  }
}

async function codeHandleGenerateCode() {
  if (!codeTableName.value.trim()) {
    message.warning('请输入表名');
    return;
  }
  if (!codeModuleName.value.trim()) {
    message.warning('请输入模块名');
    return;
  }

  codeGenerateCodeResult.value = null;
  codeCanCreateMenu.value = false;
  codeIsGeneratingCode.value = true;
  try {
    const result = await generateCode({
      tableName: codeTableName.value.trim(),
      moduleName: codeModuleName.value.trim(),
    });
    codeGenerateCodeResult.value = result;
    if (result.success) {
      if (result.isPartialReady) {
        codeCanGenerateFrontend.value = true;
        codeCanCreateApi.value = true;
        codeCanCreateMenu.value = true;
        if (result.skippedFiles && result.skippedFiles.length > 0) {
          message.warning(result.message, 5);
        } else {
          message.success($t('system.gen.generateCodeSuccess'), 5);
        }
      } else {
        codeCanGenerateFrontend.value = true;
        codeCanCreateApi.value = true;
        codeCanCreateMenu.value = true;
        message.success($t('system.gen.generateCodeSuccess'), 5);
      }
    } else {
      message.error(result.message || $t('system.gen.generateCodeFailed'), 5);
    }
  } finally {
    codeIsGeneratingCode.value = false;
  }
}

async function codeHandleGenerateFrontend(downloadZip: boolean) {
  if (!codeTableName.value.trim()) {
    message.warning('请输入表名');
    return;
  }
  if (!codeModuleName.value.trim()) {
    message.warning('请输入模块名');
    return;
  }

  codeGenerateFrontendResult.value = null;
  codeIsGeneratingFrontend.value = true;
  try {
    const result = await generateFrontend({
      tableName: codeTableName.value.trim(),
      moduleName: codeModuleName.value.trim(),
      downloadZip,
    });
    codeGenerateFrontendResult.value = result;
    if (result.success) {
      codeCanCreateMenu.value = true;
      message.success('前端代码模板生成成功', 5);
      if (downloadZip && result.zipData) {
        codeDownloadZip();
      }
    } else {
      message.error(result.message || '前端代码模板生成失败', 5);
    }
  } finally {
    codeIsGeneratingFrontend.value = false;
  }
}

function codeDownloadZip() {
  if (!codeGenerateFrontendResult.value?.zipData) {
    message.warning('没有可下载的 ZIP 文件');
    return;
  }

  const base64Data = codeGenerateFrontendResult.value.zipData;
  const byteCharacters = atob(base64Data);
  const byteNumbers = Array.from({ length: byteCharacters.length });
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.codePointAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: 'application/zip' });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download =
    codeGenerateFrontendResult.value.zipFileName || 'frontend-code.zip';
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function codeHandleCreateMenu() {
  if (!codeTableName.value.trim()) {
    message.warning('请输入表名');
    return;
  }
  if (!codeModuleName.value.trim()) {
    message.warning('请输入模块名');
    return;
  }

  codeCreateMenuResult.value = null;
  codeIsCreatingMenu.value = true;
  try {
    const result = await createMenuForGen({
      tableName: codeTableName.value.trim(),
      moduleName: codeModuleName.value.trim(),
      menuParentId: selectedMenuParentId.value,
      executeSql: codeMenuExecuteSql.value,
    });
    codeCreateMenuResult.value = result;
    if (result.success) {
      message.success(result.message, 5);
      if (codeMenuExecuteSql.value) {
        loadMenuTree();
      }
    } else {
      message.error(result.message || '创建菜单失败', 5);
    }
  } finally {
    codeIsCreatingMenu.value = false;
  }
}

async function codeHandleCreateApi() {
  if (!codeTableName.value.trim()) {
    message.warning('请输入表名');
    return;
  }
  if (!codeModuleName.value.trim()) {
    message.warning('请输入模块名');
    return;
  }

  codeCreateApiResult.value = null;
  codeIsCreatingApi.value = true;
  try {
    const result = await createApiForGen({
      tableName: codeTableName.value.trim(),
      moduleName: codeModuleName.value.trim(),
      apiParentId: selectedApiParentId.value,
      executeSql: codeApiExecuteSql.value,
    });
    codeCreateApiResult.value = result;
    if (result.success) {
      message.success(result.message, 5);
      if (codeApiExecuteSql.value) {
        loadApiTree();
      }
    } else {
      message.error(result.message || '创建 API 失败', 5);
    }
  } finally {
    codeIsCreatingApi.value = false;
  }
}

function codeHandleClear() {
  selectedExistingTable.value = '';
  codeTableName.value = '';
  codeModuleName.value = '';
  codeCanGenerateGorm.value = false;
  codeCanGenerateCode.value = false;
  codeCanGenerateFrontend.value = false;
  codeCanCreateMenu.value = false;
  codeCanCreateApi.value = false;
  codeGenerateGormResult.value = null;
  codeGenerateCodeResult.value = null;
  codeGenerateFrontendResult.value = null;
  codeCreateMenuResult.value = null;
  codeCreateApiResult.value = null;
  codeOneClickResult.value = null;
  selectedMenuParentId.value = undefined;
  selectedApiParentId.value = undefined;
  codeApiExecuteSql.value = false;
  codeMenuExecuteSql.value = false;
}

async function codeHandleOneClickGenerate() {
  if (!codeTableName.value.trim()) {
    message.warning('请选择表名');
    return;
  }
  if (!codeModuleName.value.trim()) {
    message.warning('请输入模块名');
    return;
  }

  codeOneClickResult.value = null;
  codeIsOneClickGenerating.value = true;
  try {
    const result = await oneClickGenerate({
      tableName: codeTableName.value.trim(),
      moduleName: codeModuleName.value.trim(),
    });
    codeOneClickResult.value = result;
    if (result.success) {
      message.success(result.message, 5);
      if (result.frontendZipData) {
        codeOneClickDownloadZip();
      }
    } else {
      message.error(result.error || result.message || '一键生成失败', 5);
    }
  } finally {
    codeIsOneClickGenerating.value = false;
  }
}

function codeOneClickDownloadZip() {
  if (!codeOneClickResult.value?.frontendZipData) {
    message.warning('没有可下载的 ZIP 文件');
    return;
  }

  const base64Data = codeOneClickResult.value.frontendZipData;
  const byteCharacters = atob(base64Data);
  const byteNumbers = Array.from({ length: byteCharacters.length });
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.codePointAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: 'application/zip' });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download =
    codeOneClickResult.value.frontendZipFileName || 'frontend-code.zip';
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
</script>

<template>
  <Page auto-content-height>
    <div class="space-y-4 p-4">
      <Tabs v-model:active-key="mainActiveTab">
        <!-- Tab 1: 表设计 -->
        <Tabs.TabPane key="table-design" tab="表设计">
          <div class="space-y-4">
            <Card title="基础信息">
              <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label
                    class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    {{ $t('system.gen.tableName') }}
                    <span class="text-red-500">*</span>
                  </label>
                  <Input
                    v-model:value="designTableName"
                    placeholder="e.g., my_table"
                  />
                </div>
                <div>
                  <label
                    class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    {{ $t('system.gen.tableComment') }}
                  </label>
                  <Input v-model:value="designTableComment" />
                </div>
              </div>
            </Card>

            <Card title="字段设计">
              <template #extra>
                <Button type="primary" @click="designAddColumn">
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
                    <tr v-for="(col, index) in designColumns" :key="index">
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
                            !designNeedsLength(col.fieldType) &&
                            !designNeedsScale(col.fieldType)
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
                          :disabled="!designNeedsScale(col.fieldType)"
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
                        <Button
                          size="small"
                          danger
                          @click="designRemoveColumn(index)"
                        >
                          删除
                        </Button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>

            <Card title="通用字段选项">
              <div class="flex flex-wrap gap-6">
                <div class="flex items-center gap-2">
                  <Switch v-model:checked="designIsTenant" />
                  <span class="text-sm">{{ $t('system.gen.isTenant') }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <Switch v-model:checked="designHasVersion" />
                  <span class="text-sm">{{ $t('system.gen.hasVersion') }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <Switch v-model:checked="designHasCreated" />
                  <span class="text-sm">{{ $t('system.gen.hasCreated') }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <Switch v-model:checked="designHasUpdated" />
                  <span class="text-sm">{{ $t('system.gen.hasUpdated') }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <Switch v-model:checked="designIsSoftDelete" />
                  <span class="text-sm">{{
                    $t('system.gen.isSoftDelete')
                  }}</span>
                </div>
              </div>
            </Card>

            <div class="flex justify-center gap-4">
              <Button
                type="primary"
                :loading="designIsGenerating"
                @click="designHandleGenerate"
              >
                {{ $t('system.gen.btnGenerate') }}
              </Button>
              <Button type="default" @click="designHandleClear">
                {{ $t('system.gen.btnClear') }}
              </Button>
            </div>

            <Card v-if="designSqlResult" title="SQL 结果">
              <template #extra>
                <div class="flex gap-2">
                  <Button
                    type="primary"
                    size="small"
                    :loading="designIsExecuting"
                    @click="designHandleExecuteSql"
                  >
                    {{ $t('system.gen.btnExecute') }}
                  </Button>
                  <Button
                    type="default"
                    size="small"
                    :loading="designIsSaving"
                    @click="designHandleSaveSql"
                  >
                    {{ $t('system.gen.btnSave') }}
                  </Button>
                  <Button
                    type="default"
                    size="small"
                    @click="designCopyToClipboard(designSqlResult.fullSql)"
                  >
                    {{ $t('system.gen.btnCopy') }}
                  </Button>
                </div>
              </template>

              <div
                v-if="designLastSavedPath"
                class="mb-3 text-sm text-green-600 dark:text-green-400"
              >
                上次保存路径: {{ designLastSavedPath }}
              </div>

              <div
                v-if="designExecuteResult"
                class="mb-3 rounded-md p-3 text-sm"
              >
                <div class="mb-1 font-medium">
                  {{ $t('system.gen.executeResult') }}:
                </div>
                <div
                  :class="[
                    designExecuteResult.success
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400',
                  ]"
                >
                  {{ designExecuteResult.message }}
                </div>
                <div
                  v-if="designExecuteResult.error"
                  class="mt-2 text-sm text-red-500 dark:text-red-400"
                >
                  <pre class="whitespace-pre-wrap">{{
                    designExecuteResult.error
                  }}</pre>
                </div>
              </div>

              <Tabs v-model:active-key="designActiveTab">
                <Tabs.TabPane key="full" :tab="$t('system.gen.fullSql')">
                  <pre
                    class="overflow-x-auto rounded-md bg-gray-900 p-4 text-sm text-green-400"
                  ><code>{{ designSqlResult.fullSql }}</code></pre>
                </Tabs.TabPane>
                <Tabs.TabPane
                  key="create"
                  :tab="$t('system.gen.createTableSql')"
                >
                  <pre
                    class="overflow-x-auto rounded-md bg-gray-900 p-4 text-sm text-green-400"
                  ><code>{{ designSqlResult.createTableSql }}</code></pre>
                </Tabs.TabPane>
                <Tabs.TabPane
                  v-if="designSqlResult.indexSql"
                  key="index"
                  :tab="$t('system.gen.indexSql')"
                >
                  <pre
                    class="overflow-x-auto rounded-md bg-gray-900 p-4 text-sm text-green-400"
                  ><code>{{ designSqlResult.indexSql }}</code></pre>
                </Tabs.TabPane>
              </Tabs>
            </Card>
          </div>
        </Tabs.TabPane>

        <!-- Tab 2: 代码生成 -->
        <Tabs.TabPane key="code-generation" tab="代码生成">
          <div class="space-y-4">
            <Card title="选择已有表">
              <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label
                    class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    数据库表
                  </label>
                  <Select
                    v-model:value="selectedExistingTable"
                    :options="existingTableOptions"
                    placeholder="选择一个已存在的数据库表"
                    allow-clear
                    show-search
                    :filter-option="
                      (input: string, option: { label: string }) =>
                        (option?.label ?? '')
                          .toLowerCase()
                          .includes(input.toLowerCase())
                    "
                    style="width: 100%"
                    @change="codeHandleSelectExistingTable"
                  />
                </div>
                <div>
                  <label
                    class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    模块名
                    <span class="text-red-500" v-if="codeCanGenerateCode">
                      *
                    </span>
                  </label>
                  <Input
                    v-model:value="codeModuleName"
                    placeholder="e.g., product, category"
                  />
                </div>
              </div>
              <div
                v-if="codeTableName"
                class="mt-4 text-sm text-gray-600 dark:text-gray-400"
              >
                已选择表: <span class="font-medium">{{ codeTableName }}</span>
              </div>
            </Card>

            <div class="flex justify-center gap-4">
              <Button type="default" @click="codeHandleClear">
                清空选择
              </Button>
            </div>

            <!-- 生成模式选择 -->
            <Card title="生成模式">
              <div class="flex gap-4">
                <Button
                  :type="codeGenMode === 'step' ? 'primary' : 'default'"
                  @click="codeGenMode = 'step'"
                >
                  分步模式
                </Button>
                <Button
                  :type="codeGenMode === 'oneClick' ? 'primary' : 'default'"
                  @click="codeGenMode = 'oneClick'"
                >
                  一键生成
                </Button>
              </div>
              <div class="mt-3 text-sm text-gray-600 dark:text-gray-400">
                <div v-if="codeGenMode === 'step'">
                  <strong>分步模式:</strong>
                  可自定义每一步生成内容，适合需要精细控制的场景。
                </div>
                <div v-if="codeGenMode === 'oneClick'">
                  <strong>一键生成:</strong>
                  自动生成前后端所有代码，后端直接写入文件，前端提供ZIP下载。
                </div>
              </div>
            </Card>

            <!-- 一键生成模式 -->
            <Card
              v-if="codeGenMode === 'oneClick' && selectedExistingTable"
              title="一键生成所有代码"
            >
              <div class="flex flex-col gap-4">
                <div class="text-sm text-gray-600 dark:text-gray-400">
                  已选择表: <span class="font-medium">{{ codeTableName }}</span>
                  <br />
                  模块名:
                  <span class="font-medium">{{
                    codeModuleName || '(未设置)'
                  }}</span>
                </div>
                <div>
                  <Button
                    type="primary"
                    :loading="codeIsOneClickGenerating"
                    :disabled="!codeModuleName.trim()"
                    @click="codeHandleOneClickGenerate"
                  >
                    {{
                      codeIsOneClickGenerating
                        ? '正在生成...'
                        : '一键生成所有代码'
                    }}
                  </Button>
                </div>
                <div
                  v-if="codeOneClickResult?.currentStep"
                  class="text-sm text-blue-600 dark:text-blue-400"
                >
                  当前步骤: {{ codeOneClickResult.currentStep }}
                </div>
                <div
                  v-if="codeOneClickResult"
                  class="rounded-md border border-gray-200 p-3 text-sm dark:border-gray-700"
                >
                  <div class="mb-2 font-medium">生成结果:</div>
                  <div
                    :class="[
                      codeOneClickResult.success
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400',
                    ]"
                  >
                    {{ codeOneClickResult.message }}
                  </div>
                  <div
                    v-if="codeOneClickResult.error"
                    class="mt-2 text-sm text-red-500 dark:text-red-400"
                  >
                    <pre class="whitespace-pre-wrap">{{
                      codeOneClickResult.error
                    }}</pre>
                  </div>
                  <div
                    v-if="
                      codeOneClickResult.backendFiles &&
                      codeOneClickResult.backendFiles.length > 0
                    "
                    class="mt-3"
                  >
                    <div class="mb-1 font-medium">
                      后端生成的文件 ({{
                        codeOneClickResult.backendFiles.length
                      }}
                      个):
                    </div>
                    <ul class="max-h-40 list-disc overflow-y-auto pl-5">
                      <li
                        v-for="file in codeOneClickResult.backendFiles"
                        :key="file.filePath"
                        class="text-sm text-gray-600 dark:text-gray-400"
                      >
                        {{ file.filePath }}
                      </li>
                    </ul>
                  </div>
                  <div
                    v-if="
                      codeOneClickResult.skippedFiles &&
                      codeOneClickResult.skippedFiles.length > 0
                    "
                    class="mt-3"
                  >
                    <div
                      class="mb-1 font-medium text-yellow-600 dark:text-yellow-400"
                    >
                      跳过的已存在文件:
                    </div>
                    <ul class="max-h-40 list-disc overflow-y-auto pl-5">
                      <li
                        v-for="fileName in codeOneClickResult.skippedFiles"
                        :key="fileName"
                        class="text-sm text-yellow-600 dark:text-yellow-400"
                      >
                        {{ fileName }}
                      </li>
                    </ul>
                  </div>
                  <div v-if="codeOneClickResult.frontendZipData" class="mt-4">
                    <Button type="primary" @click="codeOneClickDownloadZip">
                      下载前端代码 ZIP
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            <!-- 分步模式 -->
            <Card
              v-if="codeGenMode === 'step' && codeCanGenerateGorm"
              title="步骤 1: 生成 GORM 模型代码"
            >
              <div class="flex flex-col gap-4">
                <div class="text-sm text-gray-600 dark:text-gray-400">
                  生成数据库表对应的 GORM 模型和查询代码
                </div>
                <div>
                  <Button
                    type="primary"
                    :loading="codeIsGeneratingGorm"
                    @click="codeHandleGenerateGorm"
                  >
                    {{ $t('system.gen.btnGenerateGorm') }}
                  </Button>
                </div>
                <div
                  v-if="codeGenerateGormResult"
                  class="rounded-md p-3 text-sm"
                >
                  <div class="mb-1 font-medium">GORM 生成结果:</div>
                  <div
                    :class="[
                      codeGenerateGormResult.success
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400',
                    ]"
                  >
                    {{ codeGenerateGormResult.message }}
                  </div>
                  <div
                    v-if="codeGenerateGormResult.error"
                    class="mt-2 text-sm text-red-500 dark:text-red-400"
                  >
                    <pre class="whitespace-pre-wrap">{{
                      codeGenerateGormResult.error
                    }}</pre>
                  </div>
                </div>
              </div>
            </Card>

            <Card
              v-if="codeGenMode === 'step' && codeCanGenerateCode"
              title="步骤 2: 生成 Service 和 API 代码"
            >
              <div class="flex flex-col gap-4">
                <div class="text-sm text-gray-600 dark:text-gray-400">
                  已完成 GORM 代码生成，可以继续生成 Service 和 API 代码
                </div>
                <div>
                  <Button
                    type="primary"
                    :loading="codeIsGeneratingCode"
                    @click="codeHandleGenerateCode"
                  >
                    生成 Service 和 API 代码
                  </Button>
                </div>
                <div
                  v-if="codeGenerateCodeResult"
                  class="rounded-md p-3 text-sm"
                >
                  <div class="mb-1 font-medium">代码生成结果:</div>
                  <div
                    :class="[
                      codeGenerateCodeResult.success
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400',
                    ]"
                  >
                    {{ codeGenerateCodeResult.message }}
                  </div>
                  <div
                    v-if="codeGenerateCodeResult.error"
                    class="mt-2 text-sm text-red-500 dark:text-red-400"
                  >
                    <pre class="whitespace-pre-wrap">{{
                      codeGenerateCodeResult.error
                    }}</pre>
                  </div>
                  <div
                    v-if="
                      codeGenerateCodeResult.files &&
                      codeGenerateCodeResult.files.length > 0
                    "
                    class="mt-3"
                  >
                    <div class="mb-1 font-medium">生成的文件:</div>
                    <ul class="list-disc pl-5">
                      <li
                        v-for="file in codeGenerateCodeResult.files"
                        :key="file.fileName"
                        class="text-gray-600 dark:text-gray-400"
                      >
                        {{ file.filePath }}
                      </li>
                    </ul>
                  </div>
                  <div
                    v-if="
                      codeGenerateCodeResult.skippedFiles &&
                      codeGenerateCodeResult.skippedFiles.length > 0
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
                        v-for="fileName in codeGenerateCodeResult.skippedFiles"
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

            <Card
              v-if="codeGenMode === 'step' && codeCanGenerateFrontend"
              title="步骤 3: 生成前端代码模板"
            >
              <div class="flex flex-col gap-4">
                <div class="text-sm text-gray-600 dark:text-gray-400">
                  前后端分离开发，生成前端代码模板（GORM 模型需已存在）
                </div>
                <div class="flex gap-2">
                  <Button
                    type="primary"
                    :loading="codeIsGeneratingFrontend"
                    @click="codeHandleGenerateFrontend(false)"
                  >
                    生成并预览
                  </Button>
                  <Button
                    type="primary"
                    :loading="codeIsGeneratingFrontend"
                    @click="codeHandleGenerateFrontend(true)"
                  >
                    生成并下载 ZIP
                  </Button>
                </div>
                <div
                  v-if="codeGenerateFrontendResult"
                  class="rounded-md p-3 text-sm"
                >
                  <div class="mb-1 font-medium">前端代码生成结果:</div>
                  <div
                    :class="[
                      codeGenerateFrontendResult.success
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400',
                    ]"
                  >
                    {{ codeGenerateFrontendResult.message }}
                  </div>
                  <div
                    v-if="codeGenerateFrontendResult.error"
                    class="mt-2 text-sm text-red-500 dark:text-red-400"
                  >
                    <pre class="whitespace-pre-wrap">{{
                      codeGenerateFrontendResult.error
                    }}</pre>
                  </div>
                  <div
                    v-if="
                      codeGenerateFrontendResult.files &&
                      codeGenerateFrontendResult.files.length > 0
                    "
                    class="mt-3"
                  >
                    <div class="mb-1 font-medium">生成的文件:</div>
                    <ul class="list-disc pl-5">
                      <li
                        v-for="file in codeGenerateFrontendResult.files"
                        :key="file.fileName"
                        class="text-gray-600 dark:text-gray-400"
                      >
                        {{ file.filePath }}
                      </li>
                    </ul>
                  </div>
                  <div v-if="codeGenerateFrontendResult.zipData" class="mt-3">
                    <Button type="primary" @click="codeDownloadZip">
                      下载 ZIP 文件
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            <Card
              v-if="codeGenMode === 'step' && codeCanCreateApi"
              title="步骤 4: 生成数据库 API"
            >
              <div class="flex flex-col gap-4">
                <div class="text-sm text-gray-600 dark:text-gray-400">
                  已完成 Service 和 API 代码生成，可继续生成 API SQL
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
                  <Checkbox v-model:checked="codeApiExecuteSql">
                    是否直接执行 SQL（不勾选只生成 SQL 显示）
                  </Checkbox>
                </div>
                <div>
                  <Button
                    type="primary"
                    :loading="codeIsCreatingApi"
                    @click="codeHandleCreateApi"
                  >
                    生成 API SQL
                  </Button>
                </div>
                <div v-if="codeCreateApiResult" class="rounded-md p-3 text-sm">
                  <div class="mb-1 font-medium">API 生成结果:</div>
                  <div
                    :class="[
                      codeCreateApiResult.success
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400',
                    ]"
                  >
                    {{ codeCreateApiResult.message }}
                  </div>
                  <div
                    v-if="codeCreateApiResult.error"
                    class="mt-2 text-sm text-red-500 dark:text-red-400"
                  >
                    <pre class="whitespace-pre-wrap">{{
                      codeCreateApiResult.error
                    }}</pre>
                  </div>
                  <div
                    v-if="
                      codeCreateApiResult.apiIds &&
                      codeCreateApiResult.apiIds.length > 0
                    "
                    class="mt-3"
                  >
                    <div class="mb-1 font-medium">创建的 API 数量:</div>
                    <span class="text-gray-600 dark:text-gray-400">
                      {{ codeCreateApiResult.apiIds.length }} 个
                    </span>
                  </div>
                  <div v-if="codeCreateApiResult.sql" class="mt-3">
                    <div
                      class="mb-1 flex items-center justify-between font-medium"
                    >
                      <span>API SQL:</span>
                      <Button
                        type="link"
                        size="small"
                        :loading="codeIsCopying"
                        @click="codeCopyToClipboard(codeCreateApiResult.sql!)"
                      >
                        {{ codeIsCopying ? '复制中' : '复制' }}
                      </Button>
                    </div>
                    <pre
                      class="overflow-x-auto whitespace-pre-wrap rounded-md bg-gray-900 p-4 text-sm text-green-400"
                    ><code>{{ codeCreateApiResult.sql }}</code></pre>
                  </div>
                </div>
              </div>
            </Card>

            <Card
              v-if="codeGenMode === 'step' && codeCanCreateMenu"
              title="步骤 5: 生成数据库菜单"
            >
              <div class="flex flex-col gap-4">
                <div class="text-sm text-gray-600 dark:text-gray-400">
                  已完成前端代码生成，可继续生成菜单 SQL（默认不执行）
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
                  <Checkbox v-model:checked="codeMenuExecuteSql">
                    是否直接执行 SQL（不勾选只生成 SQL 显示）
                  </Checkbox>
                </div>
                <div>
                  <Button
                    type="primary"
                    :loading="codeIsCreatingMenu"
                    @click="codeHandleCreateMenu"
                  >
                    生成菜单 SQL
                  </Button>
                </div>
                <div v-if="codeCreateMenuResult" class="rounded-md p-3 text-sm">
                  <div class="mb-1 font-medium">菜单生成结果:</div>
                  <div
                    :class="[
                      codeCreateMenuResult.success
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400',
                    ]"
                  >
                    {{ codeCreateMenuResult.message }}
                  </div>
                  <div
                    v-if="codeCreateMenuResult.error"
                    class="mt-2 text-sm text-red-500 dark:text-red-400"
                  >
                    <pre class="whitespace-pre-wrap">{{
                      codeCreateMenuResult.error
                    }}</pre>
                  </div>
                  <div v-if="codeCreateMenuResult.menuId" class="mt-3">
                    <div class="mb-1 font-medium">创建的菜单 ID:</div>
                    <span class="text-gray-600 dark:text-gray-400">
                      {{ codeCreateMenuResult.menuId }}
                    </span>
                  </div>
                  <div v-if="codeCreateMenuResult.sql" class="mt-3">
                    <div
                      class="mb-1 flex items-center justify-between font-medium"
                    >
                      <span>菜单 SQL:</span>
                      <Button
                        type="link"
                        size="small"
                        :loading="codeIsCopying"
                        @click="codeCopyToClipboard(codeCreateMenuResult.sql!)"
                      >
                        {{ codeIsCopying ? '复制中' : '复制' }}
                      </Button>
                    </div>
                    <pre
                      class="overflow-x-auto whitespace-pre-wrap rounded-md bg-gray-900 p-4 text-sm text-green-400"
                    ><code>{{ codeCreateMenuResult.sql }}</code></pre>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </Tabs.TabPane>
      </Tabs>
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
