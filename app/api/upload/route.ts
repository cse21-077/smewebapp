import { NextRequest, NextResponse } from "next/server"
import { MongoClient, Document } from "mongodb"
import Papa from "papaparse"
import fs from "fs"
import path from "path"
import os from "os"

const getDbClient = async () => {
  const uri = process.env.MONGODB_URI as string
  if (!uri) throw new Error("MONGODB_URI not set")
  return await MongoClient.connect(uri)
}

export async function POST(req: NextRequest) {
  try {
    // Log the incoming request details for debugging
    console.log("Upload request received for URL:", req.nextUrl.toString());
    
    const formData = await req.formData()
    const file = formData.get("file") as File
    const dataType = req.nextUrl.searchParams.get("type") || "sales"
    
    console.log("Processing upload for data type:", dataType);
    
    const collectionName = `${dataType}_data`
    
    if (!file) {
      console.error("No file found in request");
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }
    
    console.log("File received:", file.name, "Size:", file.size);

    const buffer = Buffer.from(await file.arrayBuffer())
    const filePath = path.join(os.tmpdir(), file.name)
    fs.writeFileSync(filePath, buffer)

    const fileContent = fs.readFileSync(filePath, "utf8")
    
    // Handle different file types
    let parsedData;
    if (file.name.toLowerCase().endsWith('.csv')) {
      console.log("Parsing CSV file");
      const parsed = Papa.parse(fileContent, { 
        header: true, 
        skipEmptyLines: true, 
        dynamicTyping: true 
      })
      
      if (parsed.errors.length > 0) {
        console.error("CSV parsing errors:", parsed.errors);
        return NextResponse.json({ error: "Error parsing CSV", details: parsed.errors }, { status: 400 })
      }
      
      parsedData = parsed.data;
    } else if (file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls')) {
      // If you need to handle Excel files, you would add that logic here
      console.error("Excel file format not supported directly");
      return NextResponse.json({ error: "Excel files are not currently supported. Please convert to CSV." }, { status: 400 })
    } else {
      console.error("Unsupported file format");
      return NextResponse.json({ error: "Unsupported file format. Please upload CSV files." }, { status: 400 })
    }
    
    // Ensure we have valid data to insert
    if (!Array.isArray(parsedData) || parsedData.length === 0) {
      console.error("No valid data to insert");
      return NextResponse.json({ error: "No valid data found in file" }, { status: 400 })
    }
    
    console.log(`Inserting ${parsedData.length} records into ${collectionName}`);

    const client = await getDbClient()
    const db = client.db("predictiq")
    const collection = db.collection(collectionName)

    const result = await collection.insertMany(parsedData as Document[])
    console.log(`Inserted ${result.insertedCount} documents`);

    // Clean up the temp file
    fs.unlinkSync(filePath)
    await client.close()

    return NextResponse.json({
      message: `Uploaded to ${collectionName}`,
      type: dataType,
      insertedCount: result.insertedCount,
      preview: parsedData.slice(0, 5),
    })
  } catch (err: any) {
    console.error("Upload error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const dataType = req.nextUrl.searchParams.get("type") || "sales"
    const collectionName = `${dataType}_data`

    const client = await getDbClient()
    const db = client.db("predictiq")
    const collection = db.collection(collectionName)

    const data = await collection.find().sort({ _id: -1 }).limit(10).toArray()
    await client.close()

    return NextResponse.json({ data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const dataType = req.nextUrl.searchParams.get("type") || "sales"
    const collectionName = `${dataType}_data`

    const client = await getDbClient()
    const db = client.db("predictiq")
    const collection = db.collection(collectionName)

    const result = await collection.deleteMany({})
    await client.close()

    return NextResponse.json({ deletedCount: result.deletedCount })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}