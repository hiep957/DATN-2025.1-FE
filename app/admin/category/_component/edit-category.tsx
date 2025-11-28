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
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormField, FormItem, FormControl } from "@/components/ui/form"
import { Loader2, Edit } from "lucide-react" // Import icon Edit
import { uploadSingleFileApi } from "@/lib/upload-image/upload"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Category } from "../../product/type"
// import { updateCategory } from "@/lib/api/category"; // Giả sử bạn có hàm này
import { toast } from "sonner";
import { updateCategory } from "@/lib/api/category";

// 1. Định nghĩa kiểu props nhận vào
interface EditCategoryProps {
    category: Category; // Dữ liệu dòng hiện tại
    onSuccess: () => void;
    categories: Category[]; // Để chọn danh mục cha
}

const categoryFormSchema = z.object({
    name: z.string().min(2),
    slug: z.string().min(2),
    thumbnail: z.string().optional(), // Update thì ảnh có thể không đổi
    parentId: z.number().nullable(),
});

type CategoryFormData = z.infer<typeof categoryFormSchema>;

export function EditCategoryDialog({ category, onSuccess, categories }: EditCategoryProps) {
    const [open, setOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(category.thumbnail || null);
    const [loading, setLoading] = useState(false);

    const form = useForm<CategoryFormData>({
        resolver: zodResolver(categoryFormSchema),
        defaultValues: {
            name: category.name,
            slug: category.slug,
            thumbnail: category.thumbnail || "",
            parentId: category.parentId,
        }
    });

    // QUAN TRỌNG: Reset form khi category thay đổi hoặc dialog mở lại
    useEffect(() => {
        if (open) {
            form.reset({
                name: category.name,
                slug: category.slug,
                thumbnail: category.thumbnail || "",
                parentId: category.parentId,
            });
            setPreviewImage(category.thumbnail || null);
        }
    }, [category, open, form]);

    const onSubmit = async (data: CategoryFormData) => {
        console.log("DATA CẬP NHẬT:", data);
        try {
            setLoading(true);
            
            // Gọi API Update (bạn cần tạo hàm updateCategory nhận id và data)
            const res = await updateCategory(category.id, data);
            
            if (res.statusCode === 200 || res.statusCode === 201) {
                onSuccess();
                toast.success("Cập nhật danh mục thành công");
                setOpen(false);
            }
        } catch (error: any) {
            toast.error(error.message || "Cập nhật thất bại");
        } finally {
            setLoading(false);
        }
    };

    const handleImageCategory = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setLoading(true);
            try {
                const imageUrl = await uploadSingleFileApi(file);
                setPreviewImage(imageUrl);
                form.setValue("thumbnail", imageUrl);
            } catch (error) {
                toast.error("Lỗi upload ảnh");
            } finally {
                setLoading(false);
            }
        }
    };

    // Logic lọc danh mục cha:
    // 1. Chỉ lấy những cái không có parentId (Level 1)
    // 2. QUAN TRỌNG: Loại bỏ chính nó (không thể chọn mình làm cha của mình)
    const parentCategories = categories.filter(c => 
        !c.parentId && c.id !== category.id
    );

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {/* Button icon Edit cho bảng */}
                <button className="p-1 rounded hover:bg-gray-200 text-black transition">
                    <Edit size={18} />
                </button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Cập nhật danh mục</DialogTitle>
                    <DialogDescription>
                        Chỉnh sửa thông tin cho ID: {category.id}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                        {/* ẢNH */}
                        <div className="flex flex-col items-center">
                            {loading && !previewImage ? (
                                <div className="w-28 h-28 rounded-full border flex items-center justify-center">
                                    <Loader2 className="animate-spin" />
                                </div>
                            ) : (
                                <img
                                    src={previewImage || "/placeholder-avatar.png"}
                                    alt="Preview"
                                    className="w-28 h-28 rounded-full object-cover border"
                                />
                            )}

                            <Input
                                type="file"
                                accept="image/*"
                                onChange={handleImageCategory}
                                className="mt-2"
                                disabled={loading}
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
                                        // Xử lý giá trị null vs string cho Select
                                        onValueChange={(v) =>
                                            field.onChange(v === "null" ? null : Number(v))
                                        }
                                        value={field.value ? field.value.toString() : "null"}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn danh mục cha" />
                                            </SelectTrigger>
                                        </FormControl>

                                        <SelectContent>
                                            <SelectItem value="null">Không có (Cấp 1)</SelectItem>
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
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Lưu thay đổi
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}