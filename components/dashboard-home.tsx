"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, TrendingUp, Package, DollarSign, AlertTriangle } from "lucide-react"
import { LineChart, BarChart } from "@/components/ui/chart"

export function DashboardHome() {
  // Sample data for charts
  const lineChartData = [
    { name: "Jan", value: 400 },
    { name: "Feb", value: 300 },
    { name: "Mar", value: 500 },
    { name: "Apr", value: 450 },
    { name: "May", value: 470 },
    { name: "Jun", value: 600 },
  ]

  const barChartData = [
    { name: "Product A", value: 120 },
    { name: "Product B", value: 80 },
    { name: "Product C", value: 40 },
    { name: "Product D", value: 180 },
    { name: "Product E", value: 90 },
  ]

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
            <div className="text-2xl font-bold">P 45,231.89</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500 flex items-center">
                +20.1% <ArrowUpRight className="ml-1 h-3 w-3" />
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
            <div className="text-2xl font-bold">3 Products</div>
            <p className="text-xs text-muted-foreground">Require immediate attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Market Trends</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5 Detected</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500 flex items-center">
                +2 <ArrowUpRight className="ml-1 h-3 w-3" />
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
              index="name"
              categories={["value"]}
              colors={["blue"]}
              valueFormatter={(value) => `${value} units`}
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
              categories={["value"]}
              colors={["blue"]}
              valueFormatter={(value) => `${value} units`}
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
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="mr-4 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Wireless Earbuds Pro</p>
                  <p className="text-sm text-muted-foreground">Electronics</p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">+24% Demand</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="mr-4 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Smart Home Hub</p>
                  <p className="text-sm text-muted-foreground">Smart Home</p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">+18% Demand</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="mr-4 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Ergonomic Office Chair</p>
                  <p className="text-sm text-muted-foreground">Furniture</p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">+15% Demand</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
