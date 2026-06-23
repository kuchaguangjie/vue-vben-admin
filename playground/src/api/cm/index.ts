import { requestClient } from '#/api/request';

export namespace CmUserWithdrawApi {
  export interface UserAccount {
    availableAmount: number;
    frozenAmount: number;
    totalIncome: number;
    withdrawnAmount: number;
    withdrawPending: number;
  }

  export interface UserWithdraw {
    actualAmount: number;
    alipayAccount: string;
    applicantId: number;
    applicantName: string;
    auditorId: number;
    auditorName: string;
    auditRemark: string;
    auditTime: string;
    bankAccountName: string;
    bankAccountNo: string;
    bankName: string;
    createdAt: string;
    currency: string;
    feeAmount: number;
    id: number;
    payChannel: string;
    payRemark: string;
    payTime: string;
    payTxNo: string;
    remark: string;
    status: number;
    tenantId: number;
    tenantName: string;
    totalIncome: number;
    userId: number;
    userName: string;
    wechatAccount: string;
    withdrawAmount: number;
    withdrawNo: string;
  }

  export interface PageParams {
    amountMax?: number;
    amountMin?: number;
    endDate?: string;
    page?: number;
    pageSize?: number;
    startDate?: string;
    status?: number;
    tenantId?: number;
    userId?: number;
  }

  export interface ApplyReq {
    alipayAccount?: string;
    amount: number;
    bankAccountName?: string;
    bankAccountNo?: string;
    bankName?: string;
    currency: string;
    payChannel: string;
    wechatAccount?: string;
  }

  export interface AuditReq {
    actualAmount?: number;
    auditRemark?: string;
    id: number;
    pass: boolean;
    payRemark?: string;
    payTxNo?: string;
  }

  export interface ReviewReq {
    id: number;
    pass: boolean;
    remark?: string;
  }
}

export async function getUserWithdrawPage(
  params: CmUserWithdrawApi.PageParams,
) {
  return requestClient.get<{
    items: CmUserWithdrawApi.UserWithdraw[];
    total: number;
  }>('/cm/withdraw/list', { params });
}

export async function getUserWithdraw(id: number) {
  return requestClient.get<CmUserWithdrawApi.UserWithdraw>(
    `/cm/withdraw/detail/${id}`,
  );
}

export async function applyUserWithdraw(data: CmUserWithdrawApi.ApplyReq) {
  return requestClient.post('/cm/withdraw/apply', data);
}

export async function auditUserWithdraw(data: CmUserWithdrawApi.AuditReq) {
  return requestClient.post('/cm/withdraw/audit', data);
}

export async function reviewUserWithdraw(data: CmUserWithdrawApi.ReviewReq) {
  return requestClient.post('/cm/withdraw/review', data);
}

export async function getUserWithdrawAccount() {
  return requestClient.get<CmUserWithdrawApi.UserAccount>(
    '/cm/withdraw/account',
  );
}
