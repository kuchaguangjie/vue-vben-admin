# fiber-crud ui

## 定制化 代码

### cell display

- 格式化 后端 给的 time.Time string
  - data.ts 对应的 column 加:
    > formatter: ({ cellValue }) => formatBackendTime(cellValue), // 时间格式转换
- json object 转 json string
  - data.ts 对应的 column 加:
    > formatter: ({ cellValue }) => formatJsonObj(cellValue), // json -> string
-

### paging

- params
  - page # page num, start from 1
  - pageSize # page size
  -
  - sortBy # field name to sort, it's camelCase, should convert to snake_case in backend.
  - sortDesc # boolean, false -> asc, true -> desc;

### form columns shared by actions: Create / Edit / Preview

- default columns: all
- adjust via functions defined in `data.ts` for each action:
  - for Create: need remove auto generated fields, like `id`, specified via `formFieldsToRemoveForCreate()`
  - for Edit:
    - disable some fields that can't be changed, like `username`, specified via `formFieldsToAdjustForEdit()`
    - remove some fields that can't be displayed, like `password`, specified via `formFieldsToRemoveForEdit()`
  - for Preview
    - make the form unable to edit, either by disable it, or make it can't click via css class
    - remove some fields that can't be displayed, same as edit;

## 常用组件

- [容器]
  - Drawer # 抽屉, 从侧边弹出, 大小不变; (大部分 form 和 preview 都是用的这个)
  - Modal # 模态框, 从中间弹出, 可全屏; (dept 中用了这个显示 form)

## How

- 添加页面: 1. 提供 api; 2. 创建 menu, 创建 api, 分配给角色; 3. 开发页面;
