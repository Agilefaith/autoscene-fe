import { NextRequest, NextResponse } from 'next/server';

// Auth protection is handled client-side via AuthContext + AuthGuard
// Proxy only handles non-auth concerns (e.g. future rewrites)
export function proxy(_req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
