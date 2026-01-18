import { NextResponse } from "next/server";
import { BASE_URL } from "@/lib/axios";
const REFRESH_COOKIE_NAME = "refreshToken";

// Cookie options phải KHỚP với lúc bạn set cookie khi login
const COOKIE_OPTIONS = {
  httpOnly: true as const,
  secure: true as const,
  sameSite: "none" as const,
  path: "/" as const,
  // domain: "your-domain.com" // nếu lúc set bạn có domain thì lúc xoá cũng phải có
};

export async function POST(req: Request) {
  try {
    const cookieHeader = req.headers.get("cookie") ?? "";

    // 1) Gọi NestJS logout để invalidate refresh token trong DB/session
    // (Nếu Nest logout cần accessToken guard, thì Next nên forward Authorization từ client.
    // Nhưng bạn đang theo flow refresh cookie, logout thường nên dựa refresh token hoặc userId session.)
    await fetch(`${BASE_URL}/user/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: cookieHeader,
        // Nếu bạn muốn forward access token (trong trường hợp Nest logout bắt buộc Bearer):
        // authorization: req.headers.get("authorization") ?? "",
      },
      credentials: "include",
      cache: "no-store",
    }).catch(() => {
      // Dù Nest lỗi, vẫn nên xoá cookie ở FE để user thoát phiên trên trình duyệt
    });

    // 2) Xoá cookie refreshToken tại Next.js domain
    const res = NextResponse.json({ ok: true, statusCode: 200 }, { status: 200 });

    // Cách xoá chắc chắn: set maxAge=0 (hoặc expires về quá khứ)
    res.cookies.set({
      name: REFRESH_COOKIE_NAME,
      value: "",
      ...COOKIE_OPTIONS,
      maxAge: 0,
    });

    return res;
  } catch {
    // Dù lỗi vẫn cố xoá cookie
    const res = NextResponse.json(
      { ok: false, statusCode: 500, message: "Logout error" },
      { status: 500 }
    );

    res.cookies.set({
      name: REFRESH_COOKIE_NAME,
      value: "",
      ...COOKIE_OPTIONS,
      maxAge: 0,
    });

    return res;
  }
}
