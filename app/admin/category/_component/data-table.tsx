"use client"
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";
import { Category } from "../../product/type";
import { getColumns } from "./columns";

interface DataTableProps<TData, TValue> {
    // columns: ColumnDef<TData, TValue>[];
    categories: TData[];
    onSuccess: () => void;
}

export default function DataTable<TData extends Category, TValue>({ categories, onSuccess }: DataTableProps<TData, TValue>) {

    const columns = useMemo(() => getColumns(onSuccess, categories), [categories]);
    const table = useReactTable({
        data: categories,
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
                            <TableCell colSpan={columns.length} className="h-24 text-center">Không có người dùng nào!.</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
            {/* <div className="flex items-center justify-between mt-4 p-2">
                <div className="text-sm text-muted-foreground">Trang {page} / {totalPages}</div>
                <div className="flex gap-2">
                    <Button variant="outline" disabled={page <= 1} onClick={() => set({ page: Math.max(page - 1, 1) })}>Trước</Button>
                    <Button variant="default" disabled={page >= totalPages} onClick={() => set({ page: page + 1 })}>Sau</Button>
                </div>
            </div> */}

        </div>
    )
}