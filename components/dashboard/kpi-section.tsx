import { KpiCard } from "./kpi-card"

const kpis = [
  {
    title: "Tổng doanh thu",
    total: "38.500.000₫",
    today: "1.250.000₫",
    changePercent: 12.3,
  },
  {
    title: "Tổng đơn hàng",
    total: "1.240 đơn",
    today: "42 đơn",
    changePercent: -8.1,
  },
  {
    title: "Tổng người dùng",
    total: "12.480 người",
    today: "18 mới",
    changePercent: 20.0,
  },
  {
    title: "Tổng đánh giá", // hoặc "Tổng sản phẩm"
    total: "880 đánh giá",
    today: "7 review",
    changePercent: -22.2,
  },
]

export function DashboardKpiSection() {
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
