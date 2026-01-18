import { NextResponse } from "next/server";
import { BASE_URL } from "@/lib/axios";
export async function POST(req: Request) {
  try {
    // Forward cookie từ client lên Next -> Nest (để Nest đọc refreshToken nếu Nest dùng cookie)
    const cookieHeader = req.headers.get("cookie") ?? "";

    // Gọi NestJS refresh
    const nestRes = await fetch(`${BASE_URL}/user/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: cookieHeader,
      },
      // credentials ở fetch server-side không luôn cần, nhưng để rõ ràng
      credentials: "include",
      cache: "no-store",
    });

    if (!nestRes.ok) {
      // Refresh fail (expired/invalid) -> trả 401
      return NextResponse.json(
        { message: "Refresh failed" },
        { status: 401 }
      );
    }

    const nestJson = await nestRes.json();

    // Tuỳ format BE của bạn: bạn đang dùng (data as any)?.data.accessToken
    const accessToken: string | undefined =
      nestJson?.data?.accessToken ?? nestJson?.accessToken;

    if (!accessToken) {
      return NextResponse.json(
        { message: "No accessToken returned from refresh" },
        { status: 500 }
      );
    }

    // Nếu NestJS có rotate refreshToken và trả Set-Cookie:
    // -> bạn có thể forward "set-cookie" của Nest sang client.
    // Nhưng vì bạn set cookie ở Next domain, thường bạn sẽ tự set ở Next.
    // (Nếu bạn muốn rotate refreshToken tại Next, nói mình để mình viết thêm.)

    return NextResponse.json({ accessToken }, { status: 200 });
  } catch {
    return NextResponse.json(
      { message: "Refresh error" },
      { status: 500 }
    );
  }
}
