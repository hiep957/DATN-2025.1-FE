import { useEffect, useState } from "react";

function useIsMobile() {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768); // 768px là điểm gãy (breakpoint) md của Tailwind
        };

        // Kiểm tra ngay lúc đầu
        checkMobile();

        // Lắng nghe sự kiện resize
        window.addEventListener("resize", checkMobile);

        // Dọn dẹp khi component unmount
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    return isMobile;
}
export { useIsMobile };