"use client"
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Order } from "../type";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMemo, useState } from "react";
import { getColumns } from "./columns";
import OrderDetail from "./order-detail";
import { Button } from "@/components/ui/button";
import { useUrlState } from "./toolbar";

interface DataTableProps<TData, TValue> {
    data: TData[];
    limit: number;
    total: number;
    page: number;
    totalPages: number;
}

export default function DataTable<TData extends Order, TValue>({ data, limit, total, page, totalPages }: DataTableProps<TData, TValue>) {

    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
    const [open, setOpen] = useState(false);
    const { searchParams, set } = useUrlState();
    const [loading, setLoading] = useState(false);
    const onOpenDetail = (order: Order) => {
        setSelectedOrder(order);
        setOpen(true);
    }
    const columns = useMemo(() => getColumns(onOpenDetail), [onOpenDetail]);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })
    


    return (
        <div className="rounded-md border mt-2">
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
                            <TableRow data-state={row.getIsSelected() && "selected"} key={row.id}>
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={columns.length} className="h-24 text-center">Không có sản phẩm nào.</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
            <div className="flex items-center justify-between mt-4 p-2">
                <div className="text-sm text-muted-foreground">Trang {page} / {totalPages}</div>
                <div className="flex gap-2">
                    <Button variant="outline" disabled={page <= 1} onClick={() => set({ page: Math.max(page - 1, 1) })}>Trước</Button>
                    <Button variant="default" disabled={page >= totalPages} onClick={() => set({ page: page + 1 })}>Sau</Button>
                </div>
            </div>
            <OrderDetail
                open={open}
                onOpenChange={(v) => {
                    setOpen(v);
                    if (!v) setSelectedOrder(null);
                }}
                order={selectedOrder ?? undefined}
            />
        </div>
    )
}