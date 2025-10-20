"use client"

import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { ArrowLeft, Mail, ShieldCheck } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { requestPasswordReset, resetPassword, verifyOTP } from "@/lib/reset-password/api"
import { toast } from "sonner"
import { useRouter } from "next/navigation"


const emailSchema = z.object({
    email: z.email("Email không hợp lệ"),
})

const otpSchema = z.object({
    otp: z
        .string()
        .min(6, "OTP gồm 6 ký tự")
        .max(6, "OTP gồm 6 ký tự")
        .regex(/^\d{6}$/g, "OTP chỉ gồm số"),
})

const passwordSchema = z
    .object({
        password: z
            .string()
            .min(6, "Tối thiểu 6 ký tự"),
        confirm: z.string(),
    })
    .refine((data) => data.password === data.confirm, {
        path: ["confirm"],
        message: "Mật khẩu xác nhận không khớp",
    })
export default function ForgotPasswordPage() {
    const router = useRouter();
    const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Email, 2: OTP, 3: Password
    const [loading, setLoading] = useState(false)
    const emailForm = useForm<z.infer<typeof emailSchema>>({
        resolver: zodResolver(emailSchema),
        defaultValues: { email: "" },
        mode: "onTouched",
    })
    // OTP form
    const otpForm = useForm<z.infer<typeof otpSchema>>({
        resolver: zodResolver(otpSchema),
        defaultValues: { otp: "" },
        mode: "onTouched",
    })
    // Password form
    const pwdForm = useForm<z.infer<typeof passwordSchema>>({
        resolver: zodResolver(passwordSchema),
        defaultValues: { password: "", confirm: "" },
        mode: "onTouched",
    })

    const onSubmitEmail = async (data: z.infer<typeof emailSchema>) => {
        setLoading(true)
        console.log(data)
        try {
            // Gọi API gửi email
            const res = await requestPasswordReset(data.email)
            console.log(res)
            toast.success(res.message || "Đã gửi mã OTP về email của bạn")
            setStep(2);
            // setStep(2); 
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Gửi mã OTP thất bại")
            console.error(error);
        } finally {

            setLoading(false)
        }
    }

    const onSubmitOTP = async (data: z.infer<typeof otpSchema>) => {
        setLoading(true)
        console.log(data.otp)
        try {
            // Gọi API xác thực OTP
            const res = await verifyOTP(emailForm.getValues("email"), data.otp)
            // console.log(res)
            toast.success(res.message || "Xác thực OTP thành công")
            setStep(3);
            // setStep(3); // Chuyển sang bước đặt mật khẩu mới
        } catch (error: any) {
            // Xử lý lỗi
            toast.error(error?.response?.data?.message || "Xác thực OTP thất bại")
            console.error(error);
        } finally {

            setLoading(false)
        }
    }
    const onSubmitPassword = async (data: z.infer<typeof passwordSchema>) => {
        setLoading(true)
        console.log(data)
        try {
            // Gọi API đặt lại mật khẩu
            const res = await resetPassword(emailForm.getValues("email"), data.password)
            toast.success(res.message || "Đặt lại mật khẩu thành công")
            router.push("/login"); // Quay về trang đăng nhập
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Đặt lại mật khẩu thất bại")
            // Xử lý lỗi
            console.error(error);
        } finally {
            setLoading(false)
        }
    }
    const StepHeader = () => (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <button
                    className={cn(
                        "inline-flex h-9 w-9 items-center justify-center rounded-full border",
                        step === 1 ? "border-primary" : "border-muted-foreground/30"
                    )}
                    aria-label="Quay lại"
                    onClick={() => (step === 1 ? null : setStep((s) => (s > 1 ? ((s - 1) as 1 | 2 | 3) : s)))}
                >
                    <ArrowLeft className="h-4 w-4" />
                </button>
                <div>
                    <h2 className="text-lg font-semibold">Quên mật khẩu</h2>
                    <p className="text-xs text-muted-foreground">Bước {step} / 3</p>
                </div>
            </div>
            <ShieldCheck className="h-5 w-5 opacity-70" aria-hidden="true" />
        </div>
    )
    return (
        <div className="flex items-center justify-center px-4 py-6 min-h-screen ">
            <div className="w-full md:w-1/2 max-w-5xl grid grid-cols-1 gap-6">
                {/* Left: Form card */}
                <Card className="order-2 md:order-1 shadow-sm">
                    <CardHeader>
                        <StepHeader />
                    </CardHeader>

                    <CardContent>
                        {step === 1 && (
                            <>
                                <div>
                                    Hãy nhập địa chỉ email của bạn
                                </div>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    className="pl-9"
                                    {...emailForm.register("email")}
                                    aria-invalid={!!emailForm.formState.errors.email}
                                    aria-describedby="email-error"
                                />
                                {emailForm.formState.errors.email && (
                                    <p id="email-error" className="text-xs text-destructive">
                                        {emailForm.formState.errors.email.message}
                                    </p>
                                )}
                                <Button
                                    className="flex  gap-2 mt-4"
                                    onClick={() => emailForm.handleSubmit(onSubmitEmail)()}
                                    disabled={loading}
                                >
                                    {loading ? "Đang gửi OTP..." : "Gửi mã OTP"}
                                </Button>
                            </>

                        )}


                        {step === 2 && (
                            <>
                                <Form {...otpForm}>
                                    <form onSubmit={otpForm.handleSubmit(onSubmitOTP)} >
                                        <FormField
                                            control={otpForm.control}
                                            name="otp"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>One-Time Password</FormLabel>
                                                    <FormControl>
                                                        <InputOTP maxLength={6} {...field}>
                                                            <InputOTPGroup>
                                                                <InputOTPSlot index={0} />
                                                                <InputOTPSlot index={1} />
                                                                <InputOTPSlot index={2} />
                                                                <InputOTPSlot index={3} />
                                                                <InputOTPSlot index={4} />
                                                                <InputOTPSlot index={5} />
                                                            </InputOTPGroup>
                                                        </InputOTP>
                                                    </FormControl>
                                                    <FormDescription>
                                                        Please enter the one-time password sent to your phone.
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />


                                        <Button
                                            className="flex  gap-2 mt-4"
                                            type="submit"
                                            disabled={loading}
                                        >
                                            {loading ? "Đang xác thực..." : "Xác thực OTP"}
                                        </Button>
                                    </form>
                                </Form>
                            </>
                        )}

                        {step === 3 && (
                            <>
                                <Form {...pwdForm}>
                                    <form onSubmit={pwdForm.handleSubmit(onSubmitPassword)} className="space-y-4">
                                        <FormField
                                            control={pwdForm.control}
                                            name="password"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Mật khẩu mới</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="password"
                                                            placeholder="Mật khẩu mới"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={pwdForm.control}
                                            name="confirm"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Xác nhận mật khẩu</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="password"
                                                            placeholder="Xác nhận mật khẩu"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </form>

                                    <Button
                                        className="flex  gap-2 mt-4"
                                        onClick={() => pwdForm.handleSubmit(onSubmitPassword)()}
                                        disabled={loading}
                                    >
                                        {loading ? "Đang đặt lại mật khẩu..." : "Đặt lại mật khẩu"}
                                    </Button>

                                </Form>
                            </>
                        )}

                    </CardContent>


                    <CardFooter className="flex flex-col gap-2 text-xs text-muted-foreground">
                        <Separator />
                        <div className="w-full flex items-center justify-between">
                            <span>Đã nhớ mật khẩu?</span>
                            <a href="/login" className="underline">Quay lại đăng nhập</a>
                        </div>
                    </CardFooter>
                </Card>


            </div>
        </div>
    )
}