"use client";
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import z from "zod"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form"
import { createColor, createSize } from "@/lib/api/category";
import { toast } from "sonner";

// 1. Định nghĩa kiểu props nhận vào
interface AddColorProps {
    onSuccess: () => void; // Hàm này không trả về gì,
}

const addColorSchema = z.object({
    name: z.string().min(1, { message: "Tên không được để trống" }),
    code: z.string().min(7, { message: "Mã màu phải có ít nhất 7 ký tự" }),
    englishName: z.string().min(1, { message: "English Name không được để trống" }),
});

type ColorFormData = z.infer<typeof addColorSchema>;

export function AddColorDialog({ onSuccess }: AddColorProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const form = useForm<ColorFormData>({
        resolver: zodResolver(addColorSchema),
        defaultValues: {
            name: "",
            code: "",
            englishName: "",
        }
    });

    const onSubmit = async (data: ColorFormData) => {
        console.log("DATA GỬI LÊN BACKEND:", data);
        try {
            setLoading(true);
            const res = await createColor(data.code, data.name, data.englishName);
            if (res.statusCode === 201) {
                onSuccess(); // Gọi hàm onSuccess sau khi thêm thành công
                toast.success("Thêm color thành công");
                form.reset();
                setOpen(false);
            }
        } catch (error: any) {
            console.error("Lỗi khi thêm color:", error);
            toast.error(error.response?.data?.message || "Thêm color thất bại");
            // form.reset();
            // setOpen(false);
        } finally {
            setLoading(false);
        }
    };



    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant={"default"} >Thêm color</Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Thêm color mới</DialogTitle>
                    <DialogDescription>
                        Điền thông tin color.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* NAME */}
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <Label>Tên màu</Label>
                                    <FormControl>
                                        <Input placeholder="Nhập tên màu" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>

                            )}
                        />


                        <FormField
                            control={form.control}
                            name="code"
                            render={({ field }) => {
                                const hex = (field.value ?? "").trim();
                                const isValidHex = /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/.test(hex);

                                return (
                                    <FormItem>
                                        <Label>Mã màu</Label>

                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    placeholder="#RRGGBB (vd: #ff0000)"
                                                    {...field}
                                                    className="pr-10" // chừa chỗ cho chấm tròn
                                                />

                                                {/* chấm tròn preview */}
                                                <span
                                                    className={[
                                                        "absolute right-3 top-1/2 -translate-y-1/2",
                                                        "h-5 w-5 rounded-full border",
                                                        isValidHex ? "" : "bg-muted",
                                                    ].join(" ")}
                                                    style={isValidHex ? { backgroundColor: hex } : undefined}
                                                    title={isValidHex ? hex : "Hex không hợp lệ"}
                                                    aria-label="Color preview"
                                                />
                                            </div>
                                        </FormControl>

                                        <FormMessage />
                                    </FormItem>
                                );
                            }}
                        />


                        {/* ENGLISH NAME */}
                        <FormField
                            control={form.control}
                            name="englishName"
                            render={({ field }) => (
                                <FormItem>
                                    <Label>Tên tiếng Anh</Label>
                                    <FormControl>
                                        <Input placeholder="Nhập tên tiếng Anh" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>

                            )}
                        />


                        <DialogFooter>
                            <Button type="submit" disabled={loading}>
                                Thêm color
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
