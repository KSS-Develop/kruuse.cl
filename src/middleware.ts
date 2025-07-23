import { NextRequest, NextResponse } from "next/server"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://qvgpmylkuermltgfzhme.supabase.co"
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2Z3BteWxrdWVybWx0Z2Z6aG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyODU1MzEsImV4cCI6MjA2ODg2MTUzMX0.o1pQ34DGbZYsF1ukGJqoiVeHTH0qzi8RVMQ1OWoxGDQ"
const DEFAULT_REGION = process.env.NEXT_PUBLIC_DEFAULT_REGION || "cl"

const regionMapCache = {
  regionMap: new Map<string, any>(),
  regionMapUpdated: Date.now(),
}

async function getRegionMap() {
  const { regionMap, regionMapUpdated } = regionMapCache

  if (
    !regionMap.keys().next().value ||
    regionMapUpdated < Date.now() - 3600 * 1000
  ) {
    // Fetch regions from Supabase
    const response = await fetch(`${SUPABASE_URL}/rest/v1/regions?select=*,countries(*)`, {
      headers: {
        "apikey": SUPABASE_ANON_KEY,
        "Content-Type": "application/json"
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch regions")
    }

    const regions = await response.json()

    if (!regions?.length) {
      throw new Error("No regions found")
    }

    // Create a map of country codes to regions
    regions.forEach((region: any) => {
      region.countries?.forEach((c: any) => {
        regionMapCache.regionMap.set(c.iso_2.toLowerCase(), region)
      })
    })

    regionMapCache.regionMapUpdated = Date.now()
  }

  return regionMapCache.regionMap
}

/**
 * Fetches regions from Medusa and sets the region cookie.
 * @param request
 * @param response
 */
async function getCountryCode(
  request: NextRequest,
  regionMap: Map<string, HttpTypes.StoreRegion | number>
) {
  try {
    let countryCode

    const vercelCountryCode = request.headers
      .get("x-vercel-ip-country")
      ?.toLowerCase()

    const urlCountryCode = request.nextUrl.pathname.split("/")[1]?.toLowerCase()

    if (urlCountryCode && regionMap.has(urlCountryCode)) {
      countryCode = urlCountryCode
    } else if (vercelCountryCode && regionMap.has(vercelCountryCode)) {
      countryCode = vercelCountryCode
    } else if (regionMap.has(DEFAULT_REGION)) {
      countryCode = DEFAULT_REGION
    } else if (regionMap.keys().next().value) {
      countryCode = regionMap.keys().next().value
    }

    return countryCode
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error(
        "Middleware.ts: Error getting the country code. Did you set up regions in your Medusa Admin and define a MEDUSA_BACKEND_URL environment variable? Note that the variable is no longer named NEXT_PUBLIC_MEDUSA_BACKEND_URL."
      )
    }
  }
}

/**
 * Middleware to handle region selection
 */
export async function middleware(request: NextRequest) {
  try {
    // Skip middleware for API routes and static files
    if (
      request.nextUrl.pathname.startsWith('/api/') ||
      request.nextUrl.pathname.includes('.') ||
      request.nextUrl.pathname.startsWith('/_next/')
    ) {
      return NextResponse.next()
    }

    const regionMap = await getRegionMap()
    const urlCountryCode = request.nextUrl.pathname.split("/")[1]?.toLowerCase()

    // If URL already has a valid country code, continue
    if (urlCountryCode && regionMap.has(urlCountryCode)) {
      return NextResponse.next()
    }

    // Get country code from various sources
    let countryCode = DEFAULT_REGION
    
    const vercelCountryCode = request.headers
      .get("x-vercel-ip-country")
      ?.toLowerCase()

    if (vercelCountryCode && regionMap.has(vercelCountryCode)) {
      countryCode = vercelCountryCode
    } else if (!regionMap.has(countryCode) && regionMap.keys().next().value) {
      // Use first available region if default not found
      countryCode = regionMap.keys().next().value
    }

    // Skip redirect for test pages
    if (request.nextUrl.pathname.startsWith('/test')) {
      return NextResponse.next()
    }

    // Redirect to country-specific URL
    const redirectPath = request.nextUrl.pathname === "/" ? "" : request.nextUrl.pathname
    const queryString = request.nextUrl.search || ""
    const redirectUrl = `${request.nextUrl.origin}/${countryCode}${redirectPath}${queryString}`
    
    return NextResponse.redirect(redirectUrl, 307)
  } catch (error) {
    console.error("Middleware error:", error)
    // On error, just continue without redirect
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images|assets|png|svg|jpg|jpeg|gif|webp).*)",
  ],
}
