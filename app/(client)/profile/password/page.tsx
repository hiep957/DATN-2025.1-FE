"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import z from "zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { changeUserPassword, logoutUser } from "@/lib/api/auth";
import { Lock } from "lucide-react";
const passwordSchema = z.object({
    oldPassword: z.string().min(6, "Mật khẩu cũ phải có ít nhất 6 ký tự"),
    newPassword: z.string().min(6, "Mật khẩu mới phải có ít nhất 6 ký tự"),
});
type PasswordFormData = z.infer<typeof passwordSchema>;
export default function ChangePassword() {
    const [showPw, setShowPw] = useState({
        old: false,
        new: false,
        confirm: false,
    });

    const togglePw = (key: keyof typeof showPw) => {
        setShowPw((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const form = useForm<PasswordFormData>({
        defaultValues: {
            oldPassword: "",
            newPassword: "",
        },
        resolver: zodResolver(passwordSchema),
    })
    const onSubmit = async (data: PasswordFormData) => {
        try {
            const res = await changeUserPassword(
                data.oldPassword,
                data.newPassword
            );
            toast.success(res.message || "Cập nhật mật khẩu thành công");
            form.reset();
        } catch (error: any) {
            const message =
                error?.response?.data?.message || "Cập nhật mật khẩu thất bại";

            toast.error(message);
        }
    };

    return (
        <Card className="shadow-lg h-[calc(60vh-5rem)]">
            <CardHeader className="pb-0">
                <CardTitle className="text-xl md:text-2xl flex items-center gap-2">
                    <Lock className="w-6 h-6 text-primary" />
                    Thay đổi mật khẩu
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="flex flex-col gap-6"
                    >
                        <FormField
                            control={form.control}
                            name="oldPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Mật khẩu cũ</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                type={showPw.old ? "text" : "password"}
                                                {...field}
                                                value={field.value ?? ""}
                                                placeholder="Nhập mật khẩu cũ"
                                                className="pr-10"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => togglePw("old")}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                            >
                                                {showPw.old ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="newPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Mật khẩu mới</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                type={showPw.new ? "text" : "password"}
                                                {...field}
                                                value={field.value ?? ""}
                                                placeholder="Nhập mật khẩu mới"
                                                className="pr-10"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => togglePw("new")}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                            >
                                                {showPw.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button
                            type="submit"
                            className="w-full bg-primary text-white py-2 rounded-md hover:bg-primary/90 transition"
                        >
                            Cập nhật mật khẩu
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}