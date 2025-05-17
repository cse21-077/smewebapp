"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowUpRight, 
  TrendingUp, 
  Package, 
  DollarSign, 
  AlertTriangle,
  Users,
  ShoppingCart 
} from "lucide-react"
import { LineChart, BarChart, DonutChart } from "@/components/ui/chart"

interface AnalyticsResponse {
  salesAnalysis: {
    overall_metrics: {
      total_revenue: number;
      total_units: number;
      average_ticket_size: number;
    };
    top_products: Array<{
      product: string;
      revenue: number;
      units: number;
      average_price: number;
    }>;
    daily_sales: Array<{
      date: string;
      units_sold: number;
      transactions: number;
    }>;
  };
  customerSegments: Array<{
    demographic: string;
    segment: string;
    metrics: {
      recency: string;
      frequency: number;
      monetary: number;
    };
    score: number;
  }>;
  inventoryInsights: Array<{
    product: string;
    revenue: number;
    percentage: number;
    category: 'A' | 'B' | 'C';
    metrics: {
      stock_level: number;
      reorder_point: number;
    };
  }>;
  predictions: {
    historical: Array<{
      date: string;
      actual: number;
      moving_average: number | null;
    }>;
    forecast: Array<{
      date: string;
      predicted: number;
    }>;
  };
}

export function DashboardHome() {
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch("/api/process-data", {
          method: "POST",
          headers: { "Content-Type": "application/json" }
        })
        
        const result = await response.json()

        if (!response.ok) {
          console.error("API Error:", result)
          if (response.status === 401) {
            setError("Please sign in to view dashboard")
          } else if (response.status === 404) {
            setError("No data found. Please upload your sales data first")
          } else {
            setError(`Error: ${result.message || 'Failed to process data'}`)
          }
          return
        }

        if (!result.results) {
          setError("Invalid response format from server")
          return
        }

        setData(result.results)

      } catch (err) {
        console.error("Dashboard Error:", err)
        setError("Failed to fetch data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Also update the loading state UI
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading your analytics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!data) return <div>No datasets uploaded. Please upload data in the upload tab to see insights.</div>;

  const lowStockItems = data.inventoryInsights.filter(item => 
    item.metrics.stock_level < item.metrics.reorder_point
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Business Analytics Dashboard</h1>
        <p className="text-muted-foreground">Comprehensive insights from your retail data</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              BWP {data?.salesAnalysis?.overall_metrics?.total_revenue?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              Avg ticket: BWP {data?.salesAnalysis?.overall_metrics?.average_ticket_size?.toFixed(2) || '0.00'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Units Sold</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.salesAnalysis?.overall_metrics?.total_units?.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">Total products sold</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customer Segments</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.customerSegments?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Active customer groups</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.inventoryInsights?.filter(item => 
                item?.metrics?.stock_level < item?.metrics?.reorder_point
              )?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Products below reorder point</p>
          </CardContent>
        </Card>
      </div>

      {/* Sales Trends and Forecasting */}
      <Card>
        <CardHeader>
          <CardTitle>Sales Trend & Forecast</CardTitle>
          <CardDescription>Historical sales with 30-day prediction</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px]">
          <LineChart
            data={[
              ...data.predictions.historical.map(h => ({
                date: h.date,
                actual: h.actual,
                predicted: null,
                moving_average: h.moving_average
              })),
              ...data.predictions.forecast.map(f => ({
                date: f.date,
                actual: null,
                predicted: f.predicted,
                moving_average: null
              }))
            ]}
            index="date"
            categories={["actual", "predicted", "moving_average"]}
            colors={["blue", "green", "gray"]}
            valueFormatter={(value: number) => `${value.toFixed(0)} units`}
            className="h-full"
          />
        </CardContent>
      </Card>

      {/* Product Performance and Inventory */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Products</CardTitle>
            <CardDescription>Revenue contribution by product</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <BarChart
              data={data.salesAnalysis.top_products}
              index="product"
              categories={["revenue"]}
              colors={["green"]}
              valueFormatter={(value: number) => `BWP ${value.toLocaleString()}`}
              className="h-full"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ABC Inventory Analysis</CardTitle>
            <CardDescription>Product categorization by importance</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <DonutChart
              data={data.inventoryInsights.reduce((acc, item) => {
                const existing = acc.find(x => x.category === item.category);
                if (existing) {
                  existing.value += item.percentage;
                } else {
                  acc.push({ category: item.category, value: item.percentage });
                }
                return acc;
              }, [] as Array<{ category: string; value: number }>)}
              index="category"
              category="value"
              valueFormatter={(value: number) => `${value.toFixed(1)}%`}
              className="h-full"
            />
          </CardContent>
        </Card>
      </div>

      {/* Customer Segments and Stock Alerts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Customer Segments</CardTitle>
            <CardDescription>RFM Analysis Results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data?.customerSegments?.map((segment, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{segment?.demographic || 'Unknown'}</p>
                    <p className="text-sm text-muted-foreground">
                      Score: {segment?.score?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                  <Badge variant={
                    segment?.segment === 'High-Value' ? 'default' :
                    segment?.segment === 'Mid-Value' ? 'secondary' : 'outline'
                  }>
                    {segment?.segment || 'Unknown'}
                  </Badge>
                </div>
              )) || <p>No segment data available</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stock Alerts</CardTitle>
            <CardDescription>Products requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lowStockItems.map((item, idx) => (
                <Alert key={idx} variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Low Stock Alert</AlertTitle>
                  <AlertDescription>
                    {item.product} - Current: {item.metrics.stock_level} units
                    (Reorder at: {item.metrics.reorder_point} units)
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
