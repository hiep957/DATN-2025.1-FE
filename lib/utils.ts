import { ProductCardProps } from "@/app/(client)/products/components/ProductList";
import { Product } from "@/app/admin/product/type";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

function toNumber(n?: string | number | null): number {
    if (typeof n === "number") return n;
    if (!n) return 0;
    const x = Number(n);
    return Number.isFinite(x) ? x : 0;
}

const colorMap = [
    { id: 1, name: "Trắng", code: "#FFFFFF", englishName: "white" },
    { id: 2, name: "Đen", code: "#000000", englishName: "black" },
    { id: 3, name: "Đỏ", code: "#FF0000", englishName: "red" },
    { id: 4, name: "Xanh dương", code: "#0000FF", englishName: "blue" },
    { id: 5, name: "Xanh lá", code: "#008000", englishName: "green" },
    { id: 7, name: "Kem", code: "#FFFDD0", englishName: "cream" },
];


export function transformProductToCard(p: Product): ProductCardProps {
    // All image urls (for gallery/hover swap)
    const imageUrl = (p.images ?? [])
        .map((img) => img?.url)
        .filter(Boolean) as string[];

    // Map colorId -> representative image url
    const colorImageMap: Record<number, string> = {};

    // 1) Ưu tiên ảnh theo image_colors (key là string id)
    if (p.image_colors && typeof p.image_colors === "object") {
        Object.entries(p.image_colors).forEach(([colorIdStr, val]) => {
            const cid = Number(colorIdStr);
            if (Number.isFinite(cid) && val?.url) {
                colorImageMap[cid] = val.url;
            }
        });
    }

    // 2) Nếu màu chưa có ảnh riêng, fallback ảnh tổng
    const fallbackUrl = imageUrl[0] ?? "";

    // Gom màu từ variants (unique theo color.id)
    const seen = new Set<number>();
    const imageColor: { id: number; code: string; url: string }[] = [];
    for (const v of p.variants ?? []) {
        const c = v?.color;
        if (!c || typeof c.id !== "number") continue;
        if (seen.has(c.id)) continue;
        seen.add(c.id);

        const url = colorImageMap[c.id] ?? fallbackUrl;
        imageColor.push({
            id: c.id,
            code: c.code ?? // ưu tiên code từ variant
                (colorMap.find((m) => m.id === c.id)?.code ?? "#CCCCCC"),
            url,
        });
    }

    // Giá: lấy min price từ variants (nếu không có thì 0)
    const price =
        p.variants && p.variants.length
            ? Math.min(...p.variants.map((v) => toNumber(v.price)))
            : 0;

    return {
        id: p.id,
        slug: p.slug,
        name: p.name,
        brandName: p.brand?.name,
        price,
        imageColor,
        imageUrl,
    };
}


export function postToCheckoutUrl(checkoutUrl: string, fields: Record<string, any>) {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = checkoutUrl;

  Object.entries(fields).forEach(([key, value]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = key;
    input.value = String(value ?? "");
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
}



