import { message } from 'ant-design-vue';

/**
 * 带有倒计时的全局提示函数
 * @param msg 提示文字（支持包含 %s 作为秒数占位符）
 * @param seconds 倒计时秒数
 * @param onClose 倒计时结束后的回调函数
 */
export function countdownMsg(
  msg: string,
  seconds: number,
  onClose?: () => void,
) {
  let count = seconds;
  const msgKey = `countdown-${Date.now()}`; // 确保 key 唯一，防止多个倒计时冲突

  // 格式化消息文字
  const getMsgContent = (s: number) => {
    // 如果 msg 包含 %s，则替换；否则直接拼接在后面
    return msg.includes('%s')
      ? msg.replace('%s', s.toString())
      : `${msg} (${s})`;
  };

  // 初始弹出
  message.success({
    content: getMsgContent(count),
    key: msgKey,
    duration: 0,
  });

  const timer = setInterval(() => {
    count--;
    if (count > 0) {
      message.success({
        content: getMsgContent(count),
        key: msgKey,
        duration: 0,
      });
    } else {
      clearInterval(timer);
      message.destroy(msgKey);
      // 执行回调
      onClose?.();
    }
  }, 1000);

  // 返回一个可以手动停止倒计时的函数（备用）
  return () => {
    clearInterval(timer);
    message.destroy(msgKey);
  };
}
