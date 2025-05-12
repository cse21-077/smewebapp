import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Check auth condition
  if (req.nextUrl.pathname.startsWith("/dashboard")) {
    // If user is not signed in and the current path is not / redirect the user to /
    if (!session) {
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = "/"
      redirectUrl.searchParams.set(`redirectedFrom`, req.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }
  }

  // If user is signed in and the current path is / redirect the user to /dashboard
  if (session && (req.nextUrl.pathname === "/" || req.nextUrl.pathname === "/signup")) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = "/dashboard"
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: ["/", "/dashboard/:path*", "/signup"],
}
