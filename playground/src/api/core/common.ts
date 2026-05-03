import { requestClient } from '#/api/request';

export namespace CommonApi {
  export interface I18nInfoResp {
    appName: string;
    filePrefixList: string[];
    fileSuffix: string;
    i18n: any;
    langList: string[];
    saasEnabled: boolean;
  }
}

export async function getI18nInfoApi() {
  return requestClient.get<CommonApi.I18nInfoResp>('/i18n/info');
}
