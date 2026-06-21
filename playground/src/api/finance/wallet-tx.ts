import { requestClient } from '#/api/request';

export namespace FinanceCurrencyApi {
  export interface Currency {
    code: string;
    createdAt: string;
    enabled: boolean;
    id: number;
    maxRecharge: number;
    maxWithdraw: number;
    minRecharge: number;
    minWithdraw: number;
    name: string;
    rateToCny: number;
    sort: number;
    symbol: string;
    updatedAt: string;
    withdrawDailyMaxCount: number;
  }

  export interface CurrencyPageParams {
    code?: string;
    enabled?: boolean;
    name?: string;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortDesc?: boolean;
  }

  export interface CurrencyCreateParams {
    code: string;
    enabled: boolean;
    maxRecharge: number;
    maxWithdraw: number;
    minRecharge: number;
    minWithdraw: number;
    name: string;
    rateToCny: number;
    sort: number;
    symbol: string;
    withdrawDailyMaxCount: number;
  }

  export interface CurrencyUpdateParams extends CurrencyCreateParams {
    id: number;
  }
}

export async function getCurrencyPage(
  params: FinanceCurrencyApi.CurrencyPageParams,
) {
  return requestClient.get<{
    items: FinanceCurrencyApi.Currency[];
    total: number;
  }>('/finance/currency/page', { params });
}

export async function getCurrencyListEnabled() {
  return requestClient.get<FinanceCurrencyApi.Currency[]>(
    '/finance/currency/list/enabled',
  );
}

export async function getCurrencyDetail(id: number) {
  return requestClient.get<FinanceCurrencyApi.Currency>(
    `/finance/currency/${id}`,
  );
}

export async function createCurrency(
  data: FinanceCurrencyApi.CurrencyCreateParams,
) {
  return requestClient.post<FinanceCurrencyApi.Currency>(
    '/finance/currency',
    data,
  );
}

export async function updateCurrency(
  data: FinanceCurrencyApi.CurrencyUpdateParams,
) {
  return requestClient.put<FinanceCurrencyApi.Currency>(
    '/finance/currency',
    data,
  );
}

export async function deleteCurrency(id: number) {
  return requestClient.delete(`/finance/currency/${id}`);
}

export async function updateCurrencyStatus(data: {
  enabled: boolean;
  id: number;
}) {
  return requestClient.put('/finance/currency/status', data);
}

export namespace FinanceWalletTxApi {
  export interface WalletTx {
    amount: number;
    balanceAfter: number;
    balanceBefore: number;
    balanceType: string;
    bizType: string;
    channel: string;
    createdAt: string;
    id: number;
    originalAmount: number;
    originalCurrency: string;
    payTxId: string;
    remark?: string;
    tenantId: number;
    type: string;
    userId: number;
  }

  export interface WalletTxPageParams {
    balanceType?: string;
    bizType?: string;
    channel?: string;
    createdAtRangeMs?: number[];
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortDesc?: boolean;
    type?: string;
    userId?: number;
  }
}

export async function getWalletTxPage(
  params: FinanceWalletTxApi.WalletTxPageParams,
) {
  return requestClient.get<{
    items: FinanceWalletTxApi.WalletTx[];
    total: number;
  }>('/finance/wallet-tx/page', { params });
}

export async function getWalletTxPageWithUserCore(
  params: FinanceWalletTxApi.WalletTxPageParams,
) {
  return requestClient.get<{
    items: FinanceWalletTxApi.WalletTx[];
    total: number;
    userCoreMap: Record<number, any>;
  }>('/finance/wallet-tx/pageWithUserCore', { params });
}

export async function getWalletTxDetail(id: number) {
  return requestClient.get<FinanceWalletTxApi.WalletTx>(
    `/finance/wallet-tx/${id}`,
  );
}
