"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuthStore, User } from "@/store/useAuthStore";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { SideBarProfile } from "./_components/SideBarProfile";
import Link from "next/link";

export default function ProfilePage() {

    const pathname = usePathname() || "";
    const user = useAuthStore(state => state.user);
    const form = useForm<User>({
        defaultValues: user || {},
        mode: "onChange"
    })
    console.log('Profile user:', user);

    const ro = { readOnly: true, disabled: true } as const;
    useEffect(() => {
        // Khi 'user' có dữ liệu (không phải null)
        if (user) {
            // 'reset' sẽ cập nhật toàn bộ giá trị của form
            // mà không làm mất trạng thái (như errors, touched...)
            form.reset(user);
        }
    }, [user, form.reset]);

    return (
        <Card className="shadow-lg">
            <CardHeader className="pb-0">
                <CardTitle className="text-xl md:text-2xl">Thông tin cá nhân</CardTitle>
            </CardHeader>

            <CardContent className="pt-4">
                <div className="w-full flex items-center justify-center mb-6">
                    <img
                        src={user?.avatar || "/placeholder-avatar.png"}
                        alt="Avatar"
                        className="h-28 w-28 md:h-32 md:w-32 rounded-full object-cover ring-2 ring-border"
                    />
                </div>

                    <Form {...form}>
                        <form className="grid grid-cols-1 md:grid-cols-2 md:gap-6 gap-4">
                            <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Họ và tên</FormLabel>
                                        <FormControl>
                                            <Input {...field} value={field.value ?? ''} {...ro} className="" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input type="email" {...field} value={field.value ? field.value : 'Chưa có'} {...ro} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="phoneNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Số điện thoại</FormLabel>
                                        <FormControl>
                                            <Input {...field} value={field.value ? field.value : 'Chưa có'} {...ro} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="birthday"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Ngày sinh</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} value={field.value? field.value:""} {...ro} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="address"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Địa chỉ</FormLabel>
                                        <FormControl>
                                            <Input type="text" {...field} value={field.value ? field.value : 'Chưa có'} {...ro} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="gender"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Giới tính</FormLabel>
                                        <FormControl>
                                            <Input type="text" {...field} value={field.value ? field.value : 'Chưa có'} {...ro} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />


                            <FormField
                                control={form.control}
                                name="occupation"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nghề nghiệp</FormLabel>
                                        <FormControl>
                                            <Input type="text" {...field} value={field.value ? field.value : 'Chưa có'} {...ro} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            

                        </form>
                    </Form>
                    <Link href="/profile/edit">
                        <Button className="mt-6">Chỉnh sửa thông tin</Button>
                    </Link>
                    
            </CardContent>
        </Card>

    );
}