import { requestClient } from '#/api/request';

export namespace CommonApi {
  export interface I18nInfoResp {
    langList: string[];
    filePrefixList: string[];
    fileSuffix: string;
    i18n: any;
    saasEnabled: boolean;
    appName: string;
  }
}

export async function getI18nInfoApi() {
  return requestClient.get<CommonApi.I18nInfoResp>('/i18n/info');
}
