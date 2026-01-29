import type { BasicUserInfo } from '@vben-core/typings';

/** 用户信息 */
interface UserInfo extends BasicUserInfo {
  /**
   * 用户描述
   */
  desc: string;
  /**
   * 首页地址
   */
  homePath: string;

  /**
   * accessToken
   */
  token: string;
}

interface ClientInfo {
  os: string;
  browser: string;
  browserVersion: string;
  device: string;
  ip: string;
  city: string;
  cityCn: string;
}

interface UserSession extends ClientInfo {
  sid: string;
  createdMs: number;
}

export type { ClientInfo, UserInfo, UserSession };
