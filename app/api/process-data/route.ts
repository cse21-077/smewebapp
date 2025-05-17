import { NextRequest, NextResponse } from "next/server"
import { MongoClient } from "mongodb"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { AdvancedAnalytics, BusinessData } from "@/lib/ml/data-processor"

export async function POST(req: NextRequest) {
  try {
    // Get user session
    const supabase = createServerComponentClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // Connect to MongoDB
    const client = await MongoClient.connect(process.env.MONGODB_URI!)
    const db = client.db("predictiq")

    // Get user's data
    const data = (await db.collection("sales_data")
      .find({ userId: userId })
      .toArray()) as unknown as BusinessData[]

    if (!data || data.length === 0) {
      await client.close()
      return NextResponse.json({ 
        error: "No data found", 
        message: "Please upload your sales data first" 
      }, { status: 404 })
    }

    // Process data using our analytics pipeline
    const results = await AdvancedAnalytics.processData(data)

    // Store results
    await db.collection("ml_results").updateOne(
      { userId: userId },
      { 
        $set: {
          results,
          updatedAt: new Date()
        }
      },
      { upsert: true }
    )

    await client.close()

    return NextResponse.json({
      success: true,
      results
    })

  } catch (error) {
    console.error("Process data error:", error)
    return NextResponse.json({ 
      error: "processing_error",
      message: (error as Error).message 
    }, { status: 500 })
  }
}
