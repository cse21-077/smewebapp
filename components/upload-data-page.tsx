"use client"

import { useState, useEffect } from "react"
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
  const [realDataPreview, setRealDataPreview] = useState<any[]>([])

  // Fetch data preview when tab changes or after successful upload
  useEffect(() => {
    if (activeTab) {
      fetchDataPreview()
    }
  }, [activeTab])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadedFile(file)
    setUploadStatus("uploading")
    setUploadProgress(0)

    const formData = new FormData()
    formData.append("file", file)

    // Log the request for debugging
    console.log(`Uploading file to /api/upload?type=${activeTab}`, file.name, file.type)

    try {
      const response = await axios.post(`/api/upload?type=${activeTab}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / (progressEvent.total ?? 1))
          setUploadProgress(progress)
        },
      })

      console.log("Upload response:", response.data)

      if (response.status === 200) {
        setUploadStatus("success")
        // Fetch the updated data preview after successful upload
        fetchDataPreview()
      } else {
        throw new Error(`Upload failed with status: ${response.status}`)
      }
    } catch (error: any) {
      console.error("Upload error:", error)
      let errorMessage = "Error uploading file. Please try again."
      
      // Try to extract error message from the response
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error
        console.error("Server error:", errorMessage)
      }
      
      // Set error status with the extracted message
      setUploadStatus("error")
      
      // Display the error to the user in an alert
      alert(`Upload failed: ${errorMessage}`)
    }
  }

  const handleDeleteData = async () => {
    try {
      const res = await axios.delete(`/api/upload?type=${activeTab}`)
      if (res.status === 200) {
        setRealDataPreview([])
        setUploadStatus("idle")
        setUploadedFile(null)
      }
    } catch (err) {
      console.error("Failed to delete data", err)
    }
  }

  const fetchDataPreview = async () => {
    try {
      console.log(`Fetching data preview for ${activeTab}_data`);
      const res = await axios.get(`/api/upload?type=${activeTab}`);
      console.log("Data preview response:", res.data);
      
      if (res.data?.data?.length > 0) {
        setRealDataPreview(res.data.data || []);
        // If we have data, update the upload status to show it was successful
        setUploadStatus("success");
      } else {
        setRealDataPreview([]);
        // Reset upload status if no data is found
        setUploadStatus("idle");
      }
    } catch (err) {
      console.error("Failed to fetch preview", err);
      setRealDataPreview([]);
      // Do not change upload status here - we want to keep any error state
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
            id={`file-upload-${activeTab}`}
          />
          <label htmlFor={`file-upload-${activeTab}`} className="cursor-pointer">
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
            <AlertDescription id="upload-error-message">
              Error uploading file. Please ensure you're uploading a valid CSV file.
            </AlertDescription>
          </Alert>
        )}
      </div>
    )
  }

  const renderDataPreview = () => {
    if (realDataPreview.length === 0) return null
  
    return (
      <div className="mt-6">
        <h3 className="text-lg font-medium mb-4">Uploaded Data Preview</h3>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {Object.keys(realDataPreview[0]).map((key) => (
                  <TableHead key={key}>{key}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {realDataPreview.slice(0, 5).map((row, index) => (
                <TableRow key={index}>
                  {Object.values(row).map((value, i) => (
                    <TableCell key={i}>{String(value)}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="mt-4 flex justify-end">
          <Button variant="destructive" onClick={handleDeleteData}>
            Delete Uploaded Data
          </Button>
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
            <CardContent>
              {renderUploadArea()}
              {renderDataPreview()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customer">
          <Card>
            <CardHeader>
              <CardTitle>Customer Data Upload</CardTitle>
              <CardDescription>Upload your customer information and purchase history.</CardDescription>
            </CardHeader>
            <CardContent>
              {renderUploadArea()}
              {renderDataPreview()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="promotions">
          <Card>
            <CardHeader>
              <CardTitle>Promotions Data Upload</CardTitle>
              <CardDescription>Upload your promotional campaign data and results.</CardDescription>
            </CardHeader>
            <CardContent>
              {renderUploadArea()}
              {renderDataPreview()}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-4">
        <Button variant="outline">Cancel</Button>
        <Button disabled={realDataPreview.length === 0}>Process Data</Button>
      </div>
    </div>
  )
}