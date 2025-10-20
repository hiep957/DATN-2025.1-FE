import { CategoryBar } from "@/components/category-bar";
import { HeaderSection } from "@/components/layout/HeaderClient";
import { MobileNav } from "@/components/mobile/mobile-nav";




export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <HeaderSection />
            <CategoryBar />
            <main className="md:mx-32 px-4 py-2">{children}</main>
            <MobileNav />
        </>
    );
}
