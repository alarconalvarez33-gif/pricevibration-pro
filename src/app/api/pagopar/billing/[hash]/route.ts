import { NextResponse } from 'next/server'

export async function GET(
  _request: Request,
  { params }: { params: { hash: string } }
) {
  const hash = params.hash

  // Redirect user to billing confirmation page
  return NextResponse.redirect(
    new URL(`/billing/${hash}`, process.env.NEXTAUTH_URL || 'https://sacredlevels.com')
  )
}
