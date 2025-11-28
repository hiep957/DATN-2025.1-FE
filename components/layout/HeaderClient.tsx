"use client"
import { Menu, Search, ShoppingCart  } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { Avatar } from "@radix-ui/react-avatar";
import { AvatarFallback, AvatarImage } from "../ui/avatar";
import { DropdownMenu } from "../ui/dropdown-menu";
import { MenuProfile } from "./MenuProfile";
import { useCartStore } from "@/store/useCartStore";
import CartButton from "./CartButon";
import { useRouter } from "next/navigation";




export const HeaderSection = () => {
    const router = useRouter();
    const user = useAuthStore(state => state.user);
    const isAuth = useAuthStore(state => state.isAuthenticated)
    const items  = useCartStore(state=>state.items);
    //đến lượng cart
    console.log('Header user:', user);
    return (
        <div className="sticky top-0 bg-white z-52    border-b " >
            <div className="md:mx-32 px-4 py-2 flex justify-between items-center gap-4">
                <a href="/">
                    <h1 className="text-2xl font-bold">ShopMate</h1>
                </a>
                <div className="relative md:w-[300px]  max-w-md">
                    <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Tìm kiếm sản phẩm..."
                        className="w-full rounded-full pl-8"
                    />
                </div>
                <div>
                    {isAuth ? (
                        <div className="hidden md:flex gap-4 items-center font-medium ">
                            <CartButton count={items.length} size="md" onClick={() => router.push('/carts')} />
                            <p>Xin chào {user?.username}</p>
                            <MenuProfile avatarUrl={user?.avatar} />
                            
                        </div>
                    ) : (
                        <div className="hidden md:flex gap-6 font-medium md:items-center">
                            <CartButton count={items.length} size="md" onClick={() => router.push('/carts')} />
                            <Link href="/register">
                                <Button variant="default"

                                >Đăng ký</Button>
                            </Link>
                            <Link href="/login">
                                <Button variant="default">Đăng nhập</Button>
                            </Link>

                        </div>
                    )}


                    <div className="md:hidden">
                       <CartButton count={items.length} size="md" onClick={() => router.push('/carts')} />
                    </div>

                </div>
            </div>

        </div>
    );
}