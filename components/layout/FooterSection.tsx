import Link from "next/link";
import { Facebook, Instagram, Youtube, Phone, Mail, MapPin } from "lucide-react";

export function Footer() {
    return (
        <footer className="mt-16 border-t  bg-gray-50">
            <div className="max-w-full md:mx-32 px-4 py-10 md:py-12">
                {/* Top */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Cột 1: Brand */}
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                            ShopMate
                        </h2>
                        <p className="mt-3 text-sm text-gray-600">
                            Thời trang đơn giản, dễ mặc, phù hợp mọi ngày.  
                            Giao nhanh, đổi trả dễ dàng, chăm sóc tận tâm.
                        </p>
                        <div className="mt-4 flex items-center gap-3">
                            <a
                                href="#"
                                className="h-9 w-9 flex items-center justify-center rounded-full border bg-white hover:bg-gray-100 transition"
                                aria-label="Facebook"
                            >
                                <Facebook className="h-4 w-4" />
                            </a>
                            <a
                                href="#"
                                className="h-9 w-9 flex items-center justify-center rounded-full border bg-white hover:bg-gray-100 transition"
                                aria-label="Instagram"
                            >
                                <Instagram className="h-4 w-4" />
                            </a>
                            <a
                                href="#"
                                className="h-9 w-9 flex items-center justify-center rounded-full border bg-white hover:bg-gray-100 transition"
                                aria-label="YouTube"
                            >
                                <Youtube className="h-4 w-4" />
                            </a>
                        </div>
                    </div>

                    {/* Cột 2: Về ShopMate */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                            Về ShopMate
                        </h3>
                        <ul className="mt-4 space-y-2 text-sm text-gray-600">
                            <li>
                                <Link href="#" className="hover:text-gray-900">
                                    Giới thiệu
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="hover:text-gray-900">
                                    Tuyển dụng
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="hover:text-gray-900">
                                    Tin tức & Blog
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Cột 3: Hỗ trợ */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                            Hỗ trợ khách hàng
                        </h3>
                        <ul className="mt-4 space-y-2 text-sm text-gray-600">
                            <li>
                                <Link href="#" className="hover:text-gray-900">
                                    Hướng dẫn mua hàng
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="hover:text-gray-900">
                                    Chính sách đổi trả
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="hover:text-gray-900">
                                    Chính sách bảo mật
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="hover:text-gray-900">
                                    Điều khoản sử dụng
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Cột 4: Liên hệ */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                            Liên hệ
                        </h3>
                        <ul className="mt-4 space-y-3 text-sm text-gray-600">
                            <li className="flex items-start gap-2">
                                <Phone className="h-4 w-4 mt-0.5" />
                                <span>Hotline: <span className="font-medium text-gray-900">1900 9999</span></span>
                            </li>
                            <li className="flex items-start gap-2">
                                <Mail className="h-4 w-4 mt-0.5" />
                                <span>Email: support@shopmate.vn</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <MapPin className="h-4 w-4 mt-0.5" />
                                <span>Hà Nội, Việt Nam</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom */}
                <div className="mt-8 pt-6 border-t flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
                    <p>© {new Date().getFullYear()} ShopMate. All rights reserved.</p>

                    <div className="flex items-center gap-3">
                        <span>Hỗ trợ thanh toán:</span>
                        <div className="flex items-center gap-2 text-[10px] font-medium">
                            <span className="px-2 py-1 rounded border bg-white">VNPAY</span>
                            <span className="px-2 py-1 rounded border bg-white">MOMO</span>
                            <span className="px-2 py-1 rounded border bg-white">COD</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
