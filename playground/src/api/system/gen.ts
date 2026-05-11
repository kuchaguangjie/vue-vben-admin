import { requestClient } from '#/api/request';

export namespace GenApi {
  export interface GenTableColumn {
    defaultValue?: string;
    fieldLength?: number;
    fieldName: string;
    fieldScale?: number;
    fieldType: string;
    isAuto?: boolean;
    isIndex?: boolean;
    isPrimary?: boolean;
    isRequired?: boolean;
    isUnique?: boolean;
    remark?: string;
  }

  export interface GenTableDesign {
    columns: GenTableColumn[];
    hasCreated?: boolean;
    hasUpdated?: boolean;
    hasVersion?: boolean;
    isSoftDelete?: boolean;
    isTenant?: boolean;
    tableComment?: string;
    tableName: string;
  }

  export interface GenSqlResult {
    createTableSql: string;
    fullSql: string;
    indexSql: string;
    initDataSql: string;
  }

  export interface SqlTypeOption {
    label: string;
    value: string;
  }

  export interface GenSaveSqlReq {
    fileName?: string;
    sql: string;
    tableName: string;
  }

  export interface GenSaveSqlResult {
    fileName: string;
    filePath: string;
  }

  export interface GenExecuteSqlReq {
    sql: string;
    tableName: string;
  }

  export interface GenExecuteSqlResult {
    error?: string;
    message: string;
    success: boolean;
  }

  export interface GenGenerateGormReq {
    tableName: string;
  }

  export interface GenGenerateGormResult {
    error?: string;
    message: string;
    success: boolean;
  }

  export interface GenTableInfo {
    tableComment: string;
    tableName: string;
  }

  export interface GenGenerateCodeReq {
    moduleName: string;
    tableName: string;
  }

  export interface GenGeneratedFile {
    content?: string;
    fileName: string;
    filePath: string;
  }

  export interface GenGenerateCodeResult {
    error?: string;
    files?: GenGeneratedFile[];
    isPartialReady?: boolean;
    message: string;
    skippedFiles?: string[];
    success: boolean;
  }

  export interface GenGenerateFrontendReq {
    menuParentId?: number;
    moduleName: string;
    moduleTitle?: string;
    tableName: string;
  }

  export interface GenGenerateFrontendResult {
    error?: string;
    files?: GenGeneratedFile[];
    message: string;
    success: boolean;
  }

  export interface GenCreateMenuReq {
    menuParentId?: number;
    moduleName: string;
    moduleTitle?: string;
    tableName: string;
  }

  export interface GenCreateMenuResult {
    error?: string;
    menuId?: number;
    message: string;
    success: boolean;
  }

  export interface GenCreateApiReq {
    apiParentId?: number;
    moduleName: string;
    tableName: string;
  }

  export interface GenCreateApiResult {
    apiIds?: number[];
    error?: string;
    message: string;
    success: boolean;
  }
}

async function getSqlTypeOptions() {
  return requestClient.get<GenApi.SqlTypeOption[]>(
    '/system/gen/sql-type-options',
  );
}

async function generateSql(design: GenApi.GenTableDesign) {
  return requestClient.post<GenApi.GenSqlResult>(
    '/system/gen/generate-sql',
    design,
  );
}

async function saveSql(req: GenApi.GenSaveSqlReq) {
  return requestClient.post<GenApi.GenSaveSqlResult>(
    '/system/gen/save-sql',
    req,
  );
}

async function executeSql(req: GenApi.GenExecuteSqlReq) {
  return requestClient.post<GenApi.GenExecuteSqlResult>(
    '/system/gen/execute-sql',
    req,
  );
}

async function generateGorm(req: GenApi.GenGenerateGormReq) {
  return requestClient.post<GenApi.GenGenerateGormResult>(
    '/system/gen/generate-gorm',
    req,
  );
}

async function getTableList() {
  return requestClient.get<GenApi.GenTableInfo[]>('/system/gen/table-list');
}

async function generateCode(req: GenApi.GenGenerateCodeReq) {
  return requestClient.post<GenApi.GenGenerateCodeResult>(
    '/system/gen/generate-code',
    req,
  );
}

async function generateFrontend(req: GenApi.GenGenerateFrontendReq) {
  return requestClient.post<GenApi.GenGenerateFrontendResult>(
    '/system/gen/generate-frontend',
    req,
  );
}

async function createMenuForGen(req: GenApi.GenCreateMenuReq) {
  return requestClient.post<GenApi.GenCreateMenuResult>(
    '/system/gen/create-menu',
    req,
  );
}

async function createApiForGen(req: GenApi.GenCreateApiReq) {
  return requestClient.post<GenApi.GenCreateApiResult>(
    '/system/gen/create-api',
    req,
  );
}

export {
  createApiForGen,
  createMenuForGen,
  executeSql,
  generateCode,
  generateFrontend,
  generateGorm,
  generateSql,
  getSqlTypeOptions,
  getTableList,
  saveSql,
};
