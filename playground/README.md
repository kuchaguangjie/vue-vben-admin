# fiber-crud UI - 开发指南

- [项目概述](#项目概述)
- [快速开始](#快速开始)
- [目录结构](#目录结构)
- [开发规范](#开发规范)
- [常用组件与工具](#常用组件与工具)
- [部署指南](#部署指南)
- [常见问题](#常见问题)

---

## 项目概述

基于 **Vue Vben Admin 5.x** 的后台管理系统前端项目。

### 技术栈

- **框架**: Vue 3 + TypeScript
- **构建工具**: Vite 5
- **UI 库**: Ant Design Vue
- **状态管理**: Pinia
- **路由**: Vue Router
- **表格组件**: VXE-Table
- **表单组件**: Vben Form
- **样式**: Tailwind CSS + SCSS

### 分支说明

- **main**: 与 vben 官方同步，用于升级
- **fiber-crud**: 主要开发分支，修改 `playground/` 子目录

---

## 快速开始

### 环境要求

- Node.js >= 18
- pnpm >= 8

### 安装与启动

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev:play

# 构建生产版本
pnpm build:play
```

### 环境变量配置

文件位置: `playground/.env.development` / `.env.production`

```env
VITE_BASE=/                    # 应用基础路径
VITE_GLOB_API_URL=http://localhost:8080  # API 服务地址
VITE_GLOB_API_URL_PREFIX=/api  # API 前缀
```

---

## 目录结构

```
playground/src/
├── api/           # API 接口定义
│   ├── core/      # 核心 API (认证、菜单、用户等)
│   ├── system/    # 系统管理 API
│   └── request.ts # HTTP 请求封装
│
├── hooks/         # 自定义 Hooks (共享 Composables)
│   └── common/    # 通用 Hooks
│
├── views/         # 页面视图
│   ├── system/    # 系统管理页面
│   ├── _core/     # 核心页面 (登录、个人中心等)
│   ├── demos/     # 功能演示
│   └── examples/  # 组件示例
│
├── utils/         # 工具函数
├── adapter/       # 组件适配器
├── router/        # 路由配置
├── store/         # 状态管理
├── layouts/       # 布局组件
└── locales/       # 国际化
```

---

## 开发规范

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

### 共享 Composables

位于 `playground/src/hooks/common/`，推荐使用:

| Composable | 用途 |
|------------|------|
| `useStatusToggle` | 状态开关切换 (启用/禁用) |
| `useDeleteAction` | 删除按钮点击处理 |
| `useUserCoreMap` | 用户核心数据映射 (id → nick, username) |

### 国际化 (i18n)

所有用户可见文本使用 `$t()` 翻译:

```typescript
import { $t } from '#/locales';

// 基础翻译
$t('system.user.id');

// 带参数
$t('ui.formRules.minLength', [$t('system.user.username'), 3]);
```

语言文件位置: `playground/src/locales/langs/zh-CN/`

- `common.json`: 通用翻译 (id, createdAt, status, enabled, disabled 等)
- `system.json`: 系统模块翻译
- `ui.json`: UI 相关翻译

### 编码原则

1. **类型安全**: 避免使用 `any`，使用泛型和具体类型
2. **异步处理**: 优先使用 `async/await` 而非 Promise 链式调用
3. **代码复用**: 提取通用逻辑到 composables 或 utils
4. **错误处理**: 统一的错误处理模式，避免空 `catch` 块

---

## 常用组件与工具

### 容器组件

| 组件 | 说明 |
|------|------|
| `useVbenDrawer` | 抽屉 (大多数表单使用) |
| `useVbenModal` | 模态框 (dept 使用) |

### 工具函数

| 函数 | 用途 |
|------|------|
| `formatBackendTime()` | 格式化后端时间字符串 |
| `formatJsonObj()` | JSON 对象转可读字符串 |
| `extractTreeValue()` | TreeSelect 值转换 (对象数组 → id 数组) |
| `usePagerConfig()` | 分页配置 |
| `confirmDialog()` | 确认对话框 |
| `doPageQuery()` | 分页参数自动转换 |

### 分页参数

后端期望参数:
- `page`: 页码 (从 1 开始)
- `pageSize`: 每页条数
- `sortBy`: 排序字段名 (camelCase)
- `sortDesc`: 是否降序 (boolean)

使用 `doPageQuery` 自动转换 VXE-Table 参数:

```typescript
import { doPageQuery } from '#/api/request';

query: async (params, formValues) => {
  return doPageQuery(getListApi, params, formValues);
};
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

### 表单验证不生效

检查:
- 字段名是否匹配
- rules 是否正确定义
- 是否使用了 `z.string()` 等 Zod 方法

### 表格数据不显示

检查:
- `proxyConfig.ajax.query` 是否正确配置
- 返回数据格式是否符合预期
- `rowConfig.keyField` 是否设置正确

### TreeSelect 值提交异常

使用 `extractTreeValue` 转换:
```typescript
const values = await formApi.getValues();
extractTreeValue(values, ['deptIds', 'roleCodes']);
```

### 时间格式显示异常

使用 `formatBackendTime` 格式化:
```typescript
formatter: ({ cellValue }) => formatBackendTime(cellValue);
```

### 状态切换不生效

检查:
- `onStatusChange` 函数是否返回 Promise
- `cellRender.name` 是否正确设置为 'CellSwitch'

---

## 最佳实践

1. **类型安全**: 尽量避免使用 `any`，使用具体类型或泛型
2. **错误处理**: 统一使用 try-catch 或 Promise 链式处理
3. **异步处理**: 优先使用 async/await 而非 .then() 链式
4. **代码复用**: 提取通用逻辑到 composables 或 utils
5. **国际化**: 所有用户可见文本使用 `$t()` 翻译
6. **命名规范**: 遵循项目现有命名风格

---

## 提示

在东大 pnpm 可能需要配置代理:
```
https_proxy=127.0.0.1:10077
http_proxy=127.0.0.1:10077
```
