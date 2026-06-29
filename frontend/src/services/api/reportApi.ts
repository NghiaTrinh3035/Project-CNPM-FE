import axiosClient from "@/api/axiosClient";
import { mapBackendOrder, mapBackendProduct, unwrapPage } from "@/services/api/backendMappers";
import { warrantyApi } from "@/services/api/warrantyApi";
import type { Order, Product, RevenueReport } from "@/shared/types/domain";

export interface ReportQueryParams {
  fromDate?: string;
  toDate?: string;
  topLimit?: number;
}

export interface DashboardSummaryResponse {
  totalRevenue: number;
  totalOrders: number;
  newCustomers: number;
  totalProductsSold: number;
}

export interface RevenueByTimeResponse {
  time: string;
  revenue: number;
}

export interface OrdersByTimeResponse {
  time: string;
  totalOrders: number;
}

export interface TopSellingProductResponse {
  productId: string;
  productName: string;
  soldQuantity: number;
}

export interface DashboardStatisticResponse {
  revenueByTime: RevenueByTimeResponse[];
  ordersByDay: OrdersByTimeResponse[];
  ordersByMonth: OrdersByTimeResponse[];
  topSellingProducts: TopSellingProductResponse[];
}

export interface DashboardReportResponse {
  summary: DashboardSummaryResponse;
  statistics: DashboardStatisticResponse;
}

export interface OwnerOverviewResponse {
  revenue: number;
  totalOrders: number;
  pendingOrders: number;
  lowStockProducts: Product[];
  warrantyCount: number;
  recentOrders: Order[];
  bestSellerStats: Array<{ name: string; sold: number }>;
}

const base = "/reports";

const mapRevenuePoint = (item: RevenueByTimeResponse): RevenueReport => ({
  period: item.time,
  revenue: item.revenue,
  orders: 0,
});

const countTotalElements = (data: unknown) => {
  const payload = data && typeof data === "object" ? (data as Record<string, unknown>) : {};
  const totalElements = Number(payload["totalElements"] ?? payload["total"] ?? 0);
  if (Number.isFinite(totalElements) && totalElements > 0) {
    return totalElements;
  }
  return unwrapPage<unknown>(data).length;
};

export const reportApi = {
  async getDashboard(params: ReportQueryParams = {}): Promise<DashboardReportResponse> {
    const { data } = await axiosClient.get<DashboardReportResponse>(`${base}/dashboard`, {
      params,
    });
    return data;
  },

  async getSummary(params: ReportQueryParams = {}): Promise<DashboardSummaryResponse> {
    const { data } = await axiosClient.get<DashboardSummaryResponse>(`${base}/summary`, {
      params,
    });
    return data;
  },

  async getStatistics(params: ReportQueryParams = {}): Promise<DashboardStatisticResponse> {
    const { data } = await axiosClient.get<DashboardStatisticResponse>(`${base}/statistics`, {
      params,
    });
    return data;
  },

  async getRevenue(params: Pick<ReportQueryParams, "fromDate" | "toDate"> = {}): Promise<RevenueReport[]> {
    const { data } = await axiosClient.get<RevenueByTimeResponse[]>(`${base}/revenue`, {
      params,
    });
    return data.map(mapRevenuePoint);
  },

  async getOwnerOverview(): Promise<OwnerOverviewResponse> {
    const [dashboard, orders, products, receivedWarrantyData, processingWarrantyData] = await Promise.all([
      this.getDashboard().catch(() => null),
      axiosClient
        .get("/orders", {
          params: { page: 0, size: 1000, sort: "orderDate,desc" },
        })
        .then(({ data }) => unwrapPage<Record<string, unknown>>(data).map((item) => mapBackendOrder(item)))
        .catch(() => []),
      axiosClient
        .get("/products")
        .then(({ data }) => unwrapPage<Record<string, unknown>>(data).map((item) => mapBackendProduct(item)))
        .catch(() => []),
      warrantyApi.listForAdmin({ status: "RECEIVED", page: 1, pageSize: 1 }).catch(() => null),
      warrantyApi.listForAdmin({ status: "PROCESSING", page: 1, pageSize: 1 }).catch(() => null),
    ]);

    const receivedCount = receivedWarrantyData ? countTotalElements(receivedWarrantyData) : 0;
    const processingCount = processingWarrantyData ? countTotalElements(processingWarrantyData) : 0;
    const lowStockProducts = products
      .filter((product) => product.stockQuantity < 3)
      .sort((a, b) => a.stockQuantity - b.stockQuantity || a.name.localeCompare(b.name));
    const recentOrders = [...orders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    const soldCounter = new Map<string, number>();
    orders.forEach((order) => {
      order.items.forEach((item) => {
        soldCounter.set(item.productName, (soldCounter.get(item.productName) ?? 0) + item.quantity);
      });
    });
    const bestSellerStats = Array.from(soldCounter.entries())
      .map(([name, sold]) => ({ name, sold }))
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 6);

    return {
      revenue: dashboard?.summary.totalRevenue ?? 0,
      totalOrders: dashboard?.summary.totalOrders ?? orders.length,
      pendingOrders: orders.filter((order) => order.status === "PENDING").length,
      lowStockProducts,
      warrantyCount: receivedCount + processingCount,
      recentOrders: recentOrders.slice(0, 5),
      bestSellerStats,
    };
  },

  async exportExcel(params: Pick<ReportQueryParams, "fromDate" | "toDate"> = {}): Promise<void> {
    try {
      const response = await axiosClient.get(`${base}/export`, {
        params: { ...params, type: "excel" },
        responseType: "blob",
      });
      
      const file = new Blob([response.data as BlobPart], { 
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" 
      });
      
      const fileURL = URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = fileURL;
      link.setAttribute("download", "report_doanh_thu.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(fileURL);
    } catch (error) {
      console.error("Lỗi khi tải file Excel", error);
      throw error;
    }
  },

  async exportPdf(params: Pick<ReportQueryParams, "fromDate" | "toDate"> = {}): Promise<void> {
    try {
      const response = await axiosClient.get(`${base}/export`, {
        params: { ...params, type: "pdf" },
        responseType: "blob",
      });
      
      const file = new Blob([response.data as BlobPart], { 
        type: "application/pdf" 
      });
      
      const fileURL = URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = fileURL;
      link.setAttribute("download", "report_doanh_thu.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(fileURL);
    } catch (error) {
      console.error("Lỗi khi tải file PDF", error);
      throw error;
    }
  },
};