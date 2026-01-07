// components/mobile-nav.tsx

"use client"; // Cần thiết nếu dùng App Router của Next.js

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation"; // Hook để lấy URL hiện tại
import { Home, Compass, MessageCircle, User, MenuIcon, Package, Settings, LogOut, ShoppingCart, Store } from "lucide-react";
import { cn } from "@/lib/utils"; // Hàm tiện ích của shadcn/ui
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { DrawerItem } from "./drawer-item";

import { Separator } from "../ui/separator";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "../ui/button";
import { useState } from "react";
import { logoutUser } from "@/lib/api/auth";
import { toast } from "sonner";
import { SheetCategory } from "./sheet-category";
import { useCartStore } from "@/store/useCartStore";

const navItems = [
  { href: "/", label: "Trang chủ", icon: Home },
  { href: "/messages", label: "Tin nhắn", icon: MessageCircle },
  // { href: "/profile", label: "Cá nhân", icon: User },
];

export function MobileNav() {
  const { isAuthenticated, user } = useAuthStore(); // Giả sử đã xác thực, thay bằng logic thật trong app của bạn
  const logout = useAuthStore((state) => state.logout);
  const handleLogout = async () => {
    const res = await logoutUser();
    if (res.statusCode === 201) {
      logout();
      setIsSheetOpen(false);
      useCartStore.getState().setCart([]);
      toast.success(res.messages || "Đăng xuất thành công");
      router.push('/');
    }
  }
  const pathname = usePathname();
  const router = useRouter();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const handleNavigation = (path: string) => {
    setIsSheetOpen(false);
    router.push(path);
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 border-t bg-background md:hidden">
      {/* - fixed bottom-0 left-0 right-0: Cố định ở dưới cùng màn hình
        - z-50: Đảm bảo nó nổi lên trên các nội dung khác
        - h-16: Chiều cao của thanh nav
        - border-t: Thêm đường viền mỏng ở trên
        - bg-background: Sử dụng màu nền mặc định của theme (hỗ trợ dark/light mode)
        - md:hidden: Ẩn thanh nav này trên màn hình từ medium (768px) trở lên
      */}
      <div className={cn("grid h-full max-w-lg grid-cols-4 mx-auto font-medium",
      )}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex flex-col items-center justify-center px-5 hover:bg-muted"
            >
              <Icon
                className={cn(
                  "h-6 w-6 mb-1 text-muted-foreground",
                  isActive && "text-primary" // Nếu active thì dùng màu primary
                )}
              />
              <span
                className={cn(
                  "text-xs text-muted-foreground",
                  isActive && "text-primary" // Nếu active thì dùng màu primary
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}

        <SheetCategory openSheetCategory={isMenuOpen} setOpenSheetCategory={setIsMenuOpen} />
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <button
              className="inline-flex flex-col items-center justify-center px-5 hover:bg-muted"
              aria-label="Menu"
            >
              <User className="h-6 w-6 mb-1 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Cá nhân</span>
            </button>
          </SheetTrigger>
          {isAuthenticated ? (
            <SheetContent
              side="left" // đổi thành "right" nếu muốn mở từ phải
              className="w-[320px] sm:w-[360px] bg-background/95 backdrop-blur-md"
            >

              <SheetHeader className="mb-2">
                <SheetTitle className="flex items-center gap-3">
                  <Avatar>
                    {/* <AvatarImage src="/your-avatar.png" alt="@you" /> */}
                    <AvatarFallback>TN</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-semibold">{user?.username}</span>
                    <span className="text-xs text-muted-foreground">
                      {user?.email}
                    </span>
                  </div>
                </SheetTitle>
                <SheetDescription className="sr-only">
                  Menu điều hướng nhanh
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-1">
                <DrawerItem
                  icon={User}
                  label="Thông tin cá nhân"
                  onClick={() => handleNavigation("/profile")}
                />
                <DrawerItem
                  icon={Package}
                  label="Đơn hàng"
                  onClick={() => handleNavigation("/profile/orders")}
                />
                <DrawerItem
                  icon={Settings}
                  label="Thay đổi mật khẩu"
                  onClick={() => handleNavigation("/profile/password")}
                />
              </div>

              <Separator className="my-3" />

              <div className="space-y-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-muted transition text-left"
                  aria-label="Đăng xuất"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="text-sm font-medium">Đăng xuất</span>
                </button>
              </div>

              <Separator className="my-3" />

              <div className="px-3">
                <p className="text-xs text-muted-foreground">
                  © {new Date().getFullYear()} YourCompany. Tất cả các quyền được
                  bảo lưu.
                </p>
              </div>
            </SheetContent>
          ) : (
            <SheetContent
              side="left" // đổi thành "right" nếu muốn mở từ phải
              className="w-[320px] sm:w-[360px] bg-background/95 backdrop-blur-md"
            >
              <SheetHeader className="mb-2">
                <SheetTitle className="text-lg font-semibold">Chào mừng!</SheetTitle>
                <SheetDescription className="text-sm text-muted-foreground">
                  Vui lòng đăng nhập hoặc đăng ký để tiếp tục.
                </SheetDescription>
              </SheetHeader>
              <div className="flex flex-col gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleNavigation("/login")}
                >
                  Đăng nhập
                </Button>
              </div>
            </SheetContent>

          )}
        </Sheet>


      </div>
    </nav>
  );
}