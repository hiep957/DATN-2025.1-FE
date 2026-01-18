"use client";
import React from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { orderStatuses, paymentMethods, paymentStatuses, sortOptions } from "../type";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function useUrlState() {
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
            if (patch["page"] === undefined) {
                sp.set("page", "1");
            }

            router.push(`${pathname}?${sp.toString()}`);
        },
        [router, pathname, searchParams]
    );
    return { searchParams, set };
}


export default function Toolbar({total}: {total?: number}) {
    const { searchParams, set } = useUrlState();
    const [q, setQ] = React.useState(searchParams.get("q") ?? "");


    //reset search params
    const resetFilters = () => {
        set({
            q: undefined,
            order_status: undefined,
            payment_status: undefined,
            payment_method: undefined,
            sortBy: undefined,
            sortOrder: undefined,
            page: "1"
        });
        setQ("");
    };
    const paymentMethod = searchParams.get("payment_method") ?? "all";
    const orderStatus = searchParams.get("order_status") ?? "all";
    const paymentStatus = searchParams.get("payment_status") ?? "all";
    const sortBy = searchParams.get("sortBy") ?? "default";
    const sortOrder = searchParams.get("sortOrder") ?? "default";

    // const []
    return (
        <div>
            <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 space-x-2">
                    <div className="col-span-2 flex items-center gap-2">
                        <Input placeholder="Tìm kiếm" value={q} onChange={(e) => setQ(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && set({ q })} />
                        <Button onClick={() => set({ q })}>Tìm</Button>
                    </div>
                    <div className="col-span-1 flex justify-end">
                        
                        <Select value={paymentMethod} onValueChange={(v) => set({ payment_method: v === "all" ? undefined : v })}>
                            <SelectTrigger><SelectValue placeholder="Phương thức thanh toán" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all" >Phương thức thanh toán</SelectItem>
                                {paymentMethods.map((c) => (
                                    <SelectItem key={c.value} value={c.value}>
                                        <div className="flex items-center gap-2">
                                            {/* Dấu chấm có lỗ */}
                                            <span
                                                className="inline-block w-3 h-3 rounded-full"
                                                style={{ backgroundColor: c.color }}
                                            />
                                            <span>{c.label}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="col-span-1 flex justify-end">
                        <Label className="sr-only">Trạng thái đơn hàng</Label>
                        <Select value={orderStatus} onValueChange={(v) => set({ order_status: v === "all" ? undefined : v })}>
                            <SelectTrigger><SelectValue placeholder="Trạng thái đơn hàng" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all" >Trạng thái đơn hàng</SelectItem>
                                {orderStatuses.map((c) => (
                                    <SelectItem key={c.value} value={c.value}>
                                        <div className="flex items-center gap-2">
                                            {/* Dấu chấm có lỗ */}
                                            <span
                                                className="inline-block w-3 h-3 rounded-full"
                                                style={{ backgroundColor: c.color }}
                                            />
                                            <span>{c.label}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="col-span-1 flex justify-end">
                        <Label className="sr-only">Trạng thái thanh toán</Label>
                        <Select value={paymentStatus} onValueChange={(v) => set({ payment_status: v === "all" ? undefined : v })}>
                            <SelectTrigger><SelectValue placeholder="Trạng thái thanh toán" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all" >Trạng thái thanh toán</SelectItem>
                                {paymentStatuses.map((c) => (
                                    <SelectItem key={c.value} value={c.value}>
                                        <div className="flex items-center gap-2">
                                            {/* Dấu chấm có lỗ */}
                                            <span
                                                className="inline-block w-3 h-3 rounded-full"
                                                style={{ backgroundColor: c.color }}
                                            />
                                            <span>{c.label}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                </div>

                <div className="grid grid-cols-5 gap-4">
                    <div className="col-span-1 text-sm flex items-center">Tìm thấy {total} đơn hàng</div>
                    <div>
                        <Button onClick={resetFilters}>Đặt lại</Button>
                    </div>

                    <div className="col-start-5 flex gap-2 flex-row md:flex justify-end">

                        <div>
                            <Label className="sr-only">Sắp xếp theo</Label>
                            <Select value={sortBy} onValueChange={(v) => set({ sortBy: v === "default" ? undefined : v })}>
                                <SelectTrigger><SelectValue placeholder="Sắp xếp theo" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="default" >Sắp xếp theo</SelectItem>
                                    {sortOptions.map((c) => (
                                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label className="sr-only">Thứ tự sắp xếp</Label>
                            <Select value={sortOrder} onValueChange={(v) => set({ sortOrder: v === "default" ? undefined : v })}>
                                <SelectTrigger><SelectValue placeholder="Thứ tự sắp xếp" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="default" >Thứ tự sắp xếp</SelectItem>
                                    <SelectItem value="ASC">Tăng dần</SelectItem>
                                    <SelectItem value="DESC">Giảm dần</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                </div>

            </div>


        </div>
    )
}