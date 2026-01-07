'use client'
import { DashboardKpiSection } from "@/components/dashboard/kpi-section"
import DashboardPieRow from "@/components/dashboard/pie-row"
import { RevenueChart } from "@/components/dashboard/revenue-chart"

 // ⛔ Nếu để sai chỗ hoặc quên sẽ lỗi

export default function DashboardPage() {
  return (
    <div className="space-y-2">
      <div>Dashboard page</div>
       <DashboardKpiSection />
       <RevenueChart />
       <DashboardPieRow />
    </div>
  )
}
