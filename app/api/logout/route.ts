import { NextApiRequest, NextApiResponse } from "next"
import { createClient } from "@/lib/supabase/client"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" })
  }

  const supabase = createClient()

  try {
    const { error } = await supabase.auth.signOut()
    if (error) {
      return res.status(500).json({ message: "Failed to log out" })
    }

    res.status(200).json({ message: "Logged out successfully" })
  } catch (error) {
    res.status(500).json({ message: "An error occurred during logout" })
  }
}