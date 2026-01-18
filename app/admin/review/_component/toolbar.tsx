"use client";
import React from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ratingFilters, reviewStatuses, sortOptions } from "./type";

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


export default function Toolbar({ total }: { total?: number }) {
    const { searchParams, set } = useUrlState();
    const [q, setQ] = React.useState(searchParams.get("q") ?? "");


    //reset search params
    const resetFilters = () => {
        set({
            q: undefined,
            status: undefined,
            rating: undefined,
            sortBy: undefined,
            sortOrder: undefined,
            page: "1"
        });
        setQ("");
    };
    
    const status = searchParams.get("status") ?? "all";
    const rating = searchParams.get("rating") ?? "all";
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
                        <Label className="sr-only">Trạng thái đánh giá</Label>
                        <Select value={status} onValueChange={(v) => set({ status: v === "all" ? undefined : v })}>
                            <SelectTrigger><SelectValue placeholder="Trạng thái đánh giá" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all" >Trạng thái đánh giá</SelectItem>
                                {reviewStatuses.map((c) => (
                                    <SelectItem key={c.value} value={c.value}>
                                        <div className="flex items-center gap-2">
                                            {/* Dấu chấm có lỗ */}
                                            <span
                                                className="inline-block w-3 h-3 rounded-full"
                                                style={{ backgroundColor: c.color }}
                                            />
                                            <span>{c.label_vi}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="col-span-1 flex justify-end">
                        <Label className="sr-only"></Label>
                        <Select value={rating} onValueChange={(v) => set({ rating: v === "all" ? undefined : v })}>
                            <SelectTrigger><SelectValue placeholder="Đánh giá theo số sao" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all" >Đánh giá theo số sao</SelectItem>
                                {ratingFilters.map((c) => (
                                    <SelectItem key={c.value} value={String(c.value)}>
                                        <div className="flex items-center gap-2">
                                            {/* Dấu chấm có lỗ */}
                                            <span
                                                className="inline-block w-3 h-3 rounded-full"
                                                style={{ backgroundColor: c.color }}
                                            />
                                            <span>{c.label_vi}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                </div>

                <div className="grid grid-cols-5 gap-4">
                    <div className="col-span-1 text-sm flex items-center">Tìm thấy {total} đánh giá</div>
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