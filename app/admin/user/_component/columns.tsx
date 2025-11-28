"use client"
import { ColumnDef } from "@tanstack/react-table";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { User } from "../type";


/**
 * Thay vì export const columns, export 1 hàm trả về columns
 * và nhận onOpenDetail làm param để cell có thể gọi được.
 * */

const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });
};
export const columns: ColumnDef<User>[] = [
    {
        id: "index",
        header: "STT",
        cell: ({ row }) => row.index + 1,
        size: 50,
    },
    {
        accessorKey: "username",
        header: "Người dùng",
        cell: ({ row }) => {
            const user = row.original;
            const userName = user.username || "Người dùng không tồn tại";
            const userAvatar = user.avatar || "";
            const itemCount = 1;
            return (
                <div className="flex items-center gap-3">
                    <Avatar>
                        <AvatarImage src={userAvatar} alt={userName} />
                        <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="truncate  max-w-[300px] font-medium" title={userName}>{userName}</span>

                </div>
            )
        }
    },
    {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => <span>{row.original.email}</span>,
    },
    {
        accessorKey: "role",
        header: "Vai trò",
        cell: ({ row }) => (
            <span>{row.original.userRoles?.map(ur => ur.role.code).join(", ") || "N/A"}</span>
        )
    },
    {
        accessorKey: "phoneNumber",
        header: "Số điện thoại",
        cell: ({ row }) => <span>{row.original.phoneNumber || "N/A"}</span>,
    },
    {
        accessorKey: "createdAt",
        header: "Thời gian tạo",
        cell: ({ row }) => <span>{formatDateTime(row.original.createdAt || "")}</span>,
    },
    {
        accessorKey: "updatedAt",
        header: "Thời gian chỉnh sửa",
        cell: ({ row }) => <span>{formatDateTime(row.original.updatedAt || "")}</span>,
    }

];
