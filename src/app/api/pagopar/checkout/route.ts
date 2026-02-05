import { NextResponse } from 'next/server'

// Deprecated: Use /api/pagopar/create-order instead
// This route is kept for backwards compatibility
export async function POST(request: Request) {
  const body = await request.text()
  const url = new URL(request.url)
  const createOrderUrl = `${url.origin}/api/pagopar/create-order`

  const response = await fetch(createOrderUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      cookie: request.headers.get('cookie') || '',
    },
    body,
  })

  const data = await response.json()
  return NextResponse.json(data, { status: response.status })
}
