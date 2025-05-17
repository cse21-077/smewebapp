import { NextRequest, NextResponse } from "next/server"
import { MongoClient } from "mongodb"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function GET(req: NextRequest) {
  try {
    const supabase = createServerComponentClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const client = await MongoClient.connect(process.env.MONGODB_URI!)
    const db = client.db("predictiq")
    
    const combinedData = await db.collection("combined_data")
      .find({ userId: userId })
      .count()

    const mlResults = await db.collection("ml_results")
      .find({ userId: userId })
      .count()

    await client.close()

    return NextResponse.json({
      dataCount: combinedData,
      resultsCount: mlResults,
      userId: userId
    })
  } catch (error) {
    console.error("Debug error:", error)
    return NextResponse.json({ error: "debug_error", message: (error as Error).message }, { status: 500 })
  }
}