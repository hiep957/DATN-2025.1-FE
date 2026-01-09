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

import { BASE_URL } from "@/lib/axios"
export function CategoryBar() {
    const isMobile = useIsMobile()
    const router = useRouter();

    const [categories, setCategories] = React.useState<Category[] | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<Error | null>(null);

    React.useEffect(() => {
        const fetchCategories = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const res = await fetch(`${BASE_URL}/category`, {
                    method: 'GET',
                    headers:{
                        "ngrok-skip-browser-warning": "true",
                    }
                });
                const json = await res.json();
                if (!res.ok) {
                    throw new Error("Failed to fetch categories");
                }
                setCategories(json.data.data);
            } catch (err) {
                setError(err as Error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCategories();
    }, []);

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
