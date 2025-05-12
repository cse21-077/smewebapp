import { NextApiRequest, NextApiResponse } from "next"
import { MongoClient } from "mongodb"
import formidable from "formidable"
import fs from "fs"

export const config = {
  api: {
    bodyParser: false,
  },
}

const client = new MongoClient(process.env.MONGODB_URI || "")

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" })
  }

  const form = new formidable.IncomingForm()

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ message: "File upload error" })
    }

    const uploadedFiles = files.file
    if (!uploadedFiles || !Array.isArray(uploadedFiles) || uploadedFiles.length === 0) {
      return res.status(400).json({ message: "No file uploaded" })
    }
    const file = uploadedFiles[0]
    const fileData = fs.readFileSync(file.filepath)

    try {
      await client.connect()
      const db = client.db("your-database-name")
      const collection = db.collection("datasets")

      await collection.insertOne({
        filename: file.originalFilename,
        data: fileData,
        uploadedAt: new Date(),
      })

      res.status(200).json({ message: "File uploaded successfully" })
    } catch (error) {
      res.status(500).json({ message: "Database error" })
    } finally {
      await client.close()
    }
  })
}