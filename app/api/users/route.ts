// app/api/users/route.ts

//UI rất đẹp https://chatgpt.com/c/68ebf540-c030-8324-ba0c-a3aac8a3e9b2
import { NextResponse } from "next/server";

export type Role = "admin" | "editor" | "viewer";
export type User = {
  id: number;
  name: string;
  email: string;
  role: Role;
  active: boolean;
};

// Dữ liệu giả trong bộ nhớ (reset khi server restart)
const users: User[] = [
  { id: 1, name: "Alice Nguyen", email: "alice@example.com", role: "admin", active: true },
  { id: 2, name: "Binh Tran", email: "binh@example.com", role: "editor", active: true },
  { id: 3, name: "Cuong Le", email: "cuong@example.com", role: "viewer", active: false },
  { id: 4, name: "Diep Pham", email: "diep@example.com", role: "editor", active: true },
  { id: 5, name: "Hanh Vo", email: "hanh@example.com", role: "viewer", active: true },
];

// Helper parse bool
function parseBool(v: string | null): boolean | null {
  if (v === null) return null;
  if (["1", "true", "yes"].includes(v.toLowerCase())) return true;
  if (["0", "false", "no"].includes(v.toLowerCase())) return false;
  return null; // không hợp lệ => bỏ qua
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  // Search & filter
  const q = searchParams.get("q");
  const rolesParam = searchParams.get("role"); // ví dụ: "admin,viewer"
  const activeParam = searchParams.get("active"); // true|false|all

  // Sort & paginate (tùy chọn)
  const sortBy = (searchParams.get("sortBy") || "id") as keyof User; // id|name|email|role|active
  const sortDir = (searchParams.get("sortDir") || "asc").toLowerCase() === "desc" ? "desc" : "asc";
  const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
  const pageSize = Math.min(Math.max(parseInt(searchParams.get("pageSize") || "10", 10), 1), 100);

  let out = [...users];

  // q: tìm trong name + email (không phân biệt hoa thường)
  if (q && q.trim()) {
    const needle = q.trim().toLowerCase();
    out = out.filter((u) =>
      u.name.toLowerCase().includes(needle) || u.email.toLowerCase().includes(needle)
    );
  }

  // role: có thể truyền nhiều role cách nhau bằng dấu phẩy
  if (rolesParam && rolesParam.trim()) {
    const roleSet = new Set(
      rolesParam
        .split(",")
        .map((r) => r.trim().toLowerCase())
        .filter(Boolean)
    );
    out = out.filter((u) => roleSet.has(u.role));
  }

  // active: true | false | all (mặc định = all nếu không truyền)
  const active = parseBool(activeParam);
  if (active !== null) {
    out = out.filter((u) => u.active === active);
  }

  // sort
  out.sort((a, b) => {
    const va = a[sortBy];
    const vb = b[sortBy];
    if (va === vb) return 0;
    if (typeof va === "string" && typeof vb === "string") {
      return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
    }
    return sortDir === "asc" ? ((va as any) > (vb as any) ? 1 : -1) : ((va as any) < (vb as any) ? 1 : -1);
  });

  // pagination
  const total = out.length;
  const start = (page - 1) * pageSize;
  const data = out.slice(start, start + pageSize);

  return NextResponse.json({
    data,
    meta: {
      total,
      page,
      pageSize,
      pageCount: Math.max(Math.ceil(total / pageSize), 1),
      sortBy,
      sortDir,
    },
  });
}