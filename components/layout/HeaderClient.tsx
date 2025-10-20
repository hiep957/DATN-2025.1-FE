import { Search, ShoppingBag } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import Link from "next/link";



export const HeaderSection = () => {
    return (
        <div className="sticky top-0 bg-white z-50  border-b">
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
                    <div className="hidden md:flex gap-6 font-medium md:items-center">
                        <ShoppingBag />
                        <Link href="/register">
                            <Button variant="default"

                            >Đăng ký</Button>
                        </Link>
                        <Link href="/login">
                            <Button variant="default">Đăng nhập</Button>
                        </Link>
                      
                    </div>

                    <div className="md:hidden">
                        <ShoppingBag />
                    </div>

                </div>
            </div>

        </div>
    );
}