
import { queryProducts } from "@/lib/types/test-product"
import { NextResponse } from "next/server"


export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q") || ""
  const category = searchParams.get("category") || ""
  const inStock = searchParams.get("inStock") === "true"
  const sort = (searchParams.get("sort") || "") as "sold" | "stock" | "price" | ""
  const page = parseInt(searchParams.get("page") || "1", 10)
  const limit = parseInt(searchParams.get("limit") || "10", 10)

  const result = queryProducts({ q, category, inStock, sort, page, limit })
  return NextResponse.json(result)
}
