'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/useAuthStore'
import { loginUser } from '@/lib/api/auth'
import { toast } from 'sonner'
import z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { FormInput } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useCartStore } from '@/store/useCartStore'
import { getCart, mergeCart } from '@/lib/api/cart'
// import { useAuthStore } from '@/store/useAuthStore'


const loginSchema = z.object({
    email: z.email().min(1, "Email không được để trống"),
    password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
})

type LoginData = z.infer<typeof loginSchema>




const LoginPage = () => {
    const router = useRouter()
    const setAccessToken = useAuthStore((state) => state.setAccessToken)
    const setUser = useAuthStore((state) => state.setUser)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    // const { getState } = useCartStore();

    const form = useForm<LoginData>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: '', password: '' }
    })

    const onSubmit = async (values: LoginData) => {
        console.log(values)
        setLoading(true)
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
                credentials: "include" // Gửi cookie cùng request
            })
            const data = await res.json()
            console.log('Dữ liệu phản hồi từ server:', data)
            setAccessToken(data.accessToken)
            setUser({
                id: data.user.id,
                email: data.user.email,
                username: data.user.username,
                address: data.user.address,
                phoneNumber: data.user.phoneNumber,
                birthday: data.user.birthday,
                gender: data.user.gender,
                occupation: data.user.occupation,
                avatar: data.user.avatar,
                roles: data.roles  // Lưu roles vào trạng thái người dùng
            })
            toast.success('Đăng nhập thành công!')
            // Xử lý hợp nhất giỏ hàng ở đây nếu cần
            //get cart đầu tiên hoặc tạo cart
            const getOrCreateCart = await getCart();
            console.log("Giỏ hàng hiện tại của người dùng:", getOrCreateCart);
            const itemsInCartGuest = useCartStore.getState().getForMergePayload();
            console.log("Items in guest cart to merge:", itemsInCartGuest);
            const dataCartServer = await mergeCart(itemsInCartGuest);
            console.log("Cart sau khi hợp nhất:", dataCartServer.data.items);
            useCartStore.getState().clearGuest();
            useCartStore.getState().setServerMode(true);
            useCartStore.getState().setCart(dataCartServer.data.items);
            // Redirect theo role
            if (data.roles.includes('ADMIN')) {
                router.push('/admin')
            } else {
                router.push('/')
            }
        }
        catch (err: any) {
            toast.error(`Lỗi: ${err.message}`)
        }
        finally {
            setLoading(false)
        }
    }

    // const handleLogin = async () => {
    //     setLoading(true)
    //     setError(null)
    //     console.log('Đang xử lý đăng nhập với email:', email, 'và mật khẩu:', password)
    //     try {
    //         const data = await loginUser(email, password)
    //         console.log('Dữ liệu phản hồi từ server:', data)
    //         setAccessToken(data.accessToken)
    //         setUser({
    //             id: data.user.id,
    //             email: data.user.email,
    //             username: data.user.username,
    //             roles: data.roles  // Lưu roles vào trạng thái người dùng
    //         })
    //         toast.success('Đăng nhập thành công!')

    //         // Redirect theo role
    //         if (data.roles.includes('ADMIN')) {
    //             router.push('/admin')
    //         } else {
    //             router.push('/')
    //         }
    //     }
    //     catch (err: any) {
    //         toast.error(`Lỗi: ${err.message}`)
    //     }
    //     finally {
    //         setLoading(false)
    //     }
    // }

    return (
        <div className='min-h-screen flex items-center justify-center bg-background p-4'>
            <div className='w-full max-w-md border p-8'>
                <p className='text-center text-xl md:text-2xl font-semibold'>Đăng nhập</p>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8' >
                        <div>
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className='text-md md:text-xl md:font-medium'>Tài khoản</FormLabel>
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
                            {loading ? 'Đang đăng nhập..' : 'Đăng nhập'}
                        </Button>
                        {/* Hàng link phụ trợ */}
                        <div className='flex items-center justify-between text-sm text-muted-foreground'>
                            <Link href='/forgot-password' className='hover:underline'>
                                Quên mật khẩu?
                            </Link>
                            <div>
                                <span className='mr-1'>Chưa có tài khoản?</span>
                                <Link href='/register' className='font-medium hover:underline'>
                                    Đăng ký
                                </Link>
                            </div>
                        </div>
                    </form>
                </Form>

            </div>
        </div>
    )
}


export default LoginPage;