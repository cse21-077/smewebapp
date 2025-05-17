"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, CheckCircle2, AlertCircle } from "lucide-react"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table"
import { useRouter } from "next/navigation"

export function UploadDataPage() {
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle")
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [dataPreview, setDataPreview] = useState<any[]>([])

  useEffect(() => {
    fetchDataPreview()
  }, [])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setUploadStatus("error")
      alert("Please upload a CSV file only")
      return
    }

    setUploadedFile(file)
    setUploadStatus("uploading")
    setUploadProgress(0)

    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await axios.post('/api/upload', formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / (progressEvent.total ?? 1))
          setUploadProgress(progress)
        },
      })

      if (response.status === 200) {
        setUploadStatus("success")
        fetchDataPreview()
      } else {
        throw new Error(`Upload failed with status: ${response.status}`)
      }
    } catch (error: any) {
      console.error("Upload error:", error)
      setUploadStatus("error")
      alert(`Upload failed: ${error.response?.data?.error || 'Unknown error'}`)
    }
  }

  const fetchDataPreview = async () => {
    try {
      const res = await axios.get('/api/upload')
      if (res.data?.data?.length > 0) {
        setDataPreview(res.data.data)
        setUploadStatus("success")
      } else {
        setDataPreview([])
      }
    } catch (err) {
      console.error("Failed to fetch preview", err)
      setDataPreview([])
    }
  }

  const handleDeleteData = async () => {
    try {
      await axios.delete('/api/upload')
      setDataPreview([])
      setUploadStatus("idle")
      setUploadedFile(null)
    } catch (err) {
      console.error("Failed to delete data", err)
    }
  }

  const router = useRouter()
  const handleProcessData = async () => {
    try {
      const response = await axios.post('/api/process-data', {
        dataType: 'combined'
      })
      if (response.data?.processed) {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error("Processing error:", error)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Upload Data</h1>
        <p className="text-muted-foreground">
          Upload your business data CSV file for analysis and insights.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Data Upload</CardTitle>
          <CardDescription>
            Upload your business data in CSV format with the following columns:
            Date, Store, Product, Category, Units_Sold, Price_per_Unit_BWP, Revenue_BWP,
            Competition_Price_BWP, Promotion_Active, Customer_Retention_Score,
            Stock_Level, Supplier, Lead_Time_Days, Customer_Demographic, Payment_Method
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-4 text-sm text-gray-600">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-500">CSV file up to 10MB</p>
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
                  File uploaded successfully. Data is now ready for processing.
                </AlertDescription>
              </Alert>
            )}

            {uploadStatus === "error" && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Error uploading file. Please ensure you're uploading a valid CSV file.
                </AlertDescription>
              </Alert>
            )}

            {dataPreview.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">Data Preview</h3>
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {Object.keys(dataPreview[0]).map((key) => (
                          <TableHead key={key}>{key}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dataPreview.slice(0, 5).map((row, index) => (
                        <TableRow key={index}>
                          {Object.values(row).map((value, i) => (
                            <TableCell key={i}>{String(value)}</TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="mt-4 flex justify-end space-x-4">
                  <Button variant="destructive" onClick={handleDeleteData}>
                    Delete Data
                  </Button>
                  <Button onClick={handleProcessData} disabled={uploadStatus !== "success"}>
                    Process Data
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}