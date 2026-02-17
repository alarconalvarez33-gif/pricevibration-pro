import { NextRequest, NextResponse } from 'next/server'

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const revalidate = 300 // Revalidate every 5 minutes

export async function GET(request: NextRequest) {
  try {
    // Get category from query params
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || 'general'

    // Validate category
    const validCategories = ['general', 'forex', 'crypto']
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: 'Invalid category' },
        { status: 400 }
      )
    }

    // Check if API key is configured
    if (!FINNHUB_API_KEY) {
      console.error('FINNHUB_API_KEY is not configured')
      return NextResponse.json(
        { error: 'News service not configured' },
        { status: 500 }
      )
    }

    // Fetch news from Finnhub
    const finnhubUrl = `https://finnhub.io/api/v1/news?category=${category}&token=${FINNHUB_API_KEY}`

    const response = await fetch(finnhubUrl, {
      headers: {
        'Accept': 'application/json',
      },
      next: {
        revalidate: 300 // Cache for 5 minutes
      }
    })

    if (!response.ok) {
      throw new Error(`Finnhub API error: ${response.status}`)
    }

    const data = await response.json()

    // Return the news data
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
    })
  } catch (error) {
    console.error('Error fetching news:', error)
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    )
  }
}
