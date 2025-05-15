"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Download, Share2, Bookmark, RefreshCw } from "lucide-react"
import { PowerBIReport } from "@/components/power-bi-embed"

export function ReportsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isReportLoaded, setIsReportLoaded] = useState(true)
  const [reportPeriod, setReportPeriod] = useState("current")

  const handleRefresh = () => {
    setIsLoading(true)
    setIsReportLoaded(false)

    // Simulate loading
    setTimeout(() => {
      setIsLoading(false)
      setIsReportLoaded(true)
    }, 2000)
  }

  // Map report periods to report IDs (in a real app, these would be actual Power BI report IDs)
  const reportIdMap = {
    current: "current-quarter-report-id",
    previous: "previous-quarter-report-id",
    ytd: "year-to-date-report-id",
    custom: "custom-range-report-id",
  }

  const handleReportPeriodChange = (value: string) => {
    setReportPeriod(value)
    setIsLoading(true)

    // Simulate loading when changing report period
    setTimeout(() => {
      setIsLoading(false)
    }, 1500)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">Interactive business intelligence reports and analytics.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Select value={reportPeriod} onValueChange={handleReportPeriodChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Report Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">Current Quarter</SelectItem>
              <SelectItem value="previous">Previous Quarter</SelectItem>
              <SelectItem value="ytd">Year to Date</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
            {isLoading ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="business">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="business">Business Intelligence</TabsTrigger>
          <TabsTrigger value="sales">Sales Analysis</TabsTrigger>
          <TabsTrigger value="inventory">Inventory Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="business">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <div>
                  <CardTitle>Interactive Business Intelligence Report</CardTitle>
                  <CardDescription>Comprehensive analysis of business performance and trends</CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="icon">
                    <Download className="h-4 w-4" />
                    <span className="sr-only">Download</span>
                  </Button>
                  <Button variant="outline" size="icon">
                    <Share2 className="h-4 w-4" />
                    <span className="sr-only">Share</span>
                  </Button>
                  <Button variant="outline" size="icon">
                    <Bookmark className="h-4 w-4" />
                    <span className="sr-only">Bookmark</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex h-[500px] flex-col items-center justify-center space-y-4">
                  <div className="flex items-center justify-center">
                    <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">Loading report...</p>
                </div>
              ) : isReportLoaded ? (
                <div className="space-y-4">
                  <PowerBIReport
                    reportId={reportIdMap[reportPeriod as keyof typeof reportIdMap]}
                    filterPaneEnabled={true}
                    navContentPaneEnabled={false}
                    onReportLoaded={() => setIsLoading(false)}
                    onReportError={() => {
                      setIsLoading(false);
                      setIsReportLoaded(false);
                    }}
                  />
                  <div className="space-y-2">
                    <h3 className="font-medium">Notes & Insights</h3>
                    <Textarea placeholder="Add your notes about this report here..." className="min-h-[100px]" />
                  </div>
                </div>
              ) : (
                <div className="flex h-[500px] flex-col items-center justify-center space-y-4">
                  <p className="text-muted-foreground">Report failed to load</p>
                  <Button onClick={handleRefresh}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Try Again
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales">
          <Card>
            <CardHeader>
              <CardTitle>Sales Analysis Report</CardTitle>
              <CardDescription>
                Detailed breakdown of sales performance by product, region, and time period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex h-[500px] items-center justify-center">
                <p className="text-muted-foreground">
                  Select "Business Intelligence" tab to view the interactive report
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Reports</CardTitle>
              <CardDescription>Stock levels, turnover rates, and inventory valuation reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex h-[500px] items-center justify-center">
                <p className="text-muted-foreground">
                  Select "Business Intelligence" tab to view the interactive report
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}