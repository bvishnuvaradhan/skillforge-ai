import { NextResponse } from "next/server";

const AUTH_ROUTES = ["/dashboard", "/settings"];
const PUBLIC_AUTH_ROUTES = ["/login", "/signup"];

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("sf_token")?.value;

  if (AUTH_ROUTES.some((route) => pathname.startsWith(route)) && !token) {
    const redirectUrl = new URL("/login", request.url);
    return NextResponse.redirect(redirectUrl);
  }

  if (PUBLIC_AUTH_ROUTES.includes(pathname) && token) {
    const redirectUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/settings/:path*", "/login", "/signup"],
};