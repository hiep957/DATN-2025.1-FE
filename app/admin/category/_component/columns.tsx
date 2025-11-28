"use client"
import { ColumnDef } from "@tanstack/react-table";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Category } from "../../product/type";
import { Edit, Trash2 } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { EditCategoryDialog } from "./edit-category";


/**
 * Thay vì export const columns, export 1 hàm trả về columns
 * và nhận onOpenDetail làm param để cell có thể gọi được.
 * */


export const getColumns = (onSuccess: () => void, allCategories: Category[]): ColumnDef<Category>[] => [

    {
        accessorKey: "id",
        header: "ID",
        cell: ({ row }) => <span>{row.original.id}</span>,
    },
    {
        accessorKey: "name",
        header: "Tên danh mục",
        cell: ({ row }) => {
            const category = row.original;
            const categoryName = category.name || "Danh mục không tồn tại";
            const categoryAvatar = category.thumbnail || "";
            const itemCount = 1;
            return (
                <div className="flex items-center gap-3">
                    <Avatar>
                        <AvatarImage src={categoryAvatar} alt={categoryName} />
                        <AvatarFallback>{categoryName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="truncate  max-w-[300px] font-medium" title={categoryName}>{categoryName}</span>

                </div>
            )
        }
    },
    {
        accessorKey: "slug",
        header: "Slug",
        cell: ({ row }) => <span>{row.original.slug}</span>,
    },
    {
        accessorKey: "parentId",
        header: "Danh mục cha",
        cell: ({ row }) => (
            <span>{row.original.parentId || "N/A"}</span>
        )
    },
    {
        accessorKey: "level",
        header: "Cấp độ",
        cell: ({ row }) => {
            const parentId = row.original.parentId;
            const level = parentId ? 2 : 1; // có parentId => cấp 2, ngược lại cấp 1

            return <span> {level}</span>;
        },
    },
    {
        id: "actions",
        header: "Hành động",
        cell: ({ row }) => {
            const id = row.original.id;

            return (
                <TooltipProvider>
                    <div className="flex items-center gap-2">

                        {/* Sửa */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <EditCategoryDialog
                                    category={row.original}
                                    onSuccess={onSuccess}
                                    categories={allCategories} // Truyền vào đây
                                />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Sửa</p>
                            </TooltipContent>
                        </Tooltip>

                        {/* Xóa */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Trash2></Trash2>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Xóa</p>
                            </TooltipContent>
                        </Tooltip>

                    </div>
                </TooltipProvider>
            );
        }
    },

];
