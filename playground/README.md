# fiber-crud UI - 开发指南

## 项目概述

这是基于 **Vue Vben Admin 5.x** 的后台管理系统前端项目，使用 Ant Design Vue 作为 UI 框架。

- **技术栈**: Vue 3 + TypeScript + Vite + Ant Design Vue + Tailwind CSS
- **状态管理**: Pinia
- **路由**: Vue Router
- **表格组件**: VXE-Table
- **表单组件**: Vben Form (基于 Ant Design Vue 封装)

---

## 快速开始

### 环境要求

- Node.js >= 18
- pnpm >= 8

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm dev:play
```

访问地址: http://localhost:5173/ (或控制台显示的端口)

### 构建生产版本

```bash
pnpm build:play
```

构建产物位于 `dist/` 目录。

### 环境变量配置

开发环境变量文件: `.env.development`
生产环境变量文件: `.env.production`

关键变量:
```env
# 应用基础路径
VITE_BASE=/

# API 服务地址
VITE_GLOB_API_URL=http://localhost:8080

# API 前缀
VITE_GLOB_API_URL_PREFIX=/api
```

---

## 目录结构

```
playground/src/
├── api/                    # API 接口定义
│   ├── core/              # 核心 API (认证、菜单、用户等)
│   ├── system/            # 系统管理 API
│   │   ├── user.ts        # 用户管理
│   │   ├── role.ts        # 角色管理
│   │   ├── dept.ts        # 部门管理
│   │   ├── menu.ts        # 菜单管理
│   │   ├── api.ts         # API 管理
│   │   ├── notice.ts      # 公告管理
│   │   ├── log.ts         # 日志管理
│   │   ├── casbin.ts      # 权限管理
│   │   └── ws.ts          # WebSocket
│   ├── request.ts         # HTTP 请求封装
│   └── common_type.ts     # 通用类型定义
│
├── views/                  # 页面视图
│   ├── system/            # 系统管理页面
│   │   ├── user/          # 用户管理
│   │   │   ├── data.ts    # 表单/表格配置
│   │   │   ├── list.vue   # 列表页面
│   │   │   └── modules/
│   │   │       ├── form.vue    # 新建/编辑表单
│   │   │       └── detail.vue  # 详情预览
│   │   ├── role/          # 角色管理 (结构同上)
│   │   ├── dept/          # 部门管理 (树形结构)
│   │   ├── menu/          # 菜单管理
│   │   ├── api/           # API 管理
│   │   ├── notice/        # 公告管理
│   │   ├── log/           # 日志管理
│   │   ├── casbin/        # 权限管理
│   │   └── ws/            # WebSocket 测试
│   ├── _core/             # 核心页面 (登录、个人中心等)
│   ├── demos/             # 功能演示
│   └── examples/          # 组件示例
│
├── utils/                  # 工具函数
│   ├── value-format.ts    # 值格式化
│   ├── pager.ts           # 分页配置
│   ├── dialog.ts          # 对话框封装
│   ├── object.ts          # 对象处理
│   ├── message-util.ts    # 消息工具
│   └── token-util.ts      # Token 工具
│
├── adapter/                # 组件适配器
│   ├── form.ts            # 表单适配器
│   └── vxe-table.ts       # 表格适配器
│
├── router/                 # 路由配置
├── store/                  # 状态管理
├── layouts/                # 布局组件
├── locales/                # 国际化
└── hooks/                  # 自定义 Hooks
```

---

## 开发规范

### 1. 新增页面流程

添加新的管理页面需要以下步骤:

#### 步骤 1: 定义 API

在 `playground/src/api/system/` 下创建新文件:

```typescript
// api/system/xxx.ts
import { requestClient } from '#/api/request';

export namespace SystemXxxApi {
  export interface SystemXxx {
    id: number;
    name: string;
    status: number;
    // ... 其他字段
  }
}

async function getXxxList(params: Recordable<any>) {
  return requestClient.get('/system/xxx/page', { params });
}

async function getXxxDetail(id: number) {
  return requestClient.get(`/system/xxx/${id}`);
}

async function createXxx(data: Omit<SystemXxxApi.SystemXxx, 'id'>) {
  return requestClient.post('/system/xxx', data);
}

async function updateXxx(id: number, data: Omit<SystemXxxApi.SystemXxx, 'id'>) {
  return requestClient.put(`/system/xxx/${id}`, data);
}

async function deleteXxx(id: number) {
  return requestClient.delete(`/system/xxx/${id}`);
}

export { getXxxList, getXxxDetail, createXxx, updateXxx, deleteXxx };
```

#### 步骤 2: 创建页面组件

在 `playground/src/views/system/` 下创建目录:

```
views/system/xxx/
├── data.ts              # 表单 schema、表格列定义
├── list.vue             # 列表页面
└── modules/
    ├── form.vue         # 新建/编辑表单
    └── detail.vue       # 详情预览
```

#### 步骤 3: 配置路由

在 `playground/src/router/routes/modules/system.ts` 中添加路由配置。

#### 步骤 4: 后端配置

1. 创建 menu (菜单)
2. 分配 API 权限
3. 分配给角色

---

### 2. 数据配置 (data.ts) 规范

每个模块的 `data.ts` 应包含以下内容:

#### 表单 Schema

```typescript
// 表单字段定义
export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      fieldName: 'id',
      component: 'Input',
      label: $t('system.xxx.id'),
      disabled: true,
    },
    {
      fieldName: 'name',
      component: 'Input',
      label: $t('system.xxx.name'),
      rules: z.string().min(2, $t('validation.minLength', [2])),
    },
    {
      fieldName: 'status',
      component: 'RadioGroup',
      label: $t('system.xxx.status'),
      defaultValue: 1,
      componentProps: {
        options: [
          { label: $t('common.enabled'), value: 1 },
          { label: $t('common.disabled'), value: 0 },
        ],
        optionType: 'button',
        buttonStyle: 'solid',
      },
    },
  ];
}
```

#### 字段控制函数

```typescript
// 编辑时需要调整的字段 (如禁用)
export function formFieldsToAdjustForEdit(): VbenFormSchema[] {
  return [
    {
      fieldName: 'code',
      component: 'Input',
      label: $t('system.xxx.code'),
      componentProps: { disabled: true },
    },
  ];
}

// 创建时需要移除的字段
export function formFieldsToRemoveForCreate(): string[] {
  return ['id'];
}

// 编辑时需要移除的字段
export function formFieldsToRemoveForEdit(): string[] {
  return ['password'];
}

// 预览时需要移除的字段
export function formFieldsToRemoveForPreview(): string[] {
  return ['password'];
}
```

#### 搜索表单 Schema

```typescript
export function useGridFormSchema(): VbenFormSchema[] {
  return [
    {
      fieldName: 'name',
      component: 'Input',
      label: $t('system.xxx.name'),
    },
    {
      fieldName: 'status',
      component: 'Select',
      label: $t('system.xxx.status'),
      componentProps: {
        allowClear: true,
        options: [
          { label: $t('common.enabled'), value: 1 },
          { label: $t('common.disabled'), value: 0 },
        ],
      },
    },
    {
      fieldName: 'createdAtRangeMs',
      component: 'RangePicker',
      label: $t('common.createdAt'),
      componentProps: {
        valueFormat: 'x',
        showTime: true,
      },
    },
  ];
}
```

#### 表格列定义

```typescript
export function useColumns<T>(
  onActionClick: OnActionClickFn<T>,
  onPreview: (row: any) => void,
  onStatusChange?: (newStatus: any, row: T) => PromiseLike<boolean | undefined>,
): VxeTableGridOptions['columns'] {
  return [
    // 预览链接列
    usePreviewLink(
      {
        field: 'id',
        title: $t('common.id'),
        width: 90,
        sortable: true,
      },
      onPreview,
    ),
    // 普通列
    {
      field: 'name',
      title: $t('system.xxx.name'),
      width: 200,
      sortable: true,
    },
    // 状态列 (带开关)
    {
      field: 'status',
      title: $t('system.xxx.status'),
      width: 100,
      sortable: true,
      cellRender: {
        attrs: { beforeChange: onStatusChange },
        name: onStatusChange ? 'CellSwitch' : 'CellTag',
      },
    },
    // 时间列 (格式化)
    {
      field: 'createdAt',
      title: $t('common.createdAt'),
      width: 160,
      sortable: true,
      formatter: ({ cellValue }) => formatBackendTime(cellValue),
    },
    // 创建人列
    useUserCoreColumn(
      {
        field: 'createdBy',
        title: $t('common.createdBy'),
        width: 120,
      },
      userCoreMapRef,
    ),
    // 操作列
    {
      field: 'operation',
      title: $t('system.xxx.operation'),
      width: 130,
      fixed: 'right',
      align: 'center',
      cellRender: {
        name: 'CellOperation',
        attrs: {
          nameField: 'name',
          nameTitle: $t('system.xxx.module'),
          onClick: onActionClick,
        },
        options: [
          'edit',
          {
            code: 'delete',
            disabled: (row: any) => !!(row.children?.length > 0),
          },
        ],
      },
    },
  ];
}
```

---

### 3. 列表页面 (list.vue) 规范

```vue
<script lang="ts" setup>
import type { OnActionClickParams, VxeTableGridOptions } from '#/adapter/vxe-table';
import type { PageParams } from '#/api/request';
import type { SystemXxxApi } from '#/api/system/xxx';

import { Page, useVbenDrawer } from '@vben/common-ui';
import { Plus } from '@vben/icons';
import { Button, message } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { doPageQuery } from '#/api/request';
import { 
  deleteXxx, 
  getXxxList, 
  updateXxxStatus 
} from '#/api/system/xxx';
import { $t } from '#/locales';
import { confirmDialog } from '#/utils/dialog';
import { usePagerConfig } from '#/utils/pager';

import { useColumns, useGridFormSchema, userCoreMapRef } from './data';
import Form from './modules/form.vue';
import Detail from './modules/detail.vue';

// 1. 创建抽屉
const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: Form,
  destroyOnClose: true,
});
const [DetailDrawer, detailDrawerApi] = useVbenDrawer({
  connectedComponent: Detail,
  destroyOnClose: true,
});

// 2. 创建表格
const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useGridFormSchema(),
    submitOnChange: true,
  },
  gridOptions: {
    columns: useColumns(onActionClick, onPreview, onStatusChange),
    height: 'auto',
    pagerConfig: usePagerConfig(),
    proxyConfig: {
      ajax: {
        query: async (params: PageParams, formValues) => {
          const result = await doPageQuery(getXxxList, params, formValues);
          userCoreMapRef.value = result.userCoreMap;
          return result;
        },
      },
    },
    rowConfig: { keyField: 'id' },
    toolbarConfig: {
      custom: true,
      export: false,
      refresh: true,
      search: true,
      zoom: true,
    },
    sortConfig: { remote: true },
    remote: { sort: true },
    onSortChange() { gridApi.query(); },
  } as VxeTableGridOptions<SystemXxxApi.SystemXxx>,
});

// 3. 操作按钮处理
function onActionClick(e: OnActionClickParams<SystemXxxApi.SystemXxx>) {
  switch (e.code) {
    case 'delete': onDelete(e.row); break;
    case 'edit': onEdit(e.row); break;
  }
}

// 4. 状态切换处理
async function onStatusChange(
  newStatus: number,
  row: SystemXxxApi.SystemXxx,
) {
  const status: Recordable<string> = {
    0: $t('common.disabled'),
    1: $t('common.enabled'),
  };
  try {
    await confirmDialog(
      $t('ui.confirm.statusChange', [row.name, status[newStatus]]),
      $t('ui.confirm.title'),
    );
    await updateXxxStatus({ id: row.id, status: newStatus });
    onRefresh();
    return true;
  } catch {
    return false;
  }
}

// 5. CRUD 操作
function onEdit(row: SystemXxxApi.SystemXxx) {
  formDrawerApi.setData(row).open();
}

function onDelete(row: SystemXxxApi.SystemXxx) {
  const hideLoading = message.loading({
    content: $t('ui.actionMessage.deleting', [row.name]),
    duration: 0,
    key: 'action_process_msg',
  });
  deleteXxx(row.id)
    .then(() => {
      message.success({
        content: $t('ui.actionMessage.deleteSuccess', [row.name]),
        key: 'action_process_msg',
      });
      onRefresh();
    })
    .catch(() => {
      hideLoading();
    });
}

function onCreate() {
  formDrawerApi.setData({}).open();
}

function onPreview(row: any) {
  detailDrawerApi.setData(row).open();
}

function onRefresh() {
  gridApi.query();
}
</script>

<template>
  <Page auto-content-height>
    <FormDrawer @success="onRefresh" />
    <DetailDrawer />
    <Grid :table-title="$t('system.xxx.list')">
      <template #toolbar-tools>
        <Button type="primary" @click="onCreate">
          <Plus class="size-5" />
          {{ $t('ui.actionTitle.create', [$t('system.xxx.module')]) }}
        </Button>
      </template>
    </Grid>
  </Page>
</template>
```

---

### 4. 表单组件 (form.vue) 规范

```vue
<script lang="ts" setup>
import type { SystemXxxApi } from '#/api/system/xxx';

import { computed, nextTick, ref } from 'vue';
import { useVbenDrawer } from '@vben/common-ui';
import { useVbenForm } from '#/adapter/form';

import { 
  createXxx, 
  preCreateXxx, 
  preUpdateXxx, 
  updateXxx 
} from '#/api/system/xxx';
import { $t } from '#/locales';
import { extractTreeValue } from '#/utils/value-format';

import {
  formFieldsToAdjustForEdit,
  formFieldsToRemoveForCreate,
  formFieldsToRemoveForEdit,
  useFormSchema,
} from '../data';

const emits = defineEmits(['success']);

const formData = ref<SystemXxxApi.SystemXxx>();
const id = ref();
const loadingData = ref(false);

// 1. 创建表单
const [Form, formApi] = useVbenForm({
  schema: useFormSchema(),
  showDefaultActions: false,
});

// 2. 创建抽屉
const [Drawer, drawerApi] = useVbenDrawer({
  destroyOnClose: true,
  async onConfirm() {
    const { valid } = await formApi.validate();
    if (!valid) return;
    
    const values = await formApi.getValues();
    extractTreeValue(values, ['deptIds', 'roleCodes']);

    drawerApi.lock();
    (id.value ? updateXxx(id.value, values) : createXxx(values))
      .then(() => {
        emits('success');
        drawerApi.close();
      })
      .catch(() => {
        drawerApi.unlock();
      });
  },
  async onOpenChange(isOpen) {
    if (isOpen) {
      const data = drawerApi.getData<SystemXxxApi.SystemXxx>();
      await formApi.resetForm();

      const isEdit = data && data.id;
      if (isEdit) {
        formData.value = data;
        id.value = data.id;
      } else {
        id.value = undefined;
      }

      if (isEdit) {
        formApi.updateSchema(formFieldsToAdjustForEdit());
        await formApi.removeSchemaByFields(formFieldsToRemoveForEdit());
      } else {
        await formApi.removeSchemaByFields(formFieldsToRemoveForCreate());
      }

      await nextTick();

      if (isEdit) {
        await formApi.setValues(data);
        await loadForUpdate(data.id);
      } else {
        await loadForCreate();
      }
    }
  },
});

// 3. 预加载数据
async function loadForCreate() {
  loadingData.value = true;
  try {
    const { options } = await preCreateXxx();
    updateFormOptions(options);
  } finally {
    loadingData.value = false;
  }
}

async function loadForUpdate(xxxId: number) {
  loadingData.value = true;
  try {
    const { options, currentValues } = await preUpdateXxx(xxxId);
    updateFormOptions(options);
    await nextTick();
    // 设置当前值
  } finally {
    loadingData.value = false;
  }
}

function updateFormOptions(options: any) {
  formApi.updateSchema([
    // 更新下拉选项等
  ]);
}

const getDrawerTitle = computed(() => {
  return formData.value?.id
    ? $t('common.edit', $t('system.xxx.module'))
    : $t('common.create', $t('system.xxx.module'));
});
</script>

<template>
  <Drawer :title="getDrawerTitle">
    <Form />
  </Drawer>
</template>
```

---

## 常用工具函数

### 值格式化

```typescript
import { formatBackendTime, formatJsonObj, extractTreeValue } from '#/utils/value-format';

// 格式化后端时间
formatBackendTime('2025-10-04T00:51:59.575623+08:00');
// 输出: "2025-10-04 00:51:59 +08"

// JSON 对象转字符串
formatJsonObj({ key: 'value' });
// 输出: "{\n  \"key\": \"value\"\n}"

// 提取 TreeSelect 值 (对象数组转 id 数组)
extractTreeValue(formData, ['deptIds', 'roleCodes']);
```

### 分页配置

```typescript
import { usePagerConfig, useNeatPagerConfig, useFullPagerConfig, useDisabledPagerConfig } from '#/utils/pager';

// 默认精简分页
usePagerConfig();

// 完整版分页
useFullPagerConfig();

// 禁用分页 (树形表格)
useDisabledPagerConfig();
```

### 对话框确认

```typescript
import { confirmDialog } from '#/utils/dialog';

try {
  await confirmDialog('确定要删除吗？', '确认删除');
  // 执行删除操作
} catch {
  // 用户取消
}
```

### 对象处理

```typescript
import { checkAllFieldsEmpty, removeEmptyFields } from '#/utils/object';

// 检查对象是否所有字段为空
checkAllFieldsEmpty({ name: '', age: null }); // true

// 移除空字符串字段
removeEmptyFields({ name: '', age: 18 }); // { age: 18 }
```

---

## 组件使用指南

### Vben Form

表单组件基于 Ant Design Vue 封装，支持动态 schema。

```typescript
import { useVbenForm, z } from '#/adapter/form';

const [Form, formApi] = useVbenForm({
  schema: [
    {
      fieldName: 'username',
      component: 'Input',
      label: '用户名',
      rules: z.string().min(3, '用户名至少3个字符'),
    },
    {
      fieldName: 'status',
      component: 'RadioGroup',
      label: '状态',
      defaultValue: 1,
      componentProps: {
        options: [
          { label: '启用', value: 1 },
          { label: '禁用', value: 0 },
        ],
      },
    },
  ],
});

// 表单操作
await formApi.validate();      // 验证
await formApi.getValues();     // 获取值
await formApi.setValues(data); // 设置值
await formApi.resetForm();     // 重置
formApi.updateSchema(newSchema); // 更新 schema
await formApi.removeSchemaByFields(['field1']); // 移除字段
```

### VXE-Table

表格组件支持远程数据、分页、排序等功能。

```typescript
import { useVbenVxeGrid } from '#/adapter/vxe-table';

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions: {
    schema: searchFormSchema,
    submitOnChange: true,
  },
  gridOptions: {
    columns: tableColumns,
    pagerConfig: usePagerConfig(),
    proxyConfig: {
      ajax: {
        query: async (params, formValues) => {
          return doPageQuery(apiFunc, params, formValues);
        },
      },
    },
    sortConfig: { remote: true },
    remote: { sort: true },
  },
});

// 表格操作
gridApi.query();      // 刷新数据
gridApi.reload();     // 重新加载
```

### Drawer / Modal

抽屉和模态框组件用于表单和详情页。

```typescript
import { useVbenDrawer, useVbenModal } from '@vben/common-ui';

// Drawer
const [Drawer, drawerApi] = useVbenDrawer({
  connectedComponent: FormComponent,
  destroyOnClose: true,
  async onConfirm() {
    // 确认回调
  },
  async onOpenChange(isOpen) {
    // 打开/关闭回调
  },
});

// Modal
const [Modal, modalApi] = useVbenModal({
  connectedComponent: FormComponent,
  destroyOnClose: true,
});

// API
drawerApi.setData(data).open();  // 设置数据并打开
drawerApi.close();                // 关闭
drawerApi.lock();                 // 锁定 (提交中禁用)
drawerApi.unlock();               // 解锁
```

---

## 国际化 (i18n)

### 使用方式

```typescript
import { $t } from '#/locales';

// 基础翻译
$t('system.user.id');

// 带参数
$t('ui.formRules.minLength', [$t('system.user.username'), 3]);
```

### 语言文件位置

```
playground/src/locales/langs/
├── zh-CN/
│   ├── common.json
│   ├── system.json
│   ├── ui.json
│   └── ...
└── en-US/
    └── ...
```

### 新增翻译

在对应语言的 JSON 文件中添加:

```json
{
  "system": {
    "xxx": {
      "module": "模块名称",
      "list": "列表",
      "id": "ID",
      "name": "名称"
    }
  }
}
```

---

## 分页与排序

### 后端期望参数

| 参数 | 类型 | 说明 |
|------|------|------|
| page | number | 页码，从 1 开始 |
| pageSize | number | 每页条数 |
| sortBy | string | 排序字段名 (camelCase) |
| sortDesc | boolean | 是否降序 |

### 自动转换

使用 `doPageQuery` 自动转换 VXE-Table 参数:

```typescript
import { doPageQuery } from '#/api/request';

// 在 proxyConfig.ajax.query 中
query: async (params: PageParams, formValues) => {
  // 自动转换:
  // params.page.currentPage -> page
  // params.page.pageSize -> pageSize
  // params.sort.field -> sortBy
  // params.sort.order === 'desc' -> sortDesc
  return doPageQuery(getListApi, params, formValues);
}
```

---

## 部署指南

### Caddy 代理配置

#### 开发环境

1. 修改 `playground/.env.development`:
```env
VITE_BASE=/ui
```

2. `Caddyfile.fiber-crud` 配置:
```
import UI_DEV
```

3. 访问: http://localhost/ui/

#### 生产环境

1. 修改 `playground/.env.production`:
```env
VITE_BASE=/ui
```

2. 构建:
```bash
pnpm build:play
```

3. 部署到 `/var/www/fiber-crud-ui/`

4. `Caddyfile.fiber-crud` 配置:
```
import UI_PROD
```

5. 访问: http://localhost/ui/

---

## 常见问题

### 1. 表单验证不生效

检查:
- 字段名是否匹配
- rules 是否正确定义
- 是否使用了 `z.string()` 等 Zod 方法

### 2. 表格数据不显示

检查:
- proxyConfig.ajax.query 是否正确配置
- 返回数据格式是否符合预期
- rowConfig.keyField 是否设置正确

### 3. TreeSelect 值提交异常

使用 `extractTreeValue` 转换:

```typescript
const values = await formApi.getValues();
extractTreeValue(values, ['deptIds', 'roleCodes']);
```

### 4. 时间格式显示异常

使用 `formatBackendTime` 格式化:

```typescript
formatter: ({ cellValue }) => formatBackendTime(cellValue)
```

### 5. 状态切换不生效

检查:
- onStatusChange 函数是否返回 Promise
- cellRender.name 是否正确设置为 'CellSwitch'

---

## 最佳实践

1. **类型安全**: 尽量避免使用 `any`，使用具体类型或泛型
2. **错误处理**: 统一使用 try-catch 或 Promise 链式处理
3. **异步处理**: 优先使用 async/await 而非 .then() 链式
4. **代码复用**: 提取通用逻辑到 composables 或 utils
5. **国际化**: 所有用户可见文本使用 `$t()` 翻译
6. **命名规范**: 遵循项目现有命名风格
7. **注释**: 复杂逻辑添加必要注释
