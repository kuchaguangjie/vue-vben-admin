import { requestClient } from '#/api/request';

export namespace FinancePayOrderApi {
  export interface PayOrder {
    amount: number;
    callbackData: string;
    channel: string;
    createdAt: string;
    currency: string;
    errorMsg: string;
    expiredAt: string;
    id: number;
    orderNo: string;
    paidAt: string;
    payUrl: string;
    status: string;
    tenantId: number;
    thirdPartyData: string;
    thirdPartyId: string;
    type: string;
    updatedAt: string;
    userId: number;
    version: number;
  }

  export interface PayOrderPageParams {
    channel?: string;
    currency?: string;
    orderNo?: string;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortDesc?: boolean;
    status?: string;
    tenantId?: number;
    type?: string;
    userId?: number;
  }
}

export async function getPayOrderPage(
  params: FinancePayOrderApi.PayOrderPageParams,
) {
  return requestClient.get<{
    items: FinancePayOrderApi.PayOrder[];
    total: number;
  }>('/finance/pay-order/page', { params });
}

export async function getPayOrderPageWithUserCore(
  params: FinancePayOrderApi.PayOrderPageParams,
) {
  return requestClient.get<{
    items: FinancePayOrderApi.PayOrder[];
    total: number;
    userCoreMap: Record<number, any>;
  }>('/finance/pay-order/pageWithUserCore', { params });
}

export async function getPayOrderDetail(id: number) {
  return requestClient.get<FinancePayOrderApi.PayOrder>(
    `/finance/pay-order/${id}`,
  );
}
