"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Tooltip,
  Cell,
  ResponsiveContainer,
  Legend,
  Label,
} from "recharts";
import { BASE_URL } from "@/lib/axios";
import { useAuthStore } from "@/store/useAuthStore";

// --- Types ---
type OrderStatusCount = {
  status: string;
  count: number;
};

type CategoryProductCount = {
  categoryId: number;
  categoryName: string;
  productCount: number;
};

// --- Config Colors (Giữ nguyên hoặc chỉnh lại tone pastel cho đẹp hơn) ---
const STATUS_COLORS = [
  "#3b82f6", // blue-500 (pending)
  "#22c55e", // green-500 (confirmed)
  "#f97316", // orange-500 (delivering)
  "#10b981", // emerald-500 (completed)
  "#ef4444", // red-500 (cancelled)
];

const CATEGORY_COLORS = [
  "#0ea5e9", // sky
  "#8b5cf6", // violet
  "#f59e0b", // amber
  "#ec4899", // pink
  "#10b981", // emerald
  "#6366f1", // indigo
  "#f43f5e", // rose
  "#14b8a6", // teal
];

// --- Custom Tooltip Component (Style Shadcn) ---
const CustomTooltip = ({ active, payload, unit }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const name = data.status || data.categoryName;
    const value = data.count || data.productCount;
    const color = payload[0].color;

    return (
      <div className="bg-popover border border-border text-popover-foreground rounded-lg shadow-md p-3 text-sm animate-in fade-in-0 zoom-in-95">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
          <span className="font-semibold">{name}</span>
        </div>
        <div className="text-muted-foreground">
          Số lượng: <span className="font-medium text-foreground">{value}</span> {unit}
        </div>
      </div>
    );
  }
  return null;
};

export default function DashboardPieRow() {
  const [orderStatusData, setOrderStatusData] = useState<OrderStatusCount[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryProductCount[]>([]);
  const [loading, setLoading] = useState(true);
  const { accessToken } = useAuthStore();  // 1. Fetch dữ liệu từ API Backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statusRes, categoryRes] = await Promise.all([
          fetch(`${BASE_URL}/dashboard/orders/status-count`, {
            headers: {
              "ngrok-skip-browser-warning": "true",
              authorization: `Bearer ${accessToken}`,
            },
            credentials: 'include',
          }),
          fetch(`${BASE_URL}/dashboard/categories/product-counts`, {
            headers: {
              "ngrok-skip-browser-warning": "true",
              authorization: `Bearer ${accessToken}`,
            },
            credentials: 'include',
          }),
        ]);

        const statusJson = await statusRes.json();
        const categoryJson = await categoryRes.json();

        const statusArr: OrderStatusCount[] = Object.values(statusJson.data || {});
        const categoryArr: CategoryProductCount[] = Object.values(
          categoryJson.data || {}
        );

        // Sort và lấy top category
        const topCategories = categoryArr
          .filter((c) => c.productCount > 0)
          .sort((a, b) => b.productCount - a.productCount)
          .slice(0, 6); // Lấy top 6 thôi cho đỡ rối

        setOrderStatusData(statusArr);
        setCategoryData(topCategories);
      } catch (error) {
        console.error("Error fetching pie chart data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Tính tổng đơn hàng để hiển thị ở giữa biểu đồ Donut
  const totalOrders = useMemo(() => {
    return orderStatusData.reduce((acc, curr) => acc + curr.count, 0);
  }, [orderStatusData]);

  if (loading) {
    return <div className="p-4 text-sm text-muted-foreground">Đang tải biểu đồ...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">

      {/* --- CHART 1: TRẠNG THÁI ĐƠN HÀNG (DONUT) --- */}
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle>Trạng thái đơn hàng</CardTitle>
          <CardDescription>Tổng quan xử lý đơn</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <div className="h-[300px] w-full relative">
            {orderStatusData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                Chưa có dữ liệu
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={orderStatusData}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    innerRadius={60} // Tạo lỗ hổng ở giữa (Donut)
                    outerRadius={90}
                    paddingAngle={3} // Khoảng cách giữa các miếng
                    cornerRadius={4} // Bo tròn góc miếng
                    stroke="none"
                  >
                    {orderStatusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={STATUS_COLORS[index % STATUS_COLORS.length]}
                      />
                    ))}
                    {/* Hiển thị tổng số ở giữa */}
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                          return (
                            <text
                              x={viewBox.cx}
                              y={viewBox.cy}
                              textAnchor="middle"
                              dominantBaseline="middle"
                            >
                              <tspan
                                x={viewBox.cx}
                                y={viewBox.cy}
                                className="fill-foreground text-3xl font-bold"
                              >
                                {totalOrders}
                              </tspan>
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) + 24}
                                className="fill-muted-foreground text-xs"
                              >
                                Đơn hàng
                              </tspan>
                            </text>
                          );
                        }
                      }}
                    />
                  </Pie>
                  <Tooltip content={<CustomTooltip unit="đơn" />} />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    formatter={(value) => <span className="text-sm text-muted-foreground ml-1">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>

      {/* --- CHART 2: TOP DANH MỤC (DONUT) --- */}
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle>Danh mục phổ biến</CardTitle>
          <CardDescription>Top danh mục nhiều sản phẩm nhất</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <div className="h-[300px] w-full">
            {categoryData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                Chưa có dữ liệu
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="productCount"
                    nameKey="categoryName"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    cornerRadius={4}
                    stroke="none"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell
                        key={`cell-cat-${index}`}
                        fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip unit="SP" />} />
                  <Legend
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                    iconType="circle"
                    formatter={(value, entry: any) => {
                      // Hiển thị tên + số lượng ở legend cho rõ
                      const { payload } = entry;
                      return (
                        <span className="text-sm text-muted-foreground ml-2">
                          {value} <span className="text-xs opacity-70">({payload.productCount})</span>
                        </span>
                      )
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}