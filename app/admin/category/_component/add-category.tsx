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
import { Form, FormField, FormItem, FormControl } from "@/components/ui/form"
import { Loader2 } from "lucide-react"
import { uploadSingleFileApi } from "@/lib/upload-image/upload"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Category } from "../../product/type"
import { createCategory } from "@/lib/api/category";
import { toast } from "sonner";

// 1. Định nghĩa kiểu props nhận vào
interface AddCategoryProps {
    onSuccess: () => void; // Hàm này không trả về gì,
    categories: Category[];

}

const categoryFormSchema = z.object({
    name: z.string().min(2),
    slug: z.string().min(2),
    thumbnail: z.string().min(1),
    parentId: z.number().nullable(),
});

type CategoryFormData = z.infer<typeof categoryFormSchema>;

export function AddCategoryDialog({ onSuccess, categories }: AddCategoryProps) {
    const [open, setOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const form = useForm<CategoryFormData>({
        resolver: zodResolver(categoryFormSchema),
        defaultValues: {
            name: "",
            slug: "",
            thumbnail: "",
            parentId: null,
        }
    });

    const onSubmit = async (data: CategoryFormData) => {
        console.log("DATA GỬI LÊN BACKEND:", data);
        try {
            setLoading(true);
            const res = await createCategory(data);
            if (res.statusCode === 201) {
                onSuccess(); // Gọi hàm onSuccess sau khi thêm thành công
                toast.success("Thêm danh mục thành công");
                form.reset();
                setPreviewImage(null);
                setOpen(false);
            }
        } catch (error: any) {
            toast.error(error.message || "Thêm danh mục thất bại");
        } finally {
            setLoading(false);
        }


    };

    const handleImageCategory = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setLoading(true);
            const imageUrl = await uploadSingleFileApi(file);
            setLoading(false);
            setPreviewImage(imageUrl);


            form.setValue("thumbnail", imageUrl);
        }
    };

    const parentCategories = categories.filter(c => !c.parentId);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant={"default"}>Thêm danh mục</Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Thêm danh mục mới</DialogTitle>
                    <DialogDescription>
                        Điền thông tin danh mục.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                        {/* ẢNH */}
                        <div className="flex flex-col items-center">
                            {loading ? (
                                <div className="w-28 h-28 rounded-full border flex items-center justify-center">
                                    <Loader2 className="animate-spin" />
                                </div>
                            ) : (
                                <img
                                    src={previewImage || "/placeholder-avatar.png"}
                                    className="w-28 h-28 rounded-full object-cover border"
                                />
                            )}

                            <Input
                                type="file"
                                accept="image/*"
                                onChange={handleImageCategory}
                                className="mt-2"
                            />
                        </div>

                        {/* NAME */}
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <Label>Tên danh mục</Label>
                                    <FormControl>
                                        <Input placeholder="Nhập tên" {...field} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        {/* SLUG */}
                        <FormField
                            control={form.control}
                            name="slug"
                            render={({ field }) => (
                                <FormItem>
                                    <Label>Slug</Label>
                                    <FormControl>
                                        <Input placeholder="ví dụ: ao-thun" {...field} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        {/* PARENT */}
                        <FormField
                            control={form.control}
                            name="parentId"
                            render={({ field }) => (
                                <FormItem>
                                    <Label>Danh mục cha</Label>

                                    <Select
                                        onValueChange={(v) =>
                                            field.onChange(v === "null" ? null : Number(v))
                                        }
                                        defaultValue="null"
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn danh mục cha" />
                                            </SelectTrigger>
                                        </FormControl>

                                        <SelectContent>
                                            <SelectItem value="null">Không có</SelectItem>

                                            {parentCategories.map((cat) => (
                                                <SelectItem value={cat.id.toString()} key={cat.id}>
                                                    {cat.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="submit" disabled={loading}>
                                Lưu danh mục
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
