"use client"

import * as React from "react"
import Link from "next/link"
import { CircleCheckIcon, CircleHelpIcon, CircleIcon } from "lucide-react"

import { useIsMobile } from "@/hooks/use-mobile"
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { Avatar, AvatarImage } from "./ui/avatar"
import { Category } from "@/app/admin/product/type"
import { useRouter } from "next/navigation"
import api from "@/lib/axios"

import useSWR from 'swr'


// 2. Định nghĩa một fetcher dùng chung với 'api' của bạn
const fetcher = (url: string) => api.get(url).then(res => {
    // Trả về chính xác data bạn cần (giống như trong setCategories)
    return res.data.data.data;
});


export function CategoryBar() {
    const isMobile = useIsMobile()
    const router = useRouter();
    // 3. Xóa bỏ useEffect, useState (categories), useState (loading)
    // Chỉ cần dùng useSWR
    const {
        data: categories, // đổi tên 'data' thành 'categories'
        error,
        isLoading // useSWR cung cấp 'isLoading'
    } = useSWR<Category[]>('/category', fetcher); // Dùng key là URL và hàm fetcher

    // 4. Xử lý loading và error
    if (error) return <div>Lỗi khi tải danh mục...</div>;
    if (isLoading) return <div>Loading...</div>; // Dùng isLoading từ SWR
    if (!categories) return null; // Đảm bảo categories không bị undefined

    // Từ đây trở xuống, code của bạn giữ nguyên
    const parentCategories = categories.filter(category => !category.parentId);

    return (
        <div className="hidden w-full md:flex items-center z-50 justify-center sticky">
            <NavigationMenu viewport={isMobile} className="" >
                <NavigationMenuList className="flex-wrap">
                    {
                        parentCategories.map(parent => {
                            const childCategories = categories.filter(
                                child => child.parentId === parent.id
                            );

                            if (childCategories.length > 0) {
                                return (
                                    <NavigationMenuItem className="hidden md:block relative" key={parent.id}>
                                        <NavigationMenuTrigger>{parent.name}</NavigationMenuTrigger>
                                        <NavigationMenuContent className="absolute left-1/2 -translate-x-1/2 md:w-auto">
                                            <ul className="grid gap-2 sm:w-[400px] md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                                                {childCategories.map(child => (
                                                    <NavigationMenuLink asChild key={child.id}  >
                                                        <Link href={`/products?category=${child.slug}`} className="flex flex-row items-center gap-3 rounded-md p-2 hover:bg-accent focus:bg-accent">
                                                            <Avatar className="h-8 w-8">
                                                                <AvatarImage src={child.thumbnail} alt="@shadcn" className="object-contain" />
                                                            </Avatar>
                                                            <div className="font-medium">{child.name}</div>

                                                        </Link>
                                                    </NavigationMenuLink>
                                                ))}
                                            </ul>
                                        </NavigationMenuContent>
                                    </NavigationMenuItem>
                                )
                            }
                            return (
                                <NavigationMenuItem key={parent.id}>
                                    <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                                        <Link href="/docs">{parent.name}</Link>
                                    </NavigationMenuLink>
                                </NavigationMenuItem>
                            )
                        })
                    }

                </NavigationMenuList>
            </NavigationMenu>
        </div>
    )
}

function ListItem({
    title,
    children,
    href,
    ...props
}: React.ComponentPropsWithoutRef<"li"> & { href: string }) {
    return (
        <li {...props}>
            <NavigationMenuLink asChild>
                <Link href={href}>
                    <div className="text-sm leading-none font-medium">{title}</div>
                    <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
                        {children}
                    </p>
                </Link>
            </NavigationMenuLink>
        </li>
    )
}
