/**
 * 统一格式化后端返回的时间字符串
 * 从 "2025-10-04T00:51:59.575623+08:00" 转换为 "2025-10-04 00:51:59 +08"
 */
export const formatBackendTime = (timeStr: string): string => {
  if (!timeStr) return '';

  try {
    // 移除毫秒和时区冒号
    const cleaned = timeStr
      .replace(/\.\d+/, '') // 移除毫秒
      .replace(/([+-])(\d{2}):(\d{2})/, ' $1$2'); // 移除时区冒号并在时区前添加空格

    // 将 T 替换为空格
    return cleaned.replace('T', ' ');
  } catch (error) {
    console.warn('时间格式转换失败:', timeStr, error);
    return timeStr;
  }
};

// 将 JSON 对象 转换为 可读字符串.
export const formatJsonObj = (cellValue: any): string => {
  if (!cellValue) return '';

  try {
    // 如果已经是字符串，直接返回
    if (typeof cellValue === 'string') {
      return cellValue;
    }

    // 如果是对象，格式化为 JSON 字符串
    return JSON.stringify(cellValue, null, 2);
  } catch (error) {
    console.error('格式化 data 字段失败:', error);
    return String(cellValue);
  }
};
