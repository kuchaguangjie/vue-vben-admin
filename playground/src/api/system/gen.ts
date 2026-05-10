import type { Recordable } from '@vben/types';

import { requestClient } from '#/api/request';

export namespace GenApi {
  export interface GenTableColumn {
    fieldName: string;
    fieldType: string;
    fieldLength?: number;
    fieldScale?: number;
    isPrimary?: boolean;
    isAuto?: boolean;
    isRequired?: boolean;
    isUnique?: boolean;
    isIndex?: boolean;
    defaultValue?: string;
    remark?: string;
  }

  export interface GenTableDesign {
    tableName: string;
    tableComment?: string;
    isSoftDelete?: boolean;
    isTenant?: boolean;
    hasVersion?: boolean;
    hasCreated?: boolean;
    hasUpdated?: boolean;
    columns: GenTableColumn[];
  }

  export interface GenSqlResult {
    createTableSql: string;
    indexSql: string;
    initDataSql: string;
    fullSql: string;
  }

  export interface SqlTypeOption {
    value: string;
    label: string;
  }

  export interface GenSaveSqlReq {
    tableName: string;
    fileName?: string;
    sql: string;
  }

  export interface GenSaveSqlResult {
    filePath: string;
    fileName: string;
  }

  export interface GenExecuteSqlReq {
    tableName: string;
    sql: string;
  }

  export interface GenExecuteSqlResult {
    success: boolean;
    message: string;
    error?: string;
  }

  export interface GenGenerateGormReq {
    tableName: string;
  }

  export interface GenGenerateGormResult {
    success: boolean;
    message: string;
    error?: string;
  }

  export interface GenTableInfo {
    tableName: string;
    tableComment: string;
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

export {
  getSqlTypeOptions,
  getTableList,
  generateSql,
  saveSql,
  executeSql,
  generateGorm,
};
