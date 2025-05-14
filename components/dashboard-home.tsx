"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, TrendingUp, Package, DollarSign, AlertTriangle } from "lucide-react"
import { LineChart, BarChart } from "@/components/ui/chart"

// Define types for the data structures
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
  predictions?: SalesData[]; // Add predictions property
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
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ dataType: "sales" }), // or "customer", "inventory"
        });
        const result = await response.json();
        if (result.error) {
          setError(result.message);
        } else {
          setData(result.results);
        }
      } catch (err) {
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!data) {
    return <div>No datasets uploaded. Please upload data in the upload tab to see insights.</div>;
  }

  // Sample data for charts (replace with actual data from API)
  const lineChartData = data.historicalData || [];
  const barChartData = data.inventoryStatus || [];

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
            <div className="text-2xl font-bold">{data.inventoryStatus?.filter(item => item.current < item.recommended).length || 0} Products</div>
            <p className="text-xs text-muted-foreground">Require immediate attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Market Trends</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.trends?.length || 0} Detected</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500 flex items-center">
                +{data.trends?.reduce((sum, trend) => sum + trend.searchVolume, 0) || 0} <ArrowUpRight className="ml-1 h-3 w-3" />
              </span>{" "}
              new trends this week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Product Demand Over Time</CardTitle>
            <CardDescription>Monthly demand forecast for all products</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <LineChart
              data={lineChartData}
              index="date"
              categories={["amount"]}
              colors={["blue"]}
              valueFormatter={(value: number) => `${value} units`}
              className="h-full"
            />
          </CardContent>
        </Card>
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Inventory Stock Levels</CardTitle>
            <CardDescription>Current stock levels by product</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <BarChart
              data={barChartData}
              index="name"
              categories={["current", "recommended"]}
              colors={["blue", "green"]}
              valueFormatter={(value: number) => `${value} units`}
              className="h-full"
            />
          </CardContent>
        </Card>
      </div>

      {/* Alert Cards */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Alerts & Notifications</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle className="ml-2">Stock Alert</AlertTitle>
            <AlertDescription>
              Product "Premium Headphones" is running low on stock (5 units remaining).
            </AlertDescription>
          </Alert>
          <Alert>
            <Package className="h-4 w-4" />
            <AlertTitle className="ml-2">Expiring Products</AlertTitle>
            <AlertDescription>3 products will expire within the next 30 days.</AlertDescription>
          </Alert>
        </div>
      </div>

      {/* Trending Products */}
      <Card>
        <CardHeader>
          <CardTitle>Trending Products</CardTitle>
          <CardDescription>Products with increasing demand based on market analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.topProducts?.map((product: Product, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="mr-4 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Package className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{product.product}</p>
                    <p className="text-sm text-muted-foreground">Electronics</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">+{product.amount}% Demand</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
