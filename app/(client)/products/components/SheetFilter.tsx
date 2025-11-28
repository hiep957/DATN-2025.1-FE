"use client";

import { useCallback, useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Color, Size } from "@/app/admin/product/type";
import { init } from "next/dist/compiled/webpack/webpack";


/** ===== Helpers ===== */
function useIsMobile() {
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const mq = window.matchMedia("(max-width: 768px)");
        const handler = () => setIsMobile(mq.matches);
        handler();
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
    }, []);
    return isMobile;
}

function getList(sp: URLSearchParams, key: string) {
    return (sp.get(key) ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
}

function buildQs(obj: Record<string, any>) {
    const usp = new URLSearchParams();
    Object.entries(obj).forEach(([k, v]) => {
        if (v == null) return;
        if (Array.isArray(v)) {
            if (!v.length) return;
            usp.set(k, v.join(",")); // ✅ encode dạng comma
        } else if (v !== "" && v !== undefined) {
            usp.set(k, String(v));
        }
    });
    return usp.toString();
}

/** ===== Giá (demo) => map ở BE qua min/max ===== */
const PRICE_RANGES: { id: string; label: string; min?: number; max?: number }[] = [
    { id: "p1", label: "Dưới 99.000đ", min: 0, max: 99000 },
    { id: "p2", label: "100.000đ - 199.000đ", min: 100000, max: 199000 },
    { id: "p3", label: "200.000đ - 299.000đ", min: 200000, max: 299000 },
    { id: "p4", label: "300.000đ - 499.000đ", min: 300000, max: 499000 },
    { id: "p5", label: "500.000đ - 1.000.000đ", min: 500000, max: 1000000 },
    { id: "p6", label: "Trên 1.000.000đ", min: 1000001 },
];

export default function FilterSheet({
    sizes,
    colors,
    triggerClassName,
}: {
    sizes: Size[];
    colors: Color[];
    triggerClassName?: string;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const sp = useSearchParams();
    const isMobile = useIsMobile();

    /** ===== State đọc từ URL khi mở sheet ===== */
    const initial = useMemo(() => {
        const selectedColors = getList(sp, "colors");
        const selectedSizes = getList(sp, "sizes");
        const selectedPrices = getList(sp, "prices"); // id các khoảng giá
        return {
            colors: new Set(selectedColors),
            sizes: new Set(selectedSizes),
            prices: new Set(selectedPrices),
        };
    }, [sp]);

    /** ===== Local state trong Sheet ===== */
    const [open, setOpen] = useState(false);
    const [selColors, setSelColors] = useState<Set<string>>(new Set());
    const [selSizes, setSelSizes] = useState<Set<string>>(new Set());
    const [selPrices, setSelPrices] = useState<string | null>(null);

    // Đồng bộ lại khi mở
    useEffect(() => {
        if (open) {
            setSelColors(new Set(initial.colors));
            setSelSizes(new Set(initial.sizes));
            setSelPrices(initial.prices.values().next().value ?? null);
        }
    }, [open, initial]);

    /** ===== Toggle helpers ===== */
    const toggleSet = (setter: Dispatch<SetStateAction<Set<string>>>, key: string) =>
        setter((prev: Set<string>) => {
            const next = new Set<string>(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });

    /** ===== Apply → cập nhật URL dạng comma, reset page=1 nếu đổi filter ===== */
    const onApply = useCallback(() => {
        const base = Object.fromEntries(sp.entries()) as Record<string, string>;

        // Xoá keys cũ, để set lại
        delete base["colors"];
        delete base["sizes"];
        delete base["prices"];

        // Nếu có thay đổi filter → reset page = 1
        const before = {
            colors: getList(sp, "colors"),
            sizes: getList(sp, "sizes"),
            prices: getList(sp, "prices"),
        };
        const after = {
            colors: Array.from(selColors),
            sizes: Array.from(selSizes),
            prices: selPrices ? [selPrices] : [],
        };
        const changed =
            before.colors.join(",") !== after.colors.join(",") ||
            before.sizes.join(",") !== after.sizes.join(",") ||
            before.prices.join(",") !== after.prices.join(",");

        const qs = buildQs({
            ...base,
            ...(changed ? { page: 1 } : { page: base.page ?? 1 }),
            limit: base.limit ?? 10,
            colors: after.colors,
            sizes: after.sizes,
            prices: after.prices,
        });

        const curr = sp.toString();
        if (curr !== qs) router.replace(`${pathname}?${qs}`, { scroll: false });
        setOpen(false);
    }, [router, pathname, sp, selColors, selSizes, selPrices]);

    const onClearLocal = useCallback(() => {
        setSelColors(new Set());
        setSelSizes(new Set());
        setSelPrices(null);
    }, []);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" className={cn("rounded-full mt-2", triggerClassName)}>
                    Bộ lọc
                </Button>
            </SheetTrigger>

            <SheetContent side={isMobile ? "bottom" : "right"} className={cn(isMobile ? "h-[85dvh]" : "w-[380px]")}>
                <SheetHeader>
                    <SheetTitle>Bộ lọc</SheetTitle>
                </SheetHeader>

                <div className="mt-4 flex flex-col gap-6 pb-28 overflow-y-auto overscroll-contain ">
                    {/* Màu sắc */}
                    <section className="px-4">
                        <div className="mb-2 flex items-center justify-between">
                            <h4 className="text-sm font-medium">Màu sắc</h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {colors.map((c) => (
                                <ColorChip
                                    key={String(c.id)}
                                    label={c.name}
                                    colorHex={c.code}
                                    selected={selColors.has(c.englishName ?? c.name)}
                                    onClick={() => toggleSet(setSelColors, c.englishName ?? c.name)}
                                />
                            ))}
                        </div>
                    </section>

                    <Separator />

                    {/* Giá */}
                    <section className="px-4">
                        <div className="mb-2 flex items-center justify-between">
                            <h4 className="text-sm font-medium">Giá</h4>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {PRICE_RANGES.map((p) => {
                                const checked = selPrices === p.id;
                                return (
                                    <label
                                        key={p.id}
                                        className={cn(
                                            "flex items-center gap-3 rounded-xl border p-3 cursor-pointer select-none",
                                            checked ? "border-primary bg-primary/5" : "hover:bg-muted"
                                        )}
                                        onClick={() => setSelPrices(p.id)}
                                    >
                                        <Checkbox checked={checked} onCheckedChange={() => setSelPrices(p.id)} />
                                        <span className="text-sm">{p.label}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </section>

                    <Separator />

                    {/* Size */}
                    <section className="px-4">
                        <div className="mb-2 flex items-center justify-between">
                            <h4 className="text-sm font-medium">Size</h4>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {sizes.map((s) => {
                                const key = String(s.code ?? s.name).toLowerCase();
                                return (
                                    <SizeChip
                                        key={key}
                                        label={s.name}
                                        selected={selSizes.has(key)}
                                        onClick={() => toggleSet(setSelSizes, key)}
                                    />
                                );
                            })}
                        </div>
                    </section>
                </div>

                {/* Footer cố định */}
                <div
                    className={cn(
                        "fixed inset-x-0 bottom-0 border-t bg-background",
                        isMobile ? "" : "left-auto w-[380px]"
                    )}
                >
                    <div className="flex items-center gap-3 p-3">
                        <Button variant="outline" className="flex-1" onClick={onClearLocal}>
                            Xóa lọc
                        </Button>
                        <Button className="flex-[2]" onClick={onApply}>
                            Áp dụng
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}

/** ===== UI subcomponents ===== */

function ColorChip({
    label,
    colorHex,
    selected,
    onClick,
}: {
    label: string;
    colorHex?: string;
    selected?: boolean;
    onClick?: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={selected}
            className={cn(
                "inline-flex items-center gap-2 rounded-full border px-3 h-9 text-sm",
                selected ? "border-primary bg-primary/5" : "hover:bg-muted"
            )}
        >
            <span
                className="inline-block h-4 w-4 rounded-full border"
                style={colorHex ? { backgroundColor: colorHex } : {}}
                aria-hidden
            />
            {label}
        </button>
    );
}

function SizeChip({
    label,
    selected,
    onClick,
}: {
    label: string;
    selected?: boolean;
    onClick?: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={selected}
            className={cn(
                "inline-flex items-center justify-center rounded-full border h-9 px-4 text-sm",
                selected ? "border-primary bg-primary/5" : "hover:bg-muted"
            )}
        >
            {label}
        </button>
    );
}
