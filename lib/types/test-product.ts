export type Variant = {
  id: string
  color: string
  size: string
  price: number
  stock: number
  sold: number
  image: string
}

export type Product = {
  id: string
  name: string
  category: string
  basePrice: number
  image: string
  variants: Variant[]
}

export type ProductWithAgg = Product & {
  totalStock: number
  totalSold: number
}


export const PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "Áo thun Oversize",
    category: "Áo",
    basePrice: 199000,
    image: "/images/tee.jpg",
    variants: [
      { id: "v1", color: "Đen", size: "S", price: 199000, stock: 20, sold: 55, image: "/images/tee-black-s.jpg" },
      { id: "v2", color: "Đen", size: "M", price: 199000, stock: 12, sold: 78, image: "/images/tee-black-m.jpg" },
      { id: "v3", color: "Trắng", size: "M", price: 199000, stock: 8, sold: 61, image: "/images/tee-white-m.jpg" },
    ],
  },
  {
    id: "p2",
    name: "Quần jean Slim",
    category: "Quần",
    basePrice: 499000,
    image: "/images/jean.jpg",
    variants: [
      { id: "v4", color: "Xanh đậm", size: "30", price: 499000, stock: 3, sold: 120, image: "/images/jean-dark-30.jpg" },
      { id: "v5", color: "Xanh nhạt", size: "32", price: 499000, stock: 15, sold: 95, image: "/images/jean-light-32.jpg" },
    ],
  },
  {
    id: "p3",
    name: "Giày Sneaker Flex",
    category: "Giày",
    basePrice: 899000,
    image: "/images/shoes.jpg",
    variants: [
      { id: "v6", color: "Trắng", size: "41", price: 899000, stock: 10, sold: 210, image: "/images/shoe-white-41.jpg" },
      { id: "v7", color: "Đen", size: "42", price: 899000, stock: 0, sold: 175, image: "/images/shoe-black-42.jpg" },
    ],
  },
]

export function aggregate(p: Product) {
  const totalStock = p.variants.reduce((s, v) => s + v.stock, 0)
  const totalSold = p.variants.reduce((s, v) => s + v.sold, 0)
  return { totalStock, totalSold }
}

export type QueryParams = {
  q?: string
  category?: string
  inStock?: boolean
  sort?: "sold" | "stock" | "price" | ""
  page?: number
  limit?: number
}

export function queryProducts(params: QueryParams) {
  const {
    q = "",
    category = "",
    inStock = false,
    sort = "",
    page = 1,
    limit = 10,
  } = params

  let list: ProductWithAgg[] = PRODUCTS.map((p) => ({ ...p, ...aggregate(p) }))

  const qLower = q.toLowerCase()
  if (qLower) {
    list = list.filter(
      (p) => p.name.toLowerCase().includes(qLower) || p.category.toLowerCase().includes(qLower)
    )
  }
  if (category) {
    list = list.filter((p) => p.category === category)
  }
  if (inStock) {
    list = list.filter((p) => p.totalStock > 0)
  }

  if (sort === "sold") list.sort((a, b) => b.totalSold - a.totalSold)
  if (sort === "stock") list.sort((a, b) => b.totalStock - a.totalStock)
  if (sort === "price") list.sort((a, b) => b.basePrice - a.basePrice)

  const total = list.length
  const start = (page - 1) * limit
  const end = start + limit
  const items = list.slice(start, end)

  return { items, page, limit, total }
}
