# AGENTS - AI 开发助手指南

- [关于你 (AI)](#关于你-ai)
- [关于项目](#关于项目)
- [开发规范与模式](#开发规范与模式)
- [共享 Composables](#共享-composables)
- [常用组件与工具](#常用组件与工具)
- [代码优化建议](#代码优化建议)
- [调试技巧](#调试技巧)

---

## 关于你 (AI)

- 你是一个全栈开发专家，特别擅长 Vue 3 / Vben (v5) / TypeScript / Vite / pnpm 技术栈
- 你熟悉 Vue Vben Admin 5.x 框架的架构和最佳实践
- 你写的代码质量高、简洁、符合项目规范，且不啰嗦
- 你能够理解代码模式并提供重构建议

---

## 关于项目

### 项目概述

基于 **Vue Vben Admin 5.x** 的后台管理系统，项目名 `fiber-crud`。

- **主分支**: `main` (与 vben 官方同步)
- **开发分支**: `fiber-crud` (主要修改 `playground/` 子目录)
- **UI 框架**: Ant Design Vue

### 技术栈

Vue 3 + TypeScript + Vite 5 + Ant Design Vue + Tailwind CSS + SCSS + Pinia + Vue Router + VXE-Table + Axios

### 目录结构

```
playground/src/
├── api/           # API 接口定义
├── hooks/         # 自定义 Hooks (共享 Composables)
├── views/         # 页面视图
├── utils/         # 工具函数
├── adapter/       # 组件适配器
├── router/        # 路由配置
├── store/         # 状态管理
├── layouts/       # 布局组件
└── locales/       # 国际化
```

### 启动命令

```bash
pnpm install          # 安装依赖
pnpm dev:play         # 启动开发服务器
pnpm build:play       # 构建生产版本
```

---

## 开发规范与模式

### 页面开发模式

每个系统管理页面文件结构:

```
views/system/{module}/
├── data.ts              # 表单 schema、表格列定义
├── list.vue             # 列表页面 (主入口)
└── modules/
    ├── form.vue         # 新建/编辑表单
    └── detail.vue       # 详情预览
```

### data.ts 标准模式

导出以下函数:

- `useFormSchema()`: 表单字段定义
- `useGridFormSchema()`: 搜索表单 schema
- `useColumns()`: 表格列定义
- `formFieldsToAdjustForEdit()`: 编辑时调整的字段
- `formFieldsToRemoveForCreate/Edit/Preview()`: 各场景需移除的字段

### list.vue 标准模式

核心流程:

1. 引入类型、组件、API
2. 使用共享 Composables (useStatusToggle, useDeleteAction, useUserCoreMap)
3. 创建抽屉/模态框
4. 创建表格 (useVbenVxeGrid)
5. 实现 CRUD 操作函数

### API 定义模式

```typescript
export namespace SystemModuleApi {
  export interface SystemModule { id: number; name: string; status: number; }
}

async function getList(params) { return requestClient.get('/system/module/page', { params }); }
async function getDetail(id) { return requestClient.get(`/system/module/${id}`); }
async function create(data) { return requestClient.post('/system/module', data); }
async function update(id, data) { return requestClient.put(`/system/module/${id}`, data); }
async function remove(id) { return requestClient.delete(`/system/module/${id}`); }
async function updateStatus(data) { return requestClient.put('/system/module/status', data); }

export { getList, getDetail, create, update, remove, updateStatus };
```

---

## 共享 Composables

位于 `playground/src/hooks/common/` 目录。

### useStatusToggle - 状态切换

```typescript
import { useStatusToggle } from '#/hooks/common/use-status-toggle';

const { onStatusChange, isToggling } = useStatusToggle({
  getRowName: (row) => row.name,
  updateStatus: updateModuleStatus,
  onRefresh: () => gridApi.query(),
});
```

### useDeleteAction - 删除操作

```typescript
import { useDeleteAction } from '#/hooks/common/use-delete-action';

const { onDelete, isDeleting } = useDeleteAction({
  getRowName: (row) => row.name,
  deleteApi: deleteModule,
  onRefresh: () => gridApi.query(),
});
```

### useUserCoreMap - 用户核心数据映射

```typescript
import { useUserCoreMap } from '#/hooks/common/use-user-core-map';

const { userCoreMap, setUserCoreMap, getUserCore } = useUserCoreMap();

// 在表格查询后设置
setUserCoreMap(result.userCoreMap);

// 传递给 useColumns
useColumns(onActionClick, onPreview, userCoreMap, onStatusChange)
```

---

## 常用组件与工具

### 容器组件

- **Drawer**: 抽屉 (大多数表单使用)
- **Modal**: 模态框 (dept 使用)

```typescript
const [Drawer, drawerApi] = useVbenDrawer({
  connectedComponent: Form,
  destroyOnClose: true,
});

const [Modal, modalApi] = useVbenModal({
  connectedComponent: Form,
  destroyOnClose: true,
});
```

### 工具函数

| 函数 | 用途 |
|------|------|
| `formatBackendTime()` | 格式化后端时间字符串 |
| `formatJsonObj()` | JSON 对象转可读字符串 |
| `extractTreeValue()` | TreeSelect 值转换 (对象数组 → id 数组) |
| `usePagerConfig()` | 分页配置 |
| `confirmDialog()` | 确认对话框 |

### 国际化 (i18n)

```typescript
import { $t } from '#/locales';

$t('system.user.id');                    // 基础翻译
$t('ui.formRules.minLength', [$t('system.user.username'), 3]);  // 带参数
```

语言文件位置: `playground/src/locales/langs/zh-CN/`

- `common.json`: 通用翻译 (id, createdAt, status, enabled, disabled 等)
- `system.json`: 系统模块翻译
- `ui.json`: UI 相关翻译

### 分页参数

使用 `doPageQuery` 自动转换参数:

```typescript
import { doPageQuery } from '#/api/request';

query: async (params, formValues) => {
  return doPageQuery(getListApi, params, formValues);
};
```

---

## 代码优化建议

### 已完成的优化

1. **提取共享 Composables**: useStatusToggle, useDeleteAction, useUserCoreMap
2. **移除硬编码中文**: 所有用户可见文本使用 `$t()` 翻译
3. **统一异步处理风格**: 使用 `async/await` 替代 Promise 链式调用

### 常见问题

1. **硬编码中文**: 使用 `$t()` 替代
2. **重复代码**: 提取通用逻辑到 composables 或 utils
3. **类型安全**: 避免使用 `any`，使用泛型和具体类型
4. **异步处理**: 优先使用 `async/await`

---

## 调试技巧

- **Vue Devtools**: 查看组件状态和 Pinia store
- **Network 面板**: 检查 API 请求和响应
- **Console**: 查看日志输出

### 环境变量切换

修改 `playground/.env.development` 中的 `VITE_GLOB_API_URL` 切换后端服务地址。

---

## 提示

在东大 pnpm 可能需要配置代理:
```
https_proxy=127.0.0.1:10077
http_proxy=127.0.0.1:10077
```
