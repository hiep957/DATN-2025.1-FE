"use client"
import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { registerUser } from "@/lib/api/auth";
import { ca, ro, se } from "date-fns/locale";
import { toast } from "sonner";

const registerSchema = z.object({
    email: z.email().min(1, "Email không được để trống"),
    password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    username: z.string().min(1, "Họ và tên không được để trống"),

})

type RegisterData = z.infer<typeof registerSchema>
export default function RegisterPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const form = useForm<RegisterData>({
        resolver: zodResolver(registerSchema),
        defaultValues: { email: '', password: '', username: '' }
    })
    const onSubmit = async (values: RegisterData) => {
        console.log(values)
        setLoading(true)
        try {
            const res = await registerUser(values.username, values.email, values.password)
            if (res.statusCode === 201) {
                setLoading(false)
                toast.success("Đăng ký thành công! Vui lòng đăng nhập.")
                router.push('/login')
            } else {
                toast.error(res.message || "Đăng ký thất bại")
                setLoading(false)
            }
        } catch (error) {
            console.log("Đăng ký thất bại:", error);
            setLoading(false)
            return
        }
    }
    return (
        <div className='min-h-screen flex items-center justify-center bg-background p-4'>
            <div className='w-full max-w-md border p-8'>
                <p className='text-center text-xl md:text-2xl font-semibold'>Đăng ký</p>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8' >
                        <div>
                            <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className='text-md md:text-xl md:font-medium'>Tên người dùng</FormLabel>
                                        <FormControl>
                                            <Input className='md:p-4' placeholder='Nguyễn Văn A' {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div>
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className='text-md md:text-xl md:font-medium'>Email</FormLabel>
                                        <FormControl>
                                            <Input className='md:p-4' placeholder='name@example.com' {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div>
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className='text-md md:text-xl md:font-medium'>Mật khẩu</FormLabel>
                                        <FormControl>
                                            <Input type='password' placeholder='Mật khẩu' {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <Button className='w-full' type="submit">
                            {loading ? 'Đang đăng ký..' : 'Đăng ký'}
                        </Button>
                        {/* Hàng link phụ trợ */}
                        <div className='flex items-center justify-between text-sm text-muted-foreground'>
                            <Link href='/forgot-password' className='hover:underline'>
                                Quên mật khẩu?
                            </Link>
                            <div>
                                <span className='mr-1'>Đã có tài khoản?</span>
                                <Link href='/login' className='font-medium hover:underline'>
                                    Đăng nhập
                                </Link>
                            </div>
                        </div>
                    </form>
                </Form>

            </div>
        </div>
    );
}