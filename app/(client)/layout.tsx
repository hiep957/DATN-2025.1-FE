import { HeaderSection } from "@/components/layout/HeaderClient";




export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <HeaderSection />
            <main>{children}</main>

        </>
    );
}
