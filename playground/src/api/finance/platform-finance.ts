import { requestClient } from '#/api/request';

export namespace PlatformFinanceApi {
  export interface OverviewReq {
    currency?: string;
    endDate?: string;
    startDate?: string;
  }

  export interface MonthlyItem {
    commissionExpense: number;
    grossRevenue: number;
    month: string;
    platformIncome: number;
  }

  export interface CurrencyItem {
    commissionExpense: number;
    currency: string;
    grossRevenue: number;
    platformIncome: number;
  }

  export interface OverviewResp {
    availableCurrencies: string[];
    canceledAmount: number;
    currencyBreakdown: CurrencyItem[];
    frozenAmount: number;
    grossRevenue: number;
    grossRevenueCount: number;
    monthlyTrend: MonthlyItem[];
    platformIncome: number;
    settledAmount: number;
    tenantCommissionExpense: number;
    tenantShareExpense: number;
    totalCommissionExpense: number;
    userCommissionExpense: number;
  }
}

export async function getPlatformFinanceOverview(
  params: PlatformFinanceApi.OverviewReq,
) {
  return requestClient.get<PlatformFinanceApi.OverviewResp>(
    '/finance/platform-finance/overview',
    { params },
  );
}
