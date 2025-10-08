// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';


export function middleware(request: NextRequest) {
    const refreshToken = request.cookies.get('refreshToken')?.value; // Tên cookie của bạn
    const { pathname } = request.nextUrl;

    // Danh sách các trang admin
    const adminRoutes = ['/admin', '/dashboard'];

    // Danh sách các trang yêu cầu đăng nhập (ngoại trừ admin)
    const protectedUserRoutes = ['/profile', '/orders'];

    // Nếu không có refreshToken (chưa đăng nhập) và đang cố truy cập trang cần bảo vệ
    if (!refreshToken && (adminRoutes.some(path => pathname.startsWith(path)) || protectedUserRoutes.some(path => pathname.startsWith(path)))) {
        // Redirect về trang đăng nhập
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Middleware không thể biết được role của user vì nó không đọc được payload của JWT.
    // Việc kiểm tra role sẽ được thực hiện ở client-side (Bước 4).
    // Middleware chỉ đảm bảo user đã "đăng nhập" (tồn tại refreshToken).

    return NextResponse.next();
}

// Config để middleware chỉ chạy trên các path cụ thể
export const config = {
    matcher: ['/admin/:path*', '/dashboard/:path*', '/profile', '/orders'],
};