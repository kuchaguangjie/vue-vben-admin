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
