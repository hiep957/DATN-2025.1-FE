"use client";


import * as React from "react";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getExpandedRowModel,
    useReactTable,
    Row,
} from "@tanstack/react-table";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Brand, Category, Product, Variant } from "./type";
import { useEffect } from "react";
import { ca } from "date-fns/locale";
import { fetchCategories } from "@/lib/api/category";


interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    pageCount: number;
}


const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

const renderSubComponent = ({ row }: { row: Row<Product> }) => {
    const p = row.original;
    return (
        <Card className="m-2 shadow-inner bg-muted/50">
            <CardContent className="p-2">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">Ảnh</TableHead>
                            <TableHead>Màu</TableHead>
                            <TableHead>Size</TableHead>
                            <TableHead>Giá</TableHead>
                            <TableHead>Tồn kho</TableHead>
                            <TableHead>Đã bán</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {p.variants.map((v: Variant) => {
                            const imageUrl = p.image_colors?.[v.color.id]?.url || p.images?.[0]?.url || "";
                            return (
                                <TableRow key={v.id}>
                                    <TableCell>
                                        <Avatar className="h-12 w-12 rounded-md">
                                            <AvatarImage src={imageUrl} alt={`${v.color.name} - ${v.size.name}`} className="object-contain" />
                                            <AvatarFallback>{v.color.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                    </TableCell>
                                    <TableCell>{v.color.name}</TableCell>
                                    <TableCell>{v.size.name}</TableCell>
                                    <TableCell>{formatCurrency(parseFloat(v.price))}</TableCell>
                                    <TableCell>{v.quantity}</TableCell>
                                    <TableCell>{v.sold}</TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};



function useUrlState() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const set = React.useCallback(
        (patch: Record<string, string | number | boolean | undefined>) => {
            const sp = new URLSearchParams(searchParams.toString());
            Object.entries(patch).forEach(([k, v]) => {
                if (v === undefined || v === "" || v === null) sp.delete(k);
                else sp.set(k, String(v));
            });
            // when changing filters, always reset to page 1
            console.log('patch', patch)
            // sp.delete("page");

            router.push(`${pathname}?${sp.toString()}`);
        },
        [router, pathname, searchParams]
    );
    return { searchParams, set };
}


function Toolbar({ categories }: { categories: Category[] | null }) {
    const { searchParams, set } = useUrlState();
    const [q, setQ] = React.useState(searchParams.get("q") ?? "");
    const [min, setMin] = React.useState(searchParams.get("price_min") ?? "");
    const [max, setMax] = React.useState(searchParams.get("price_max") ?? "");
    const categoryValue = searchParams.get("category") ?? "all";
    const resetFilters = () => {
        setQ("");
        setMin("");
        setMax("");
        set({
            q: undefined,
            category: undefined,
            price_min: undefined,
            price_max: undefined,
            is_published: undefined,
            sortOrder: undefined,
            limit: undefined,
            page: undefined,
        });
    };


    return (
        <div className="mb-4 grid grid-cols-2 gap-3">
            <div className="span-col-1 flex items-center gap-2">
                <Input placeholder="Tìm theo tên / SKU" value={q} onChange={(e) => setQ(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && set({ q })} />
                <Button onClick={() => set({ q })}>Tìm</Button>
            </div>

            <div className="span-col-1 flex justify-between gap-2">
                <div className="">
                    <Label className="sr-only">Danh mục</Label>
                    <Select
                        value={categoryValue}
                        onValueChange={(v) => set({ category: v === "all" ? undefined : v, page: undefined })}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Danh mục" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả danh mục</SelectItem>
                            {categories?.map((c) => (
                                <SelectItem key={c.id} value={c.slug}>
                                    {c.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>


                <div className="flex items-center gap-2">
                    <Label htmlFor="pub">Hiển thị</Label>
                    <Switch id="pub" checked={(searchParams.get("is_published") ?? "") === "true"}
                        onCheckedChange={(ck) => set({ is_published: ck ? true : undefined })} />
                </div>
            </div>


            <div className="md:col-span-1 flex">
                <Input className="mr-2" placeholder="Giá từ" inputMode="numeric" value={min} onChange={(e) => setMin(e.target.value)}
                    onBlur={() => set({ price_min: min || undefined })} />

                <Input placeholder="đến" inputMode="numeric" value={max} onChange={(e) => setMax(e.target.value)}
                    onBlur={() => set({ price_max: max || undefined })} />
                {/* <Input type="date" defaultValue={searchParams.get("created_from") ?? ""}
                    onBlur={(e) => set({ created_from: e.target.value || undefined })} />
                <Input type="date" defaultValue={searchParams.get("created_to") ?? ""}
                    onBlur={(e) => set({ created_to: e.target.value || undefined })} /> */}
            </div>
            <div className="md:col-span-1 flex justify-between gap-2">
                <Select defaultValue={searchParams.get("sortOrder") ?? "-created"} onValueChange={(v) => set({ sortOrder: v || undefined })}>
                    <SelectTrigger><SelectValue placeholder="Sắp xếp" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="DESC">Mới nhất</SelectItem>
                        <SelectItem value="ASC">Cũ nhất</SelectItem>
                    </SelectContent>
                </Select>
                <Select defaultValue={String(Number(useSearchParams().get("limit") ?? 10))}
                    onValueChange={(v) => set({ limit: v })}>
                    <SelectTrigger><SelectValue placeholder="/trang" /></SelectTrigger>
                    <SelectContent>
                        {[10, 20, 50].map(n => <SelectItem key={n} value={String(n)}>{n}/trang</SelectItem>)}
                    </SelectContent>
                </Select>

                <Button variant="outline" onClick={resetFilters}>Đặt lại</Button>
            </div>

        </div>
    );
}

export function ProductDataTable<TData extends Product, TValue>({ columns, data, pageCount }: DataTableProps<TData, TValue>) {
    const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel(), getExpandedRowModel: getExpandedRowModel(), getRowId: (row) => row.id.toString(), getRowCanExpand: () => true });
    const { searchParams, set } = useUrlState();
    const page = Number(searchParams.get("page") ?? 1);
    const [categories, setCategories] = React.useState<Category[] | null>(null)
    const loadData = async () => {
        console.log("load categories")
        try {
            const categories = await fetchCategories();
            setCategories(categories);
        } catch (error) {
            setCategories([]);
        }
    };
    useEffect(() => {
        loadData();
    }, []);
    return (
        <div className="overflow-x-auto">
            <Toolbar categories={categories} />
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((hg) => (
                            <TableRow key={hg.id}>
                                {hg.headers.map((h) => (
                                    <TableHead key={h.id}>{h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}</TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <React.Fragment key={row.id}>
                                    <TableRow data-state={row.getIsSelected() && "selected"}>
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                        ))}
                                    </TableRow>
                                    {row.getIsExpanded() && (
                                        <TableRow>
                                            <TableCell colSpan={columns.length}>{renderSubComponent({ row: row as Row<Product> })}</TableCell>
                                        </TableRow>
                                    )}
                                </React.Fragment>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">Không có sản phẩm nào.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">Trang {page} / {pageCount}</div>
                <div className="flex gap-2">
                    <Button variant="outline" disabled={page <= 1} onClick={() => set({ page: Math.max(page - 1, 1) })}>Trước</Button>
                    <Button variant="default" disabled={page >= pageCount} onClick={() => set({ page: page + 1 })}>Sau</Button>
                </div>
            </div>
        </div>
    );
}
