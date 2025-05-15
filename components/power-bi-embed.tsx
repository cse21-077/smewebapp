
"use client"

import { useEffect, useRef } from "react"

interface PowerBIReportProps {
  reportId: string;
  embedUrl?: string;
  filterPaneEnabled?: boolean;
  navContentPaneEnabled?: boolean;
  onReportLoaded?: () => void;
  onReportError?: () => void;
}

export function PowerBIReport({
  reportId,
  embedUrl = "https://app.powerbi.com/view?r=",
  filterPaneEnabled = false,
  navContentPaneEnabled = false,
  onReportLoaded,
  onReportError
}: PowerBIReportProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Map of report IDs to actual embed URLs
  // In a real application, you might fetch these from an API or environment variables
  const reportEmbedUrls: Record<string, string> = {
    // Use your actual Power BI embed URL here as default
    "default": "eyJrIjoiZDA3N2Y2NTYtMTQxMS00MDFkLTk5YWYtNDMzNzY1ZGQwMDI3IiwidCI6ImVlMjkyOTc3LTdiNTgtNGRmNC04MTM4LTUwZDBkZTdkMjhkOCIsImMiOjh9",
    "current-quarter-report-id": "eyJrIjoiZDA3N2Y2NTYtMTQxMS00MDFkLTk5YWYtNDMzNzY1ZGQwMDI3IiwidCI6ImVlMjkyOTc3LTdiNTgtNGRmNC04MTM4LTUwZDBkZTdkMjhkOCIsImMiOjh9",
    "previous-quarter-report-id": "eyJrIjoiZDA3N2Y2NTYtMTQxMS00MDFkLTk5YWYtNDMzNzY1ZGQwMDI3IiwidCI6ImVlMjkyOTc3LTdiNTgtNGRmNC04MTM4LTUwZDBkZTdkMjhkOCIsImMiOjh9",
    "year-to-date-report-id": "eyJrIjoiZDA3N2Y2NTYtMTQxMS00MDFkLTk5YWYtNDMzNzY1ZGQwMDI3IiwidCI6ImVlMjkyOTc3LTdiNTgtNGRmNC04MTM4LTUwZDBkZTdkMjhkOCIsImMiOjh9",
    "custom-range-report-id": "eyJrIjoiZDA3N2Y2NTYtMTQxMS00MDFkLTk5YWYtNDMzNzY1ZGQwMDI3IiwidCI6ImVlMjkyOTc3LTdiNTgtNGRmNC04MTM4LTUwZDBkZTdkMjhkOCIsImMiOjh9",
  };

  useEffect(() => {
    // Handle iframe load event
    const handleLoad = () => {
      if (onReportLoaded) {
        onReportLoaded();
      }
    };

    // Handle iframe error event
    const handleError = () => {
      if (onReportError) {
        onReportError();
      }
    };

    const iframe = iframeRef.current;
    if (iframe) {
      iframe.addEventListener("load", handleLoad);
      iframe.addEventListener("error", handleError);
    }

    return () => {
      if (iframe) {
        iframe.removeEventListener("load", handleLoad);
        iframe.removeEventListener("error", handleError);
      }
    };
  }, [onReportLoaded, onReportError]);

  // Get the embed URL for the current reportId
  const reportEmbedUrl = reportEmbedUrls[reportId] || reportEmbedUrls.default;
  
  // Construct the full embed URL with filter pane and nav content pane parameters
  const fullEmbedUrl = `${embedUrl}${reportEmbedUrl}&filterPaneEnabled=${filterPaneEnabled}&navContentPaneEnabled=${navContentPaneEnabled}&embedImagePlaceholder=true`;

  return (
    <div className="w-full h-[600px] border border-gray-200 rounded-md overflow-hidden">
      <iframe
        ref={iframeRef}
        title="Power BI Report"
        width="100%"
        height="100%"
        src={fullEmbedUrl}
        frameBorder="0"
        allowFullScreen={true}
      />
    </div>
  );
}