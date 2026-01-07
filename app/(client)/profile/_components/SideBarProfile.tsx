"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Bell, CreditCard, Heart, LogOut, MapPin, Package, Shield, TicketPercent, User } from "lucide-react";
import Link from "next/link";

type NavItem = {
    label: string;
    href: string;
    icon: React.ElementType;
};

const accountItems: NavItem[] = [
    { label: "Thông tin cá nhân", href: "/profile", icon: User },
    { label: "Địa chỉ giao hàng", href: "/profile/addresses", icon: MapPin },
    { label: "Thay đổi mật khẩu", href: "/profile/password", icon: Shield },
];

const shoppingItems: NavItem[] = [
    { label: "Đơn hàng của tôi", href: "/profile/orders", icon: Package },
    { label: "Danh sách yêu thích", href: "/profile/wishlist", icon: Heart },

];

export function SideBarProfile({
    onLogout,
    pathname,
}: {
    onLogout?: () => void;
    pathname: string;
}) {
    const isActive = (href: string) => {
        // active nếu pathname bắt đầu bằng href (hỗ trợ các trang con)
        if (href === "/profile") return pathname === "/profile";
        return pathname.startsWith(href);
    };
    const renderGroup = (title: string, items: NavItem[]) => (
        <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground px-1">{title}</p>
            <div className="grid gap-1">
                {items.map(({ label, href, icon: Icon }) => {
                    const active = isActive(href);
                    return (
                        <Button
                            key={href}
                            asChild
                            variant={active ? "secondary" : "ghost"}
                            className={cn(
                                "justify-start h-10",
                                active && "font-medium"
                            )}
                            aria-current={active ? "page" : undefined}
                        >
                            <Link href={href} className="flex items-center gap-2">
                                <Icon className="h-4 w-4" />
                                <span>{label}</span>
                            </Link>
                        </Button>
                    );
                })}
            </div>
        </div>
    );

    return (
            <Card className=" h-[calc(85vh-5rem)] w-full shadow-lg flex flex-col">
                <CardHeader>
                    <CardTitle className="text-xl md:text-2xl">Chào mừng bạn!</CardTitle>
                </CardHeader>

                <CardContent className="flex-1 min-h-0 pt-0">
                    <ScrollArea className="h-full pr-1">
                        <div className="space-y-4 pb-4">
                            {renderGroup("Tài khoản", accountItems)}
                            <Separator />
                            {renderGroup("Mua sắm", shoppingItems)}
                        </div>
                    </ScrollArea>
                </CardContent>

                <CardFooter className="mt-auto">
                    <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={onLogout}
                    >
                        <LogOut className="h-4 w-4 mr-2" />
                        Đăng xuất
                    </Button>
                </CardFooter>
            </Card>
       
    );
}