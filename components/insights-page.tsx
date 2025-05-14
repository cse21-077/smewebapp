"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { LineChart, BarChart } from "@/components/ui/chart"
import { CalendarIcon, TrendingUp, Package, ArrowUpRight, AlertTriangle, DollarSign } from "lucide-react"
import { format } from "date-fns"

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

export function InsightsPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
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
  const demandForecastData = data.predictions || [];
  const inventoryData = data.inventoryStatus || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Insights</h1>
          <p className="text-muted-foreground">Predictive analytics and actionable insights for your business.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="electronics">Electronics</SelectItem>
              <SelectItem value="clothing">Clothing</SelectItem>
              <SelectItem value="home">Home Goods</SelectItem>
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
              <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <Tabs defaultValue="demand">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="demand">Demand Forecast</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="trends">Market Trends</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="demand" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Product Demand Forecast</CardTitle>
              <CardDescription>
                Projected demand for the next 6 weeks based on historical data and market trends
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <LineChart
                data={demandForecastData}
                index="date"
                categories={["amount"]}
                colors={["blue"]}
                valueFormatter={(value: number) => `${value} units`}
                className="h-full"
              />
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.topProducts?.map((product: Product, index: number) => (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">{product.product}</CardTitle>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">+{product.amount}%</div>
                  <p className="text-xs text-muted-foreground">Projected increase in demand</p>
                  <div className="mt-4">
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">High Confidence</Badge>
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
                data={inventoryData}
                index="name"
                categories={["current", "recommended"]}
                colors={["blue", "green"]}
                valueFormatter={(value: number) => `${value} units`}
                className="h-full"
              />
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-red-200">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Low Stock Alert</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.lowStock?.map((item: { name: string; currentStock: number; recommendedOrder: number }, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Package className="mr-2 h-4 w-4 text-red-500" />
                        <span>{item.name}</span>
                      </div>
                      <div className="text-sm font-medium">
                        {item.currentStock} units <span className="text-red-500">(Need {item.recommendedOrder} more)</span>
                      </div>
                    </div>
                  ))}
                </div>
                <Button className="mt-4 w-full">Order Inventory</Button>
              </CardContent>
            </Card>

            <Card className="border-green-200">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Excess Stock Alert</CardTitle>
                  <Package className="h-4 w-4 text-green-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.needsReorder?.map((item: { name: string; currentStock: number; recommendedOrder: number }, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Package className="mr-2 h-4 w-4 text-green-500" />
                        <span>{item.name}</span>
                      </div>
                      <div className="text-sm font-medium">
                        {item.currentStock} units <span className="text-green-500">({item.recommendedOrder} excess)</span>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="mt-4 w-full">
                  Plan Promotion
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Market Trends</CardTitle>
              <CardDescription>Emerging trends detected from market data and social media analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {data.trends?.map((trend: Trend, index: number) => (
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
                      <span>{trend.searchVolume}% increase in search volume</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Business Recommendations</CardTitle>
              <CardDescription>AI-generated actionable recommendations based on your business data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {data.recommendations?.map((recommendation: Recommendation, index: number) => (
                  <div key={index} className="rounded-lg border-l-4 border-red-500 bg-red-50 p-4">
                    <div className="flex items-center">
                      <AlertTriangle className="mr-2 h-5 w-5 text-red-500" />
                      <h3 className="font-medium text-red-800">{recommendation.title}</h3>
                    </div>
                    <p className="mt-2 text-sm text-red-700">
                      {recommendation.description}
                    </p>
                    <ul className="mt-3 space-y-2 text-sm text-red-700">
                      {recommendation.items?.map((item: { name: string; value: string }, idx: number) => (
                        <li key={idx} className="flex items-center justify-between">
                          <span>{item.name}</span>
                          <span className="font-medium">{item.value}</span>
                        </li>
                      ))}
                    </ul>
                    <Button className="mt-4 bg-red-600 hover:bg-red-700">{recommendation.action}</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
