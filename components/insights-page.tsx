"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { LineChart, BarChart } from "@/components/ui/chart";
import { CalendarIcon, TrendingUp, Package, ArrowUpRight, AlertTriangle, DollarSign, Users, ShoppingBag } from "lucide-react";
import { format } from "date-fns";

interface InsightsData {
  salesAnalysis: {
    overall_metrics: {
      total_revenue: number;
      total_units: number;
      average_ticket_size: number;
      monthly_growth: number;
    };
    top_products: Array<{
      product: string;
      revenue: number;
      units: number;
      growth: number;
      amount: number;
    }>;
    daily_sales: Array<{
      date: string;
      units_sold: number;
      revenue: number;
    }>;
  };
  topProducts: Array<{
    product: string;
    revenue: number;
    units: number;
    growth: number;
    amount: number;
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
  inventoryInsights: Array<{
    product: string;
    revenue: number;
    percentage: number;
    category: 'A' | 'B' | 'C';
    metrics: {
      stock_level: number;
      reorder_point: number;
      avg_daily_sales: number;
      lead_time: number;
      safety_stock: number;
      stock_coverage: number;
    };
  }>;
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
  trends: Array<{
    name: string;
    description: string;
    searchVolume: number;
  }>;
  recommendations: Array<{
    title: string;
    description: string;
    items: Array<{
      name: string;
      value: string;
    }>;
    action: string;
  }>;
  metrics: {
    predictedGrowth: number;
  };
  needsReorder: Array<{
    name: string;
    recommendedOrder: number;
  }>;
  lowStock: Array<{
    name: string;
    currentStock: number;
    daysRemaining: number;
  }>;
}

// Also add type definitions for parameters
interface TrendItem {
  name: string;
  description: string;
  searchVolume: number;
}

interface RecommendationItem {
  title: string;
  description: string;
  items: Array<{
    name: string;
    value: string;
  }>;
  action: string;
}

interface ReorderItem {
  name: string;
  recommendedOrder: number;
}

interface TopProduct {
  product: string;
  revenue: number;
  units: number;
  growth: number;
  amount: number;
}

export function InsightsPage() {
  const [date, setDate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<"demand" | "trends" | "inventory" | "customers">("demand");
  const [dataType, setDataType] = useState<"sales" | "inventory" | "customer">("sales");
  const [data, setData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInsights = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/process-data", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.status}`);
        }

        const result = await response.json();
        if (result.error) {
          setError(result.message || "Failed to process data");
        } else {
          setData(result.results);
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message || "Failed to fetch data");
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [dataType]);

  const handleTabChange = (value: string) => {
    const tabValue = value as "demand" | "trends" | "inventory" | "customers";
    setActiveTab(tabValue);
    switch (tabValue) {
      case "demand":
      case "trends":
        setDataType("sales");
        break;
      case "inventory":
        setDataType("inventory");
        break;
      case "customers":
        setDataType("customer");
        break;
      default:
        setDataType("sales");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="spinner w-12 h-12 border-4 border-t-blue-500 border-gray-200 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading insights...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
          <p className="text-red-700 font-medium">Error loading insights</p>
        </div>
        <p className="mt-2 text-red-600">{error}</p>
        <Button className="mt-4" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-md">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
          <p className="text-yellow-700 font-medium">No data available</p>
        </div>
        <p className="mt-2 text-yellow-600">
          No datasets available for analysis. Please upload sales, inventory or customer data to see insights.
        </p>
        <Button className="mt-4" onClick={() => window.location.href = "/upload"}>
          Upload Data
        </Button>
      </div>
    );
  }

  const formatChartData = () => {
    if (activeTab === "demand" && data?.predictions) {
      const historicalData = data.predictions.historical.map(item => ({
        date: item.date,
        amount: item.actual,
        type: "Historical"
      }));

      const predictionData = data.predictions.forecast.map(item => ({
        date: item.date,
        amount: item.predicted,
        type: "Predicted"
      }));

      return [...historicalData, ...predictionData];
    }

    if (activeTab === "inventory" && data?.inventoryInsights) {
      return data.inventoryInsights.map(item => ({
        name: item.product,
        current: item.metrics.stock_level,
        recommended: item.metrics.reorder_point
      }));
    }

    return [];
  };

  const getMetrics = () => {
    if (!data?.salesAnalysis?.overall_metrics) return {};

    const metrics = data.salesAnalysis.overall_metrics;
    const criticalItems = data.inventoryInsights?.filter(
      item => item.metrics.stock_level < item.metrics.reorder_point
    ).length || 0;

    return {
      totalSales: metrics.total_revenue,
      monthlyGrowth: metrics.monthly_growth,
      criticalItems,
      avgOrderValue: metrics.average_ticket_size,
      totalStock: data.inventoryInsights?.reduce(
        (sum, item) => sum + item.metrics.stock_level, 0
      ) || 0,
      totalCustomers: data.customerSegments?.length || 0
    };
  };

  const metrics = getMetrics();
  const chartData = formatChartData();

  const trendsData = data.trends || [
    {
      name: "Rising Demand for Maize Flour",
      description: "Based on your sales data, Maize Flour shows consistent demand growth.",
      searchVolume: 15
    },
    {
      name: "Seasonal Beverage Demand",
      description: "Coke and Sprite sales follow seasonal patterns with higher demand during warmer months.",
      searchVolume: 12
    }
  ];

  const recommendations = data.recommendations || [
    {
      title: "Critical Inventory Alert",
      description: data.lowStock && data.lowStock.length > 0
        ? `${data.lowStock[0].name} is running low and needs to be restocked.`
        : "Consider adjusting your inventory levels based on current sales data.",
      items: [
        { name: "Current Stock", value: data.lowStock && data.lowStock[0] ? `${data.lowStock[0].currentStock} units` : "Low" },
        { name: "Days Remaining", value: data.lowStock && data.lowStock[0] ? `${data.lowStock[0].daysRemaining} days` : "< 7 days" }
      ],
      action: "Order Inventory"
    },
    {
      title: "Increase Profitability",
      description: "Based on current sales data, consider bundling Coke and Sprite to increase average order value.",
      items: [
        { name: "Current AOV", value: `P${metrics.avgOrderValue || 35}` },
        { name: "Target AOV", value: `P${(metrics.avgOrderValue || 35) * 1.2}` }
      ],
      action: "Create Bundle"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI-Powered Insights</h1>
          <p className="text-muted-foreground">Predictive analytics and actionable insights for your business.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Product Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Products</SelectItem>
              <SelectItem value="maize">Maize Flour</SelectItem>
              <SelectItem value="beverages">Beverages</SelectItem>
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(selectedDate: Date | undefined) => {
                  if (selectedDate) {
                    setDate(selectedDate);
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">P{metrics.totalSales?.toFixed(2) || '0.00'}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.monthlyGrowth ? `${metrics.monthlyGrowth > 0 ? "+" : ""}${metrics.monthlyGrowth.toFixed(1)}%` : '0%'} from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Inventory Status</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalStock || 0} units</div>
            <p className="text-xs text-muted-foreground">
              {metrics.criticalItems} items need reordering
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Customer Orders</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalCustomers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Avg. P{metrics.avgOrderValue?.toFixed(2) || 0} per order
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="demand">Demand Forecast</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="trends">Market Trends</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
        </TabsList>

        <TabsContent value="demand" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Product Demand Forecast</CardTitle>
              <CardDescription>
                Projected demand for the next 30 days based on historical data and market trends
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <LineChart
                data={chartData}
                index="date"
                categories={["amount"]}
                colors={["blue"]}
                valueFormatter={(value) => `P${value.toFixed(2)}`}
                className="h-full"
              />
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.topProducts?.map((product: TopProduct, index: number) => (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">{product.product}</CardTitle>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">P{product.amount.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">Total revenue</p>
                  <div className="mt-4">
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                      {index < 2 ? "High Demand" : "Steady Sales"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Inventory Recommendations</CardTitle>
              <CardDescription>
                Current stock levels compared to recommended levels based on demand forecast
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <BarChart
                data={chartData}
                index="name"
                categories={["current", "recommended"]}
                colors={["blue", "green"]}
                valueFormatter={(value) => `${value} units`}
                className="h-full"
              />
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Low Stock Alert Card */}
            <Card className="border-red-200">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Low Stock Alert</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data?.inventoryInsights
                    ?.filter(item => item.metrics.stock_level < item.metrics.reorder_point)
                    .map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Package className="mr-2 h-4 w-4 text-red-500" />
                          <span>{item.product}</span>
                        </div>
                        <div className="text-sm font-medium">
                          {item.metrics.stock_level} units
                          <span className="text-red-500">
                            {` (Need ${item.metrics.reorder_point - item.metrics.stock_level} more)`}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
                <Button className="mt-4 w-full">Order Inventory</Button>
              </CardContent>
            </Card>

            <Card className="border-yellow-200">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Reorder Recommendations</CardTitle>
                  <ShoppingBag className="h-4 w-4 text-yellow-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.needsReorder?.map((item: ReorderItem, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Package className="mr-2 h-4 w-4 text-yellow-500" />
                        <span>{item.name}</span>
                      </div>
                      <div className="text-sm font-medium">
                        Order {item.recommendedOrder} units
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="mt-4 w-full">
                  Generate Purchase Order
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Market Trends</CardTitle>
              <CardDescription>Emerging trends detected from your sales data and market analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {trendsData.map((trend: TrendItem, index: number) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center">
                      <TrendingUp className="mr-2 h-5 w-5 text-green-500" />
                      <h3 className="text-lg font-medium">{trend.name}</h3>
                      <Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-100">Rising Trend</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {trend.description}
                    </p>
                    <div className="flex items-center text-sm text-blue-600">
                      <ArrowUpRight className="mr-1 h-4 w-4" />
                      <span>{trend.searchVolume}% increase in demand</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Product Performance</CardTitle>
              <CardDescription>Analysis of your current product mix performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                <div className="rounded-lg border p-4">
                  <div className="text-lg font-medium">Top Performer</div>
                  <div className="text-xl font-bold mt-2">
                    {data.topProducts && data.topProducts[0] ? data.topProducts[0].product : 'Coke'}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    P{data.topProducts && data.topProducts[0] ? data.topProducts[0].amount.toFixed(2) : '95.00'} in revenue
                  </div>
                </div>

                <div className="rounded-lg border p-4">
                  <div className="text-lg font-medium">Growth Opportunity</div>
                  <div className="text-xl font-bold mt-2">
                    {data.topProducts && data.topProducts[2] ? data.topProducts[2].product : 'Sprite'}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Potential for {data.metrics && data.metrics.predictedGrowth ? data.metrics.predictedGrowth.toFixed(1) : '12.5'}% growth
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Customers</CardTitle>
              <CardDescription>Your most valuable customers based on purchase history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "Tshepiso N.", purchases: 8, spent: 1280 },
                  { name: "Masego U.", purchases: 6, spent: 950 },
                  { name: "Rorisang X.", purchases: 5, spent: 800 },
                  { name: "Sebusi V.", purchases: 4, spent: 640 },
                  { name: "Puso R.", purchases: 3, spent: 460 }
                ].map((customer, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border-b">
                    <div>
                      <div className="font-medium">{customer.name}</div>
                      <div className="text-sm text-muted-foreground">{customer.purchases} purchases</div>
                    </div>
                    <div className="text-lg font-bold">P{customer.spent}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customer Insights</CardTitle>
              <CardDescription>Actionable insights about your customer base</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-lg bg-blue-50 p-4">
                  <div className="flex items-center">
                    <Users className="mr-2 h-5 w-5 text-blue-500" />
                    <h3 className="font-medium text-blue-800">Customer Segmentation</h3>
                  </div>
                  <p className="mt-2 text-sm text-blue-700">
                    Based on purchase history, 20% of your customers generate 80% of your revenue.
                  </p>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <div className="rounded bg-blue-100 p-2 text-center">
                      <div className="text-xs text-blue-700">High Value</div>
                      <div className="text-lg font-bold text-blue-800">20%</div>
                    </div>
                    <div className="rounded bg-blue-100 p-2 text-center">
                      <div className="text-xs text-blue-700">Mid Value</div>
                      <div className="text-lg font-bold text-blue-800">35%</div>
                    </div>
                    <div className="rounded bg-blue-100 p-2 text-center">
                      <div className="text-xs text-blue-700">Low Value</div>
                      <div className="text-lg font-bold text-blue-800">45%</div>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg bg-green-50 p-4">
                  <div className="flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5 text-green-500" />
                    <h3 className="font-medium text-green-800">Growth Opportunity</h3>
                  </div>
                  <p className="mt-2 text-sm text-green-700">
                    Increase average order value by 15% through cross-selling Maize Flour with beverages.
                  </p>
                  <Button className="mt-3 bg-green-600 hover:bg-green-700">Create Bundle Offers</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>AI Recommendations</CardTitle>
          <CardDescription>Smart suggestions based on your business data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {recommendations.map((recommendation: RecommendationItem, index: number) => (
              <div key={index} className="rounded-lg border-l-4 border-blue-500 bg-blue-50 p-4">
                <div className="flex items-center">
                  <AlertTriangle className="mr-2 h-5 w-5 text-blue-500" />
                  <h3 className="font-medium text-blue-800">{recommendation.title}</h3>
                </div>
                <p className="mt-2 text-sm text-blue-700">
                  {recommendation.description}
                </p>
                <ul className="mt-3 space-y-2 text-sm text-blue-700">
                  {recommendation.items?.map((item, idx) => (
                    <li key={idx} className="flex items-center justify-between">
                      <span>{item.name}</span>
                      <span className="font-medium">{item.value}</span>
                    </li>
                  ))}
                </ul>
                <Button className="mt-4 bg-blue-600 hover:bg-blue-700">{recommendation.action}</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
