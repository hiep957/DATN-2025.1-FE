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
import { createSize } from "@/lib/api/category";
import { toast } from "sonner";

// 1. Định nghĩa kiểu props nhận vào
interface AddSizeProps {
    onSuccess: () => void; // Hàm này không trả về gì,
}

const addSizeSchema = z.object({
    code: z.string().min(1, { message: "Code không được để trống" }),
    name: z.string().min(1, { message: "Name không được để trống" }),
});

type SizeFormData = z.infer<typeof addSizeSchema>;

export function AddSizeDialog({ onSuccess }: AddSizeProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const form = useForm<SizeFormData>({
        resolver: zodResolver(addSizeSchema),
        defaultValues: {
            name: "",
            code: "",
        }
    });

    const onSubmit = async (data: SizeFormData) => {
        console.log("DATA GỬI LÊN BACKEND:", data);
        try {
            setLoading(true);
            const res = await createSize(data.code, data.name);
            if (res.statusCode === 201) {
                onSuccess(); // Gọi hàm onSuccess sau khi thêm thành công
                toast.success("Thêm size thành công");
                form.reset();
                setOpen(false);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Thêm size thất bại");
        } finally {
            setLoading(false);
        }
    };



    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant={"default"} >Thêm size</Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Thêm size mới</DialogTitle>
                    <DialogDescription>
                        Điền thông tin size.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* NAME */}
                        <FormField
                            control={form.control}
                            name="code"
                            render={({ field }) => (
                                <FormItem>
                                    <Label>Code</Label>
                                    <FormControl>
                                        <Input placeholder="Nhập code" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                              
                            )}
                        />

                        {/* SLUG */}
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <Label>Name</Label>
                                    <FormControl>
                                        <Input placeholder="Nhập tên" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit" disabled={loading}>
                                Thêm size
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
