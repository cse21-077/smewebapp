"use client"

import { useEffect, useRef, useState } from "react"
import { models, service, factories, type IEmbedConfiguration } from "powerbi-client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { RefreshCw } from "lucide-react"

interface PowerBIReportProps {
  reportId: string
  embedToken?: string
  embedUrl?: string
  filterPaneEnabled?: boolean
  navContentPaneEnabled?: boolean
  onReportLoaded?: () => void
  onReportError?: (error: any) => void
  className?: string
}

export function PowerBIReport({
  reportId,
  embedToken,
  embedUrl,
  filterPaneEnabled = true,
  navContentPaneEnabled = true,
  onReportLoaded,
  onReportError,
  className,
}: PowerBIReportProps) {
  const reportContainerRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [report, setReport] = useState<models.IReport | null>(null)

  // This function would typically be a server action or API call to get the embed token
  const getEmbedToken = async () => {
    // In a real implementation, this would be a call to your backend
    // which would then call the Power BI API to get an embed token
    try {
      // Simulating API call
      return {
        token: embedToken || "sample-token-would-come-from-server",
        embedUrl: embedUrl || `https://app.powerbi.com/reportEmbed?reportId=${reportId}`,
      }
    } catch (error) {
      console.error("Error getting embed token:", error)
      throw error
    }
  }

  const embedReport = async () => {
    if (!reportContainerRef.current) return

    setIsLoading(true)
    setError(null)

    try {
      // In a real implementation, get the token from your server
      const { token, embedUrl } = await getEmbedToken()

      // Create the embed configuration
      const embedConfig: IEmbedConfiguration = {
        type: "report",
        id: reportId,
        embedUrl: embedUrl,
        accessToken: token,
        tokenType: models.TokenType.Embed,
        permissions: models.Permissions.All,
        settings: {
          panes: {
            filters: {
              expanded: false,
              visible: filterPaneEnabled,
            },
            pageNavigation: {
              visible: true,
            },
          },
          background: models.BackgroundType.Transparent,
          navContentPaneEnabled: navContentPaneEnabled,
        },
      }

      // Get a reference to the Power BI service
      const powerbi = new service.Service(factories.hpmFactory, factories.wpmpFactory, factories.routerFactory)

      // Embed the report
      const report = powerbi.embed(reportContainerRef.current, embedConfig) as models.IReport

      // Handle report loaded event
      report.on("loaded", () => {
        setIsLoading(false)
        if (onReportLoaded) onReportLoaded()
      })

      // Handle report error event
      report.on("error", (event) => {
        setIsLoading(false)
        setError(event.detail.message)
        if (onReportError) onReportError(event.detail)
      })

      setReport(report)
    } catch (error) {
      console.error("Error embedding report:", error)
      setIsLoading(false)
      setError("Failed to load the report. Please try again later.")
      if (onReportError) onReportError(error)
    }
  }

  useEffect(() => {
    embedReport()

    // Cleanup function
    return () => {
      if (report) {
        report.off("loaded")
        report.off("error")
        service.Service.reset(reportContainerRef.current!)
      }
    }
  }, [reportId, embedToken, embedUrl])

  const handleRefresh = () => {
    if (report) {
      report.refresh()
    } else {
      embedReport()
    }
  }

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardContent className="p-0">
        {error ? (
          <div className="flex h-[500px] flex-col items-center justify-center space-y-4 p-6">
            <p className="text-center text-red-500">{error}</p>
            <Button onClick={handleRefresh}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        ) : (
          <div className="relative">
            {isLoading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80">
                <div className="flex flex-col items-center space-y-4">
                  <Skeleton className="h-[400px] w-full rounded-lg" />
                  <div className="flex items-center space-x-2">
                    <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
                    <span>Loading report...</span>
                  </div>
                </div>
              </div>
            )}
            <div
              ref={reportContainerRef}
              className="h-[600px] w-full"
              style={{ minHeight: "600px" }}
              data-powerbi-embed-type="report"
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
