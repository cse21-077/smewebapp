"use client"

import { useState } from "react"
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

export function InsightsPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())

  // Sample data for charts
  const demandForecastData = [
    { name: "Week 1", value: 400 },
    { name: "Week 2", value: 450 },
    { name: "Week 3", value: 480 },
    { name: "Week 4", value: 520 },
    { name: "Week 5", value: 580 },
    { name: "Week 6", value: 600 },
  ]

  const inventoryData = [
    { name: "Product A", current: 80, recommended: 120 },
    { name: "Product B", current: 120, recommended: 100 },
    { name: "Product C", current: 30, recommended: 90 },
    { name: "Product D", current: 60, recommended: 60 },
  ]

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
                index="name"
                categories={["value"]}
                colors={["blue"]}
                valueFormatter={(value) => `${value} units`}
                className="h-full"
              />
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Wireless Earbuds</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+24%</div>
                <p className="text-xs text-muted-foreground">Projected increase in demand</p>
                <div className="mt-4">
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">High Confidence</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Smart Home Hub</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+18%</div>
                <p className="text-xs text-muted-foreground">Projected increase in demand</p>
                <div className="mt-4">
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">High Confidence</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Bluetooth Speaker</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+12%</div>
                <p className="text-xs text-muted-foreground">Projected increase in demand</p>
                <div className="mt-4">
                  <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Medium Confidence</Badge>
                </div>
              </CardContent>
            </Card>
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
                valueFormatter={(value) => `${value} units`}
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
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Package className="mr-2 h-4 w-4 text-red-500" />
                      <span>Product C</span>
                    </div>
                    <div className="text-sm font-medium">
                      30 units <span className="text-red-500">(Need 60 more)</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Package className="mr-2 h-4 w-4 text-red-500" />
                      <span>Product F</span>
                    </div>
                    <div className="text-sm font-medium">
                      15 units <span className="text-red-500">(Need 45 more)</span>
                    </div>
                  </div>
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
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Package className="mr-2 h-4 w-4 text-green-500" />
                      <span>Product B</span>
                    </div>
                    <div className="text-sm font-medium">
                      120 units <span className="text-green-500">(20 excess)</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Package className="mr-2 h-4 w-4 text-green-500" />
                      <span>Product H</span>
                    </div>
                    <div className="text-sm font-medium">
                      85 units <span className="text-green-500">(35 excess)</span>
                    </div>
                  </div>
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
                <div className="space-y-2">
                  <div className="flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5 text-green-500" />
                    <h3 className="text-lg font-medium">Sustainable Electronics</h3>
                    <Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-100">Rising Trend</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Increasing consumer interest in eco-friendly and sustainable electronic products with minimal
                    packaging and recyclable materials.
                  </p>
                  <div className="flex items-center text-sm text-blue-600">
                    <ArrowUpRight className="mr-1 h-4 w-4" />
                    <span>32% increase in search volume</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5 text-green-500" />
                    <h3 className="text-lg font-medium">Home Office Equipment</h3>
                    <Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-100">Rising Trend</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Continued growth in demand for ergonomic home office equipment, including adjustable desks,
                    ergonomic chairs, and monitor stands.
                  </p>
                  <div className="flex items-center text-sm text-blue-600">
                    <ArrowUpRight className="mr-1 h-4 w-4" />
                    <span>28% increase in search volume</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5 text-green-500" />
                    <h3 className="text-lg font-medium">Smart Home Integration</h3>
                    <Badge className="ml-2 bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Steady Trend</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Increasing interest in products that integrate with existing smart home ecosystems, particularly
                    those with voice control capabilities.
                  </p>
                  <div className="flex items-center text-sm text-blue-600">
                    <ArrowUpRight className="mr-1 h-4 w-4" />
                    <span>18% increase in search volume</span>
                  </div>
                </div>
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
                <div className="rounded-lg border-l-4 border-red-500 bg-red-50 p-4">
                  <div className="flex items-center">
                    <AlertTriangle className="mr-2 h-5 w-5 text-red-500" />
                    <h3 className="font-medium text-red-800">Urgent Restocking Required</h3>
                  </div>
                  <p className="mt-2 text-sm text-red-700">
                    Based on current demand and inventory levels, the following products need immediate restocking:
                  </p>
                  <ul className="mt-3 space-y-2 text-sm text-red-700">
                    <li className="flex items-center justify-between">
                      <span>Wireless Earbuds Pro (SKU: WEP-001)</span>
                      <span className="font-medium">Order 120 units</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Smart Home Hub (SKU: SHH-002)</span>
                      <span className="font-medium">Order 85 units</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Bluetooth Speaker (SKU: BTS-003)</span>
                      <span className="font-medium">Order 50 units</span>
                    </li>
                  </ul>
                  <Button className="mt-4 bg-red-600 hover:bg-red-700">Create Purchase Order</Button>
                </div>

                <div className="rounded-lg border-l-4 border-yellow-500 bg-yellow-50 p-4">
                  <div className="flex items-center">
                    <Package className="mr-2 h-5 w-5 text-yellow-500" />
                    <h3 className="font-medium text-yellow-800">Inventory Reduction Recommended</h3>
                  </div>
                  <p className="mt-2 text-sm text-yellow-700">
                    The following products are overstocked based on current demand forecasts:
                  </p>
                  <ul className="mt-3 space-y-2 text-sm text-yellow-700">
                    <li className="flex items-center justify-between">
                      <span>Wired Headphones (SKU: WH-004)</span>
                      <span className="font-medium">35% overstocked</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Tablet Accessories (SKU: TA-005)</span>
                      <span className="font-medium">28% overstocked</span>
                    </li>
                  </ul>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button variant="outline" className="border-yellow-500 text-yellow-700 hover:bg-yellow-100">
                      Create Promotion
                    </Button>
                    <Button variant="outline" className="border-yellow-500 text-yellow-700 hover:bg-yellow-100">
                      Adjust Pricing
                    </Button>
                  </div>
                </div>

                <div className="rounded-lg border-l-4 border-green-500 bg-green-50 p-4">
                  <div className="flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5 text-green-500" />
                    <h3 className="font-medium text-green-800">Product Mix Optimization</h3>
                  </div>
                  <p className="mt-2 text-sm text-green-700">
                    Based on market trends and customer behavior, we recommend the following product mix changes:
                  </p>
                  <ul className="mt-3 space-y-2 text-sm text-green-700">
                    <li className="flex items-center justify-between">
                      <span>Increase eco-friendly electronics inventory by 25%</span>
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">High Impact</Badge>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Add 3 new home office ergonomic products to your catalog</span>
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Medium Impact</Badge>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Expand smart home integration product line</span>
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Medium Impact</Badge>
                    </li>
                  </ul>
                  <Button className="mt-4 bg-green-600 hover:bg-green-700">View Detailed Report</Button>
                </div>

                <div className="rounded-lg border-l-4 border-blue-500 bg-blue-50 p-4">
                  <div className="flex items-center">
                    <DollarSign className="mr-2 h-5 w-5 text-blue-500" />
                    <h3 className="font-medium text-blue-800">Pricing Strategy Recommendations</h3>
                  </div>
                  <p className="mt-2 text-sm text-blue-700">
                    Our analysis suggests the following pricing adjustments to optimize revenue:
                  </p>
                  <ul className="mt-3 space-y-2 text-sm text-blue-700">
                    <li className="flex items-center justify-between">
                      <span>Increase Wireless Earbuds Pro price by 8%</span>
                      <span className="font-medium">+12% revenue impact</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Decrease Tablet Accessories price by 10%</span>
                      <span className="font-medium">+15% volume impact</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Bundle Smart Home products at 15% discount</span>
                      <span className="font-medium">+20% revenue impact</span>
                    </li>
                  </ul>
                  <Button className="mt-4 bg-blue-600 hover:bg-blue-700">Apply Recommendations</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
