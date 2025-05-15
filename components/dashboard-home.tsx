"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, TrendingUp, Package, DollarSign, AlertTriangle } from "lucide-react"
import { LineChart, BarChart } from "@/components/ui/chart"

interface SalesData {
  date: string;
  amount: number;
  quantity: number;
  product?: string;
}

interface InventoryData {
  name: string;
  current: number;
  recommended: number;
}

interface Product {
  product: string;
  amount: number;
}

interface Trend {
  name: string;
  description: string;
  searchVolume: number;
}

interface Recommendation {
  title: string;
  description: string;
  items?: Array<{ name: string; value: string }>;
  action: string;
}

interface ApiResponse {
  historicalData?: SalesData[];
  inventoryStatus?: InventoryData[];
  metrics?: {
    totalSales?: number;
    monthlyGrowth?: number;
    critical?: number;
    newTrends?: number;
  };
  topProducts?: Product[];
  trends?: Trend[];
  lowStock?: Array<{ name: string; currentStock: number; recommendedOrder: number }>;
  needsReorder?: Array<{ name: string; currentStock: number; recommendedOrder: number }>;
  recommendations?: Recommendation[];
  predictions?: SalesData[];
}

export function DashboardHome() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/process-data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dataType: "sales" }),
        });
        const result = await response.json();
        if (result.error) {
          setError(result.message);
        } else {
          setData(result.results);
        }
      } catch {
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!data) return <div>No datasets uploaded. Please upload data in the upload tab to see insights.</div>;

  const lowStockItems = data.inventoryStatus?.filter(item => item.current < 8) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Your business analytics and insights at a glance.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">P {data.metrics?.totalSales || 0}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500 flex items-center">
                +{data.metrics?.monthlyGrowth || 0}% <ArrowUpRight className="ml-1 h-3 w-3" />
              </span>{" "}
              from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockItems.length} Products</div>
            <p className="text-xs text-muted-foreground">Below 8 units - restock soon</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Market Trends</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(data.trends?.length || 0) + (data.topProducts?.length || 0)}</div>
            <p className="text-xs text-muted-foreground">
              Trending products based on recent high demand
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Top Products by Sales</CardTitle>
            <CardDescription>Products contributing the most to revenue</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <BarChart
              data={(data.topProducts || []).slice(0, 5)}
              index="product"
              categories={["amount"]}
              colors={["green"]}
              valueFormatter={(value: number) => `P ${value}`}
              className="h-full"
            />
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Inventory Stock Levels</CardTitle>
            <CardDescription>Compare current vs recommended inventory</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <BarChart
              data={data.inventoryStatus || []}
              index="name"
              categories={["current", "recommended"]}
              colors={["red", "blue"]}
              valueFormatter={(value: number) => `${value} units`}
              className="h-full"
            />
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Alerts & Notifications</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {lowStockItems.map((item, idx) => (
            <Alert key={idx} variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle className="ml-2">Stock Alert</AlertTitle>
              <AlertDescription>
                Product "{item.name}" is low on stock ({item.current} units left).
              </AlertDescription>
            </Alert>
          ))}
        </div>
      </div>

      {/* Trending Products as Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Trending Products</CardTitle>
          <CardDescription>Demand growth by product</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <BarChart
            data={data.topProducts || []}
            index="product"
            categories={["amount"]}
            colors={["emerald"]}
            valueFormatter={(value: number) => `+${value}%`}
            className="h-full"
          />
        </CardContent>
      </Card>
    </div>
  );
}
