"use client"

import { useState } from "react"
import axios from "axios"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, CheckCircle2, AlertCircle } from "lucide-react"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table"

export function UploadDataPage() {
  const [activeTab, setActiveTab] = useState("sales")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle")
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadedFile(file)
    setUploadStatus("uploading")
    setUploadProgress(0)

    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await axios.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / (progressEvent.total ?? 1))
          setUploadProgress(progress)
        },
      })

      if (response.status === 200) {
        setUploadStatus("success")
      } else {
        throw new Error("Upload failed")
      }
    } catch (error) {
      setUploadStatus("error")
    }
  }

  const renderUploadArea = () => {
    return (
      <div className="mt-6 space-y-6">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <input
            type="file"
            accept=".csv,.xlsx"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-4 text-sm text-gray-600">Click to upload or drag and drop</p>
            <p className="text-xs text-gray-500">CSV, XLSX up to 10MB</p>
          </label>
        </div>

        {uploadStatus === "uploading" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>{uploadedFile?.name}</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}

        {uploadStatus === "success" && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              File uploaded successfully. Data is now stored in MongoDB.
            </AlertDescription>
          </Alert>
        )}

        {uploadStatus === "error" && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Error uploading file. Please try again.</AlertDescription>
          </Alert>
        )}
      </div>
    )
  }

  const renderDataPreview = () => {
    if (uploadStatus !== "success") return null

    return (
      <div className="mt-6">
        <h3 className="text-lg font-medium mb-4">Data Preview</h3>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Product ID</TableHead>
                <TableHead>Product Name</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>2023-06-01</TableCell>
                <TableCell>PRD-001</TableCell>
                <TableCell>Wireless Earbuds</TableCell>
                <TableCell className="text-right">24</TableCell>
                <TableCell className="text-right">$129.99</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>2023-06-01</TableCell>
                <TableCell>PRD-002</TableCell>
                <TableCell>Smart Watch</TableCell>
                <TableCell className="text-right">12</TableCell>
                <TableCell className="text-right">$249.99</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>2023-06-02</TableCell>
                <TableCell>PRD-003</TableCell>
                <TableCell>Bluetooth Speaker</TableCell>
                <TableCell className="text-right">8</TableCell>
                <TableCell className="text-right">$79.99</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Upload Data</h1>
        <p className="text-muted-foreground">Upload your business data for analysis and insights.</p>
      </div>

      <Tabs defaultValue="sales" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sales">Sales Data</TabsTrigger>
          <TabsTrigger value="inventory">Inventory Data</TabsTrigger>
          <TabsTrigger value="customer">Customer Data</TabsTrigger>
          <TabsTrigger value="promotions">Promotions</TabsTrigger>
        </TabsList>

        <TabsContent value="sales">
          <Card>
            <CardHeader>
              <CardTitle>Sales Data Upload</CardTitle>
              <CardDescription>Upload your sales transaction data in CSV or Excel format.</CardDescription>
            </CardHeader>
            <CardContent>
              {renderUploadArea()}
              {renderDataPreview()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Data Upload</CardTitle>
              <CardDescription>Upload your current inventory levels and product information.</CardDescription>
            </CardHeader>
            <CardContent>{renderUploadArea()}</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customer">
          <Card>
            <CardHeader>
              <CardTitle>Customer Data Upload</CardTitle>
              <CardDescription>Upload your customer information and purchase history.</CardDescription>
            </CardHeader>
            <CardContent>{renderUploadArea()}</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="promotions">
          <Card>
            <CardHeader>
              <CardTitle>Promotions Data Upload</CardTitle>
              <CardDescription>Upload your promotional campaign data and results.</CardDescription>
            </CardHeader>
            <CardContent>{renderUploadArea()}</CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-4">
        <Button variant="outline">Cancel</Button>
        <Button disabled={uploadStatus !== "success"}>Process Data</Button>
      </div>
    </div>
  )
}
