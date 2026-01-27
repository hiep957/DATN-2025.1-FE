import api from "@/lib/axios";
import { KpiCard } from "./kpi-card"
import { useEffect, useState } from "react";

const formatNumber = (value?: number, suffix = "") =>
  typeof value === "number"
    ? value.toLocaleString() + suffix
    : "0" + suffix;

const getDashboardKpis = async () => {
  const res = await api.get("/dashboard/kpis");
  return res.data;
};

export function DashboardKpiSection() {
  const [kpis, setKpis] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKpis = async () => {
      try {
        const data = await getDashboardKpis();
       
        setKpis([
          {
            title: "Tổng doanh thu",
            total: `${formatNumber(data.data.totalRevenue, "₫")}`,
            today: `${formatNumber(data.data.todayRevenue, "₫")} `,
            changePercent: 0, // backend chưa có thì để 0
          },
          {
            title: "Tổng đơn hàng",
            total: `${data.data.totalOrders} đơn`,
            today: `${data.data.todayOrders} đơn`,
            changePercent: 0,
          },
          {
            title: "Tổng người dùng",
            total: `${data.data.totalUsers} người`,
            today: `${data.data.todayUsers} mới`,
            changePercent: 0,
          },
          {
            title: "Tổng đánh giá",
            total: `${data.data.totalReviews} đánh giá`,
            today: `${data.data.todayReviews} review`,
            changePercent: 0,
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchKpis();
  }, []);

  if (loading) {
    return <div className="text-sm text-muted-foreground">Đang tải KPI...</div>;
  }
  console.log("KPI Data:", kpis);

  return (
    <section className="w-full">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <KpiCard
            key={kpi.title}
            title={kpi.title}
            total={kpi.total}
            today={kpi.today}
            changePercent={kpi.changePercent}
          />
        ))}
      </div>
    </section>
  )
}
