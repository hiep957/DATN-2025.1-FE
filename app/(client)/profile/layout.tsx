"use client";
import { usePathname } from "next/navigation";
import { SideBarProfile } from "./_components/SideBarProfile";


export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const pathname = usePathname() || "";
    return (
        <div className="md:grid md:grid-cols-[1fr_3fr] md:gap-x-6">
            <div className="hidden md:flex  py-2">
                <SideBarProfile pathname={pathname} />
            </div>
            <div className="max-w-5xl py-2 ">
                {children}
            </div>
        </div>
    );
}