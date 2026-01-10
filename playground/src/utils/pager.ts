// default pager config
export function usePagerConfig() {
  return useNeatPagerConfig();
}

export function useFullPagerConfig() {
  return {
    enabled: true,
    pageSize: 20,
    pageSizes: [10, 20, 50, 100],
    // 这里的顺序就是 UI 显示的顺序
    layouts: [
      'Total', // 总条数
      'Sizes', // 每页条数
      'Home', // 首页
      'PrevJump', // 向上跳页
      'PrevPage', // 上一页
      'Number', // 页码数字
      'NextPage', // 下一页
      'NextJump', // 向下跳页
      'End', // 末页
      'FullJump', // 跳转输入框
    ],
  };
}

export function useNeatPagerConfig() {
  return {
    enabled: true,
    pageSize: 20,
    pageSizes: [10, 20, 50, 100],
    // 这里的顺序就是 UI 显示的顺序
    layouts: [
      'Total', // 总条数
      'Sizes', // 每页条数
      'Home', // 首页
      'PrevPage', // 上一页
      'Number', // 页码数字
      'NextPage', // 下一页
      'End', // 末页
      'FullJump', // 跳转输入框
    ],
  };
}

export function useDisabledPagerConfig() {
  return {
    enabled: false,
  };
}
