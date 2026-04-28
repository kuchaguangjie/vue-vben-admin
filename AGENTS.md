# AGENTS - AI 开发助手指南

## 关于你 (AI)

- 你是一个全栈开发专家，特别擅长 Vue 3 / TypeScript / Vite / pnpm 技术栈
- 你熟悉 Vue Vben Admin 5.x 框架的架构和最佳实践
- 你写的代码质量高、简洁、符合项目规范，且不啰嗦
- 你能够理解代码模式并提供重构建议

## 关于项目

### 项目概述

这是一个基于 **Vue Vben Admin 5.x** 的后台管理系统前端项目，项目名为 `fiber-crud`。

- **主分支**: `main` - 保持与 vben 官方同步，用于升级
- **开发分支**: `fiber-crud` - 主要修改 `playground/` 子目录
- **UI 框架**: Ant Design Vue

### 技术栈

- **框架**: Vue 3 + TypeScript
- **构建工具**: Vite 5
- **包管理**: pnpm
- **UI 库**: Ant Design Vue
- **状态管理**: Pinia
- **路由**: Vue Router
- **表格组件**: VXE-Table
- **表单组件**: Vben Form (基于 Ant Design Vue 封装)
- **HTTP 客户端**: Axios (封装在 `@vben/request`)
- **样式**: Tailwind CSS + SCSS

### 目录结构

```
playground/                    # 主应用目录
├── src/
│   ├── api/                   # API 接口定义
│   │   ├── core/             # 核心 API (认证、菜单、用户等)
│   │   ├── system/           # 系统管理 API (用户、角色、部门、菜单等)
│   │   ├── examples/         # 示例 API
│   │   ├── request.ts        # HTTP 请求封装
│   │   └── common_type.ts    # 通用类型定义
│   ├── views/                 # 页面视图
│   │   ├── system/           # 系统管理页面
│   │   │   ├── user/         # 用户管理
│   │   │   ├── role/         # 角色管理
│   │   │   ├── dept/         # 部门管理
│   │   │   ├── menu/         # 菜单管理
│   │   │   ├── api/          # API 管理
│   │   │   └── ...
│   │   ├── _core/            # 核心页面 (登录、个人中心等)
│   │   ├── demos/            # 功能演示
│   │   └── examples/         # 组件示例
│   ├── utils/                 # 工具函数
│   │   ├── value-format.ts   # 值格式化 (时间、JSON 等)
│   │   ├── pager.ts          # 分页配置
│   │   ├── dialog.ts         # 对话框封装
│   │   ├── object.ts         # 对象处理
│   │   └── ...
│   ├── adapter/               # 组件适配器
│   │   ├── form.ts           # 表单适配器
│   │   └── vxe-table.ts      # 表格适配器
│   ├── router/                # 路由配置
│   ├── store/                 # 状态管理
│   ├── layouts/               # 布局组件
│   └── locales/               # 国际化
├── .env.development           # 开发环境变量
├── .env.production            # 生产环境变量
└── package.json
```

### 启动命令

```bash
# 安装依赖
pnpm install

# 启动开发服务器 (playground)
pnpm dev:play

# 构建生产版本
pnpm build:play
```

### 环境变量

关键环境变量位置: `playground/.env.development` 和 `playground/.env.production`

- `VITE_BASE`: 应用基础路径 (默认 `/`)
- `VITE_GLOB_API_URL`: API 服务地址
- `VITE_GLOB_API_URL_PREFIX`: API 前缀

## 开发规范与模式

### 1. 页面开发模式

每个系统管理页面通常包含以下文件结构:

```
views/system/{module}/
├── data.ts              # 表单 schema、表格列定义
├── list.vue             # 列表页面 (主入口)
└── modules/
    ├── form.vue         # 新建/编辑表单
    └── detail.vue       # 详情预览
```

### 2. data.ts 标准模式

data.ts 通常导出以下内容:

```typescript
// 1. 表单 schema - 用于创建/编辑表单
export function useFormSchema(): VbenFormSchema[] {
  return [
    {
      fieldName: 'id',
      component: 'Input',
      label: $t('module.id'),
      disabled: true,
    },
    // ... 更多字段
  ];
}

// 2. 编辑时需要调整的字段 (如禁用某些字段)
export function formFieldsToAdjustForEdit(): VbenFormSchema[] {
  return [/* ... */];
}

// 3. 创建时需要移除的字段 (如 id)
export function formFieldsToRemoveForCreate(): string[] {
  return ['id'];
}

// 4. 编辑时需要移除的字段 (如 password)
export function formFieldsToRemoveForEdit(): string[] {
  return ['password'];
}

// 5. 预览时需要移除的字段
export function formFieldsToRemoveForPreview(): string[] {
  return ['password'];
}

// 6. 搜索表单 schema
export function useGridFormSchema(): VbenFormSchema[] {
  return [/* ... */];
}

// 7. 表格列定义
export function useColumns<T>(
  onActionClick: OnActionClickFn<T>,
  onPreview: (row: any) => void,
  onStatusChange?: (newStatus: any, row: T) => PromiseLike<boolean | undefined>,
): VxeTableGridOptions['columns'] {
  return [/* ... */];
}
```

### 3. list.vue 标准模式

```typescript
<script lang="ts" setup>
// 1. 引入组件和 API
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { useVbenDrawer } from '@vben/common-ui';
import { doPageQuery } from '#/api/request';
import { $t } from '#/locales';

// 2. 引入当前模块的 data 和组件
import { useColumns, useGridFormSchema, userCoreMapRef } from './data';
import Form from './modules/form.vue';
import Detail from './modules/detail.vue';

// 3. 创建抽屉/模态框
const [FormDrawer, formDrawerApi] = useVbenDrawer({
  connectedComponent: Form,
  destroyOnClose: true,
});
const [DetailDrawer, detailDrawerApi] = useVbenDrawer({
  connectedComponent: Detail,
  destroyOnClose: true,
});

// 4. 创建表格
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
          const result = await doPageQuery(getList, params, formValues);
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
  },
});

// 5. 操作按钮点击处理
function onActionClick(e: OnActionClickParams) {
  switch (e.code) {
    case 'delete': onDelete(e.row); break;
    case 'edit': onEdit(e.row); break;
  }
}

// 6. 状态切换处理
async function onStatusChange(newStatus: number, row: any) {
  try {
    await confirmDialog(
      `你要将${row.name}的状态切换为【${status[newStatus]}】吗？`,
      '切换状态',
    );
    await updateStatus({ id: row.id, status: newStatus });
    onRefresh();
    return true;
  } catch {
    return false;
  }
}

// 7. CRUD 操作函数
function onEdit(row: any) { formDrawerApi.setData(row).open(); }
function onDelete(row: any) { /* 删除逻辑 */ }
function onCreate() { formDrawerApi.setData({}).open(); }
function onPreview(row: any) { detailDrawerApi.setData(row).open(); }
function onRefresh() { gridApi.query(); }
</script>
```

### 4. API 定义模式

```typescript
// api/system/{module}.ts

// 1. 命名空间定义类型
export namespace SystemModuleApi {
  export interface SystemModule {
    id: number;
    name: string;
    status: number;
    // ...
  }
}

// 2. API 函数
async function getList(params: Recordable<any>) {
  return requestClient.get('/system/module/page', { params });
}

async function getDetail(id: number) {
  return requestClient.get(`/system/module/${id}`);
}

async function create(data: Omit<SystemModuleApi.SystemModule, 'id'>) {
  return requestClient.post('/system/module', data);
}

async function update(id: number, data: Omit<SystemModuleApi.SystemModule, 'id'>) {
  return requestClient.put(`/system/module/${id}`, data);
}

async function remove(id: number) {
  return requestClient.delete(`/system/module/${id}`);
}

// 预加载数据 (用于表单下拉选项等)
async function preCreate() {
  return requestClient.get('/system/module/preCreate');
}

async function preUpdate(id: number) {
  return requestClient.get(`/system/module/preUpdate?id=${id}`);
}

export { getList, getDetail, create, update, remove, preCreate, preUpdate };
```

### 5. 常用组件

#### 容器组件
- **Drawer**: 抽屉，从侧边弹出，大小不变 (大部分 form 和 preview 使用)
- **Modal**: 模态框，从中间弹出，可全屏 (dept 中使用)

#### 创建方式
```typescript
// Drawer
const [Drawer, drawerApi] = useVbenDrawer({
  connectedComponent: Form,
  destroyOnClose: true,
  async onConfirm() {
    // 确认逻辑
  },
  async onOpenChange(isOpen) {
    // 打开/关闭逻辑
  },
});

// Modal
const [Modal, modalApi] = useVbenModal({
  connectedComponent: Form,
  destroyOnClose: true,
});
```

### 6. 分页参数

后端期望的分页参数:
- `page`: 页码，从 1 开始
- `pageSize`: 每页条数
- `sortBy`: 排序字段名 (camelCase，后端需转换为 snake_case)
- `sortDesc`: 是否降序 (boolean, false=asc, true=desc)

使用 `doPageQuery` 自动转换 VXE-Table 的参数格式:
```typescript
import { doPageQuery } from '#/api/request';

// 在 proxyConfig.ajax.query 中使用
query: async (params: PageParams, formValues) => {
  return doPageQuery(getListApi, params, formValues);
}
```

### 7. 常用工具函数

#### 值格式化 (`utils/value-format.ts`)
```typescript
import { formatBackendTime, formatJsonObj, extractTreeValue } from '#/utils/value-format';

// 格式化后端时间字符串 "2025-10-04T00:51:59.575623+08:00" -> "2025-10-04 00:51:59 +08"
formatBackendTime(timeStr);

// JSON 对象转字符串
formatJsonObj(obj);

// 提取 TreeSelect 的值 (将对象数组转为 id 数组)
extractTreeValue(formValues, ['deptIds', 'roleCodes']);
```

#### 分页配置 (`utils/pager.ts`)
```typescript
import { usePagerConfig, useNeatPagerConfig, useFullPagerConfig, useDisabledPagerConfig } from '#/utils/pager';

// 默认精简分页
usePagerConfig();

// 完整版分页
useFullPagerConfig();

// 禁用分页 (树形表格等)
useDisabledPagerConfig();
```

#### 对话框确认 (`utils/dialog.ts`)
```typescript
import { confirmDialog } from '#/utils/dialog';

try {
  await confirmDialog('确定要删除吗？', '确认删除');
  // 执行删除
} catch {
  // 用户取消
}
```

### 8. 国际化 (i18n)

使用 `$t()` 函数进行翻译:

```typescript
import { $t } from '#/locales';

// 基础翻译
$t('system.user.id');  // "用户ID"

// 带参数
$t('ui.formRules.minLength', [$t('system.user.username'), 3]);
```

语言文件位置: `playground/src/locales/langs/{lang}/`

### 9. 表单字段规则

使用 Zod 进行表单验证:

```typescript
import { z } from '#/adapter/form';

// 示例规则
rules: z
  .string()
  .min(3, { message: $t('validation.minLength', [3]) })
  .max(20, { message: $t('validation.maxLength', [20]) })
  .regex(/^[\w\-.]+$/, { message: $t('validation.invalidFormat') })
  .email($t('validation.invalidEmail'));

// 简单规则
rules: 'required';
```

## 代码优化建议

### 常见问题

1. **硬编码中文**: 使用 `$t()` 替代硬编码的中文字符串
2. **重复代码**: 提取通用逻辑到 composables 或 utils
3. **类型安全**: 尽量避免使用 `any`，使用泛型和具体类型
4. **错误处理**: 统一的错误处理模式，避免 `catch` 块为空
5. **异步处理**: 优先使用 `async/await` 而非 Promise 链式调用

### 重构模式

1. **提取通用 CRUD 逻辑**: 考虑创建 `useCrud` composable
2. **统一状态切换逻辑**: 提取 `useStatusToggle` composable
3. **统一表单预加载**: 提取 `useFormPreload` 模式
4. **表格列复用**: 创建通用列定义工厂函数

## 调试技巧

### 浏览器开发工具
- **Vue Devtools**: 查看组件状态和 Pinia store
- **Network 面板**: 检查 API 请求和响应
- **Console**: 查看日志输出

### 常用调试方法
```typescript
// 在 API 响应中打印
console.log('response:', response);

// 在表单提交前打印值
const values = await formApi.getValues();
console.log('form values:', values);
```

### 环境变量切换
修改 `playground/.env.development` 中的 `VITE_GLOB_API_URL` 可切换后端服务地址。

## 提示
- 在东大 pnpm 可能也要配置代理:
  ```aiexclude
  https_proxy=127.0.0.1:10077
  http_proxy=127.0.0.1:10077
  ```
