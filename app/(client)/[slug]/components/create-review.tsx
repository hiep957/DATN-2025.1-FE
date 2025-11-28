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
import { useRef, useState } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormField, FormItem, FormControl, FormMessage, FormLabel } from "@/components/ui/form"
import { Loader2, Star, X } from "lucide-react"
import { uploadMultipleFilesApi, uploadSingleFileApi } from "@/lib/upload-image/upload"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { createCategory } from "@/lib/api/category";
import { toast } from "sonner";
import { createReviewForProduct } from "@/lib/api/get-product";
import { useAuthStore } from "@/store/useAuthStore";

// 1. Định nghĩa kiểu props nhận vào


const createReview = z.object({
    rating: z.number().min(1).max(5),
    comment: z.string().min(5),
    image_urls: z.array(z.object({ url: z.string().url("URL ảnh không hợp lệ") })),
});

type CreateReviewFormData = z.infer<typeof createReview>;

export function AddReviewProduct({ productId }: { productId: number }) {
    const [open, setOpen] = useState(false);
    const user = useAuthStore((state) => state.user);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false); // --- THAY ĐỔI: State mới cho upload
    const [hoveredRating, setHoveredRating] = useState<number | null>(null);
    const form = useForm<CreateReviewFormData>({
        resolver: zodResolver(createReview),
        defaultValues: {
            rating: 1,
            comment: "",
            image_urls: [],
        }
    });
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "image_urls", // QUAN TRỌNG: Phải khớp với schema
    });
    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) {
            return;
        }

        setIsUploading(true);
        try {
            const filesArray = Array.from(files);
            const uploadedUrls = await uploadMultipleFilesApi(filesArray);

            // Thêm từng URL ảnh vào field array
            uploadedUrls.forEach(url => {
                if (url) {
                    append({ url });
                }
            });

        } catch (error) {
            console.error("Upload failed:", error);
            // Bạn có thể hiển thị thông báo lỗi cho người dùng ở đây
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };
    const onSubmit = async (data: CreateReviewFormData) => {
        console.log("DATA GỬI LÊN BACKEND:", data);
        try {
            setLoading(true);
            //Chuẩn hoá link ảnh 
            const imageUrls = data.image_urls.map(img => img.url);
            console.log("IMAGE URLS:", imageUrls);
            const res = await createReviewForProduct(productId, user?.id || 0, data.comment, data.rating, imageUrls);
            console.log("RESPONSE TỪ BACKEND:", res);
            if (res.data.statusCode === 201) {
                toast.success("Bình luận của bạn đã được gửi thành công, vui lòng chờ duyệt!", { duration: 4000 });
                form.reset();
                setOpen(false);
            }
        } catch (error: any) {
            const backendMessage =
                error.response?.data?.message || "Thêm bình luận thất bại";

            toast.error(backendMessage);
        } finally {
            setLoading(false);
        }


    };




    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild className="flex ml-auto">
                <Button variant={"default"}>Thêm bình luận</Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Thêm bình luận mới</DialogTitle>
                    <DialogDescription>
                        Điền thông tin bình luận.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                        <FormField
                            control={form.control}
                            name="rating"
                            render={({ field }) => (
                                <FormItem>
                                    <Label className="mb-1 block">Đánh giá</Label>
                                    <FormControl>
                                        <div className="flex items-center gap-2">
                                            {[1, 2, 3, 4, 5].map((value) => {
                                                const current =
                                                    hoveredRating !== null
                                                        ? hoveredRating
                                                        : field.value ?? 0;
                                                const active = value <= current;

                                                return (
                                                    <button
                                                        key={value}
                                                        type="button"
                                                        className="p-1"
                                                        onMouseEnter={() => setHoveredRating(value)}
                                                        onMouseLeave={() => setHoveredRating(null)}
                                                        onClick={() => field.onChange(value)}
                                                    >
                                                        <Star
                                                            className={
                                                                "h-7 w-7 transition-colors " +
                                                                (active
                                                                    ? "text-yellow-400 fill-yellow-400"
                                                                    : "text-gray-300")
                                                            }
                                                            // để fill theo text color
                                                            fill="currentColor"
                                                        />
                                                    </button>
                                                );
                                            })}
                                            <span className="ml-2 text-sm text-muted-foreground">
                                                {field.value}/5
                                            </span>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* COMMENT */}
                        <FormField
                            control={form.control}
                            name="comment"
                            render={({ field }) => (
                                <FormItem>
                                    <Label className="mb-1 block">Bình luận</Label>
                                    <FormControl>
                                        <textarea
                                            {...field}
                                            className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                            placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />


                        <div>
                            <FormLabel>Hình ảnh</FormLabel>
                            <div className="mt-2 p-3 sm:p-4 border-2 border-dashed rounded-lg">
                                {/* Khu vực hiển thị các ảnh đã upload */}
                                {/* CHỈNH SỬA: grid-cols-3 cho mobile, gap-2 cho gọn */}
                                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-4 mb-4">
                                    {fields.map((img, idx) => (
                                        <div key={img.id} className="relative aspect-square group">
                                            <img
                                                src={img.url}
                                                alt={`Product image ${idx + 1}`}
                                                className="h-full w-full object-cover rounded-md border border-slate-200"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => remove(idx)}
                                                // CHỈNH SỬA: opacity-100 (luôn hiện trên mobile) -> sm:opacity-0 (ẩn trên desktop chờ hover)
                                                className="absolute -top-2 -right-2 sm:top-1 sm:right-1 z-10 
                       bg-red-500 text-white rounded-full p-1 
                       opacity-100 sm:opacity-0 sm:group-hover:opacity-100 
                       transition-opacity shadow-sm"
                                                aria-label="Remove image"
                                            >
                                                <X size={14} /> {/* Giảm size icon chút cho mobile đỡ che ảnh */}
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                {/* Nút Upload */}
                                <FormControl>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isUploading}
                                        className="w-full sm:w-auto" // Mobile nút full width cho dễ bấm
                                    >
                                        {isUploading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Đang tải lên...
                                            </>
                                        ) : (
                                            "Tải ảnh lên"
                                        )}
                                    </Button>
                                </FormControl>

                                {/* Input file bị ẩn */}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileSelect}
                                    className="hidden"
                                    multiple
                                    accept="image/png, image/jpeg, image/gif, image/webp"
                                />

                                {/* Hiển thị lỗi chung của trường images */}
                                <p className="mt-2 text-sm font-medium text-destructive">
                                    {form.formState.errors.image_urls?.message || form.formState.errors.image_urls?.root?.message}
                                </p>
                            </div>
                        </div>


                        <DialogFooter>
                            <Button type="submit" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Đang thêm...
                                    </>
                                ) : (
                                    "Thêm bình luận"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
