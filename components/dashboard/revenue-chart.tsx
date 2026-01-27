"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { BASE_URL } from "@/lib/axios"
import { useAuthStore } from "@/store/useAuthStore"
export const description = "Biểu đồ doanh thu tương tác"

// Định nghĩa kiểu dữ liệu trả về từ API
interface RevenueData {
  date: string
  total: number
}

interface ApiResponse {
  last7Days: RevenueData[]
  last30Days: RevenueData[]
  last90Days: RevenueData[]
}

const chartConfig = {
  revenue: {
    label: "Doanh thu",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

export function RevenueChart() {
  const [timeRange, setTimeRange] = React.useState("7d")
  const [apiData, setApiData] = React.useState<ApiResponse | null>(null)
  const [loading, setLoading] = React.useState(true)
  const { accessToken } = useAuthStore();  // 1. Fetch dữ liệu từ API Backend
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${BASE_URL}/dashboard/revenue/all`, {
          headers: {
            "ngrok-skip-browser-warning": "true",
            authorization: `Bearer ${accessToken}`,
          },
          credentials: 'include'
        })
        const json = await response.json()
        if (json.statusCode === 200) {
          setApiData(json.data)
        }
      } catch (error) {
        console.error("Failed to fetch revenue data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // 2. Lọc dữ liệu dựa trên timeRange được chọn
  const filteredData = React.useMemo(() => {
    if (!apiData) return []

    switch (timeRange) {
      case "7d":
        return apiData.last7Days
      case "30d":
        return apiData.last30Days
      case "90d":
      default:
        return apiData.last90Days
    }
  }, [apiData, timeRange])

  // Hàm format tiền tệ VNĐ
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
  }

  // Tính tổng doanh thu trong khoảng thời gian đang chọn (để hiển thị title nếu cần)
  const totalRevenue = React.useMemo(() => {
    return filteredData.reduce((acc, curr) => acc + curr.total, 0)
  }, [filteredData])

  return (
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Biểu đồ doanh thu</CardTitle>
          <CardDescription>
            Tổng doanh thu: <span className="font-bold text-foreground">{formatCurrency(totalRevenue)}</span>
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="w-[160px] rounded-lg sm:ml-auto"
            aria-label="Chọn khoảng thời gian"
          >
            <SelectValue placeholder="3 tháng qua" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="7d" className="rounded-lg">
              7 ngày qua
            </SelectItem>
            <SelectItem value="30d" className="rounded-lg">
              1 tháng qua
            </SelectItem>
            <SelectItem value="90d" className="rounded-lg">
              3 tháng qua
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {loading ? (
          <div className="flex h-[250px] items-center justify-center text-muted-foreground">
            Đang tải dữ liệu...
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <AreaChart data={filteredData}>
              <defs>
                <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-revenue)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-revenue)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleDateString("vi-VN", {
                    month: "short",
                    day: "numeric",
                  })
                }}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString("vi-VN", {
                        weekday: "short", // Thứ
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                      })
                    }}
                    // Custom formatter cho tooltip hiển thị tiền
                    formatter={(value, name) => (
                      <div className="flex min-w-[130px] items-center gap-2 text-xs text-muted-foreground">
                        {chartConfig[name as keyof typeof chartConfig]?.label || name}
                        <div className="ml-auto flex items-baseline gap-0.5 font-mono font-medium text-foreground tabular-nums">
                          {formatCurrency(value as number)}
                        </div>
                      </div>
                    )}
                    indicator="dot"
                  />
                }
              />
              <Area
                dataKey="total"
                type="monotone" // Hoặc "natural" nếu muốn đường cong mềm hơn
                fill="url(#fillRevenue)"
                stroke="var(--color-revenue)"
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}