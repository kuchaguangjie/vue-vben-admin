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
