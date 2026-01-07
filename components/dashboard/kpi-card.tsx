import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown } from "lucide-react"

type KpiCardProps = {
  title: string          // "Tổng doanh thu"
  total: string          // "38.500.000₫"
  today: string          // "1.250.000₫"
  changePercent: number  // 12.3, -8.1, ...
}

export function KpiCard({ title, total, today, changePercent }: KpiCardProps) {
  const isUp = changePercent >= 0
  const percentText = `${isUp ? "+" : ""}${changePercent.toFixed(1)}%`

  const badgeClass =
    "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border " +
    (isUp
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : "bg-red-50 text-red-700 border-red-200")

  return (
    <Card className="h-full">
      {/* Hàng 1: tiêu đề */}
      <CardHeader className="pb-0 gap-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Hàng 2: tổng cộng */}
        <div className="text-3xl font-bold tracking-tight">
          {total}
        </div>

        {/* Hàng 3: 2 cột (Hôm nay / Badge %) */}
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Hôm nay:{" "}
            <span className="font-medium text-foreground">
              {today}
            </span>
          </span>

          <span className={badgeClass}>
            {isUp ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {percentText}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
