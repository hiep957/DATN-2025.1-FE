"use client"

import Link from "next/link"
import { IconCirclePlusFilled, IconMail, type Icon } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"

export function NavMain({
    items,
}: {
    items: { title: string; url: string; icon?: Icon }[]
}) {
    const pathname = usePathname()
    function isActive(itemUrl: string, pathname: string) {
        // Chuẩn hoá bỏ slash cuối (nếu có)
        const norm = (s: string) => s.replace(/\/+$/, "") || "/"
        const u = norm(itemUrl)
        const p = norm(pathname)

        // Nếu là trang gốc admin -> chỉ active khi đúng /admin
        if (u === "/admin") return p === "/admin"

        // Item khác -> active khi đúng path hoặc là parent của path hiện tại
        return p === u || p.startsWith(u + "/")
    }
    return (
        <SidebarGroup>
            <SidebarGroupContent className="flex flex-col gap-2">
                {/* Hàng action riêng, KHÔNG điều hướng */}
                <SidebarMenu>
                    <SidebarMenuItem className="flex items-center gap-2">
                        <SidebarMenuButton
                            tooltip="Quick Create"
                            className="bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/90 min-w-8 duration-200 ease-linear"
                            onClick={() => {/* mở modal/tạo nhanh */ }}
                        >
                            <IconCirclePlusFilled />
                            <span>Quick Create</span>
                        </SidebarMenuButton>

                        <Button
                            size="icon"
                            className="size-8 group-data-[collapsible=icon]:opacity-0"
                            variant="outline"
                            onClick={() => {/* mở inbox panel */ }}
                        >
                            <IconMail />
                            <span className="sr-only">Inbox</span>
                        </Button>
                    </SidebarMenuItem>
                </SidebarMenu>

                {/* Menu điều hướng: bọc Link với asChild */}
                <SidebarMenu>
                    {items.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                tooltip={item.title}
                                isActive={isActive(item.url, pathname)}
                            >
                                <Link href={item.url}>
                                    {item.icon && <item.icon className="h-4 w-4" />}
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    )
}
