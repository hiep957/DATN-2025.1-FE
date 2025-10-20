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

export const fakeCategories: Category[] = [
    { id: 1, name: "Nam", slug: "nam", thumbnail: "/category-nam.jpg" },
    { id: 3, name: "Áo thun nam", slug: "ao-thun-nam", thumbnail: "/category-ao-thun-nam.jpg", parentId: 1 },
    { id: 6, name: "Áo Vest và Blazer", slug: "ao-vest-blazer", thumbnail: "/category-nam.jpg", parentId: 1 },
    { id: 2, name: "Nữ", slug: "nu", thumbnail: "/nu.jpg" },
];


export function CategoryBar() {
    const isMobile = useIsMobile()

    const parentCategories = fakeCategories.filter(category => !category.parentId);

    return (
        <div className="hidden w-full md:flex items-center justify-center">
            <NavigationMenu viewport={isMobile} >
                <NavigationMenuList className="flex-wrap">
                    {
                        parentCategories.map(parent => {
                            const childCategories = fakeCategories.filter(
                                child => child.parentId === parent.id
                            );

                            if (childCategories.length > 0) {
                                return (
                                    <NavigationMenuItem className="hidden md:block relative" key={parent.id}>
                                        <NavigationMenuTrigger>{parent.name}</NavigationMenuTrigger>
                                        <NavigationMenuContent className="absolute left-1/2 -translate-x-1/2 md:w-auto">
                                            <ul className="grid gap-2 sm:w-[400px] md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                                                {childCategories.map(child => (
                                                    <NavigationMenuLink asChild key={child.id}>
                                                        <Link href="#" className="flex flex-row items-center gap-3 rounded-md p-2 hover:bg-accent focus:bg-accent">
                                                            <Avatar className="h-8 w-8">
                                                                <AvatarImage src={child.thumbnail} alt="@shadcn" />
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
