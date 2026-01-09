import { NextResponse } from "next/server";
import { BASE_URL } from "@/lib/axios";
export async function POST(req: Request) {
  const body = await req.json();

  const beRes = await fetch(`${BASE_URL}/user/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    // Không cần credentials ở server-side fetch
  });


  const data = await beRes.json();
  console.log("Dữ liệu phản hồi từ BE:", data);
  // Nếu BE trả lỗi
  if (data.statusCode != 201) {
    return NextResponse.json(data, { status: beRes.status });
  }

  const refreshToken = data.data.refreshToken;
  console.log("RefreshToken từ BE:", refreshToken);
  if (!refreshToken) {
    return NextResponse.json(
      { message: "BE không trả refreshToken" },
      { status: 500 }
    );
  }

  // Set cookie trên domain FE (Vercel)
  const res = NextResponse.json(
    { ...data.data, refreshToken: undefined }, // optional: không trả refreshToken xuống client
    { status: 200 }
  );
  console.log(res)

  res.cookies.set("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,      // Vercel là https
    sameSite: "lax",   // đi cùng domain thì ok
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 ngày (tuỳ bạn)
  });

  return res;
}
