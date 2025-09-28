import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/partners') && !pathname.startsWith('/partners/login') && !pathname.startsWith('/partners/register')) {
    
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    })
    
    if (token && token.userType !== 'partner') {
      return NextResponse.redirect(new URL('/partners/register', request.url))
    }
    
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/partners/:path*'
  ]
}