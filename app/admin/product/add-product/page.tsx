"use client";

import { useEffect, useRef, useState } from "react";
import { set, z } from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, X } from "lucide-react";
// shadcn/ui
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { uploadMultipleFilesApi } from "@/lib/upload-image/upload";
import { createProduct } from "@/lib/api/auth";
import { toast } from "sonner";
import { Category, Color, Size } from "../type";
import { getCategory, getColors, getSizes } from "@/lib/api/category";
import { ColorOption } from "./utils";
import { AddSizeDialog } from "./_component/add-size";
import { AddColorDialog } from "./_component/add-color";

// --- schema ---
const productFormSchema = z.object({
    name: z.string().min(2, { message: "Tên sản phẩm ít nhất 2 ký tự" }).max(100, { message: "Tên sản phẩm tối đa 100 ký tự" }),
    slug: z.string().min(2, { message: "Slug ít nhất 2 ký tự" }).max(100, { message: "Slug tối đa 100 ký tự" }),
    description: z.string().min(5, { message: "Mô tả ít nhất 5 ký tự" }).max(1000, { message: "Mô tả tối đa 1000 ký tự" }),
    categoryId: z.number().min(1, { message: "Vui lòng chọn danh mục" }),
    images: z.array(z.object({ url: z.url("URL ảnh không hợp lệ") })).min(1, { message: "Phải có ít nhất 1 ảnh." }),
    image_colors: z.record(
        z.string(),
        z.object({ // Value bây giờ là một object
            url: z.url("URL ảnh không hợp lệ") // Có thuộc tính 'url' là một URL
        })
    ).optional(),
    variants: z.array(
        z.object({
            price: z.coerce.number().min(0, { message: "Giá không hợp lệ." }),
            compare_at_price: z.coerce.number().min(0).optional(),
            quantity: z.coerce.number().int().min(0, { message: "Số lượng không hợp lệ." }),
            colorId: z.coerce.number({ message: "Vui lòng chọn màu." }),
            sizeId: z.coerce.number({ message: "Vui lòng chọn size." }),
        })
    ).min(1, { message: "Phải có ít nhất 1 biến thể." }),
});

type ProductFormInput = z.input<typeof productFormSchema>;
type ProductFormValues = z.infer<typeof productFormSchema>;

function toSlug(s: string) {
    return s
        .toLowerCase()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
}

export default function AddProductPage() {
    // --- thêm state để chọn màu đang active ---
    const [category, setCategory] = useState<Category[] | null>(null);
    const [size, setSize] = useState<Size[] | null>(null);
    const [color, setColor] = useState<Color[] | null>(null);
    const [activeColorId, setActiveColorId] = useState<number | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false); // --- THAY ĐỔI: State mới cho upload
    // Dùng input type cho TFieldValues và output type cho TTransformedValues để tránh mismatch
    const form = useForm<ProductFormInput, any, ProductFormValues>({
        resolver: zodResolver(productFormSchema),
        defaultValues: {
            name: "",
            slug: "",
            description: "",
            categoryId: 0,
            images: [],
            image_colors: {},          // ⬅️ thêm
            variants: [{ price: 0, compare_at_price: 0, quantity: 0, colorId: 0, sizeId: 0 }],
        },
        mode: "onSubmit",
    });

    // Field arrays
    const {
        fields: imageFields,
        append: appendImage,
        remove: removeImage,
    } = useFieldArray({
        control: form.control,
        name: "images",
    });

    const {
        fields: variantFields,
        append: appendVariant,
        remove: removeVariant,
    } = useFieldArray({
        control: form.control,
        name: "variants",
    });
    const fetchData = async () => {
        console.log("bị gọi")
        try {
            const [resCategory, resSize, resColor] = await Promise.all([getCategory(), getSizes(), getColors()]);
            setCategory(resCategory.data.data);
            setSize(Object.values(resSize.data));
            setColor(Object.values(resColor.data));
        } catch (error) {
            console.error("Lỗi khi fetch dữ liệu:", error);
        }
    };
    useEffect(() => {
        fetchData();
    }, [])

    const handleAutoSlug = () => {
        const name = form.getValues("name") || "";
        const s = toSlug(name);
        form.setValue("slug", s, { shouldValidate: true });
    };

    // Xử lý upload file
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
                    appendImage({ url });
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


    // Lấy các màu xuất hiện trong variants (unique)
    const variantsWatch = form.watch("variants");
    const uniqueColorIds = Array.from(
        new Set(
            (variantsWatch ?? [])
                .map((v) => Number(v?.colorId)) // ép sang số
                .filter((cid) => !Number.isNaN(cid) && cid > 0)
        )
    );

    console.log("uniqueColorIds", uniqueColorIds);
    // Map: id -> object màu (từ mockColors)
    const getColorById = (id: number) => color?.find(c => c.id === id);

    // Lấy URL ảnh hiện tại của màu (nếu có)
    const getColorImageUrl = (colorId: number) => {
        const data = form.getValues(`image_colors.${String(colorId)}` as const) as { url?: string } | undefined;
        return data?.url ?? "";
    };


    // Upload 1 ảnh cho màu
    const colorFileInputs = useRef<Record<number, HTMLInputElement | null>>({});
    const handlePickColorImage = (colorId: number) => {
        colorFileInputs.current[colorId]?.click();
    };

    const handleUploadColorImage = async (colorId: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files?.length) return;
        try {
            setIsUploading(true);
            const [url] = await uploadMultipleFilesApi([files[0]]);
            if (url) {
                form.setValue(`image_colors.${String(colorId)}.url` as any, url, { shouldValidate: true, shouldDirty: true });
            }
        } catch (err) {
            console.error(err);
            // toast.error("Upload ảnh màu thất bại")
        } finally {
            setIsUploading(false);
            e.target.value = "";
        }
    };

    const onSubmit = async (data: ProductFormValues) => {
        console.log("Submitting:", data);
        // Chuẩn hoá khóa về number cho image_colors
        const normalizedImageColors =
            data.image_colors
                ? Object.fromEntries(
                    Object.entries(data.image_colors).map(([k, v]) => [Number(k), v])
                )
                : undefined;

        const payload = { ...data, image_colors: normalizedImageColors };
        console.log(JSON.stringify(payload));
        setSubmitting(true);
        try {
            // --- TRY: Chạy code có khả năng gây lỗi ở đây ---
            const result = await createProduct(payload);

            // API thành công và trả về dữ liệu
            // Backend của bạn dường như trả về một object có cấu trúc { success: boolean, ... }
            console.log("API call successful:", result);
            if (result.statusCode === 201 || result.success) {
                toast.success("Tạo sản phẩm thành công");
                form.reset();
                setActiveColorId(null);
            } else {
                // Trường hợp backend vẫn trả về status 2xx nhưng có success: false
                toast.error(result.message || "Có lỗi xảy ra từ server.");
            }

        } catch (error: any) {
            // --- CATCH: Bắt lỗi nếu promise bị reject ---
            console.error("API call failed:", error);
            // Lấy message lỗi từ response của Axios
            const errorMessage = error.response?.data?.message || "Tạo sản phẩm thất bại";
            toast.error(errorMessage);

        } finally {
            // --- FINALLY: Luôn luôn chạy sau khi try hoặc catch kết thúc ---
            setSubmitting(false);
        }
    }





    return (
        <div className="">
            <h1 className="text-xl font-semibold mb-4">Thêm sản phẩm</h1>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="grid grid-cols-1 md:grid-cols-10 items-start ">
                        <div className="col-span-6 p-4 flex flex-col space-y-4 border rounded-xl mr-2">
                            <div>
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tên sản phẩm</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Nhập tên sản phẩm" {...field} />
                                            </FormControl>
                                            <div className="flex gap-2 mt-2">
                                                <Button type="button" onClick={handleAutoSlug} variant="secondary">
                                                    Tạo slug từ tên
                                                </Button>
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            {/* Slug */}
                            <div>
                                <FormField
                                    control={form.control}
                                    name="slug"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Slug</FormLabel>
                                            <FormControl>
                                                <Input placeholder="ao-thun-nam..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div>
                                {/* Mô tả */}
                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Mô tả</FormLabel>
                                            <FormControl>
                                                <Textarea rows={4} placeholder="Mô tả ngắn..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            {/* Danh mục */}
                            <FormField
                                control={form.control}
                                name="categoryId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Danh mục</FormLabel>
                                        <FormControl>
                                            <Select
                                                onValueChange={(v) =>
                                                    field.onChange(v === "none" ? undefined : Number(v))
                                                }
                                                value={field.value ? String(field.value) : "none"}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Chọn danh mục" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">— Không chọn —</SelectItem>
                                                    {category?.map((c) => (
                                                        <SelectItem key={c.id} value={String(c.id)}>
                                                            {c.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                        </div>

                        <div className="col-span-4 border p-4 rounded-lg">

                            <div>
                                <FormLabel>Hình ảnh</FormLabel>
                                <div className="mt-2 p-4 border-2 border-dashed rounded-lg">
                                    {/* Khu vực hiển thị các ảnh đã upload */}
                                    <div className="grid  md:grid-cols-4 gap-4 mb-4">
                                        {imageFields.map((img, idx) => (
                                            <div key={img.id} className="relative aspect-square group">
                                                <img
                                                    src={img.url}
                                                    alt={`Product image ${idx + 1}`}
                                                    className="object-cover w-full h-full rounded-md"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(idx)}
                                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    aria-label="Remove image"
                                                >
                                                    <X size={16} />
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

                                    {/* Hiển thị lỗi chung của trường images (ví dụ: "Phải có ít nhất 1 ảnh") */}
                                    <p className="mt-2 text-sm font-medium text-destructive">
                                        {form.formState.errors.images?.root?.message}
                                    </p>

                                </div>
                            </div>
                            {/* ========= ẢNH ĐẠI DIỆN THEO MÀU ========= */}
                            <div className="mt-6">
                                <FormLabel>Ảnh theo màu (hiển thị ở trang sản phẩm)</FormLabel>

                                {/* Hàng chấm màu */}
                                <div className="flex flex-wrap gap-3 mt-3">
                                    {uniqueColorIds.length === 0 && (
                                        <div className="text-sm text-muted-foreground">
                                            Chưa có biến thể nào ⇒ chưa có màu để cài ảnh.
                                        </div>
                                    )}

                                    {uniqueColorIds.map((cid) => {
                                        const c = getColorById(cid);
                                        const isActive = activeColorId === cid;
                                        return (
                                            <button
                                                key={cid}
                                                type="button"
                                                onClick={() => setActiveColorId(cid)}
                                                className={`relative w-9 h-9 rounded-full border transition
                      ${isActive ? "ring-2 ring-offset-2" : ""}`}
                                                aria-label={`Màu ${c?.name ?? cid}`}
                                                style={{ background: c?.code ?? "#e5e7eb" }}
                                                title={c?.name ?? String(cid)}
                                            >
                                                {/* viền trắng cho màu tối */}
                                                <span className="absolute inset-0 rounded-full border border-white/70 pointer-events-none" />
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Panel chi tiết ảnh của màu đang chọn */}
                                {activeColorId !== null && (
                                    <div className="mt-4 p-4 border rounded-xl">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="font-medium">
                                                Ảnh cho màu: {getColorById(activeColorId)?.name ?? activeColorId}
                                            </div>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => handlePickColorImage(activeColorId)}
                                                disabled={isUploading}
                                            >
                                                {isUploading ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang tải...
                                                    </>
                                                ) : (
                                                    "Chọn / thay ảnh"
                                                )}
                                            </Button>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            {/* Preview */}
                                            <div className="aspect-square rounded-lg border overflow-hidden flex items-center justify-center bg-muted">
                                                {getColorImageUrl(activeColorId) ? (
                                                    <img
                                                        src={getColorImageUrl(activeColorId)}
                                                        alt="Ảnh màu"
                                                        className="object-cover w-full h-full"

                                                    />
                                                ) : (
                                                    <span className="text-sm text-muted-foreground">
                                                        Chưa có ảnh cho màu này
                                                    </span>
                                                )}
                                            </div>

                                            {/* Info + xoá */}
                                            <div className="flex flex-col gap-3">
                                                {/* <Input
                                                    readOnly
                                                    value={getColorImageUrl(activeColorId)}
                                                    placeholder="URL ảnh sẽ hiển thị ở đây"
                                                /> */}
                                                <div className="flex gap-2">
                                                    <Button
                                                        type="button"
                                                        variant="secondary"
                                                        onClick={() => handlePickColorImage(activeColorId)}
                                                        disabled={isUploading}
                                                    >
                                                        Tải ảnh lên
                                                    </Button>
                                                    {getColorImageUrl(activeColorId) && (
                                                        <Button
                                                            type="button"
                                                            variant="destructive"
                                                            onClick={() =>
                                                                form.setValue(
                                                                    `image_colors.${String(activeColorId)}` as const,
                                                                    undefined as any,
                                                                    { shouldValidate: true, shouldDirty: true }
                                                                )
                                                            }
                                                        >
                                                            Xoá ảnh màu
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* input file ẩn cho từng màu */}
                                        <input
                                            ref={(el) => {
                                                if (activeColorId === null) return;
                                                colorFileInputs.current[activeColorId] = el;
                                            }}
                                            type="file"
                                            className="hidden"
                                            onChange={(e) => handleUploadColorImage(activeColorId, e)}
                                            accept="image/png, image/jpeg, image/gif, image/webp"
                                        />
                                    </div>
                                )}
                            </div>



                        </div>
                        <div className="col-span-10 my-6 border-t p-4">
                            <div>
                                <div className="font-medium mb-2">Biến thể</div>

                                {variantFields.map((v, idx) => (
                                    <div key={v.id} className="grid gap-3 md:grid-cols-6 mb-3">


                                        {/* Price */}
                                        <FormField
                                            control={form.control}
                                            name={`variants.${idx}.price`}

                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Giá</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            inputMode="decimal"
                                                            placeholder="0"
                                                            // đầu vào phải là number còn string là sai
                                                            value={
                                                                field.value === undefined || field.value === null
                                                                    ? ""
                                                                    : Number(field.value)
                                                            } // hiển thị rỗng khi undefined và ép kiểu tránh lỗi TS
                                                            onChange={(e) => field.onChange(e.target.value)} // để resolver zod coerce -> number
                                                            onBlur={field.onBlur}
                                                            name={field.name}
                                                            ref={field.ref}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Compare at price (optional) */}
                                        <FormField
                                            control={form.control}
                                            name={`variants.${idx}.compare_at_price`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Giá gốc (tuỳ chọn)</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            inputMode="decimal"
                                                            placeholder="0"
                                                            // ✅ chuẩn hoá value từ unknown -> string để hợp kiểu Input
                                                            value={
                                                                field.value === undefined || field.value === null
                                                                    ? ""
                                                                    : (Number(field.value))
                                                            } // hiển thị rỗng khi undefined và ép kiểu tránh lỗi TS
                                                            onChange={(e) => field.onChange(e.target.value)} // để resolver zod coerce -> number
                                                            onBlur={field.onBlur}
                                                            name={field.name}
                                                            ref={field.ref}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Quantity */}
                                        <FormField
                                            control={form.control}
                                            name={`variants.${idx}.quantity`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Tồn kho</FormLabel>
                                                    <FormControl>
                                                        <Input

                                                            type="number"
                                                            inputMode="decimal"
                                                            placeholder="0"
                                                            // ✅ chuẩn hoá value từ unknown -> string để hợp kiểu Input
                                                            value={
                                                                field.value === undefined || field.value === null
                                                                    ? ""
                                                                    : (field.value as number)
                                                            } // hiển thị rỗng khi undefined và ép kiểu tránh lỗi TS
                                                            onChange={(e) => field.onChange(e.target.value)} // để resolver zod coerce -> number
                                                            onBlur={field.onBlur}
                                                            name={field.name}
                                                            ref={field.ref}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Color */}
                                        <FormField
                                            control={form.control}
                                            name={`variants.${idx}.colorId`}
                                            render={({ field }) => {
                                                const selectedColor = color?.find(
                                                    (c) => c.id === field.value
                                                );

                                                return (
                                                    <FormItem>
                                                        <FormLabel>Màu</FormLabel>

                                                        <Select
                                                            value={field.value ? String(field.value) : ""}
                                                            onValueChange={(v) =>
                                                                field.onChange(v === "" ? undefined : Number(v))
                                                            }
                                                        >
                                                            <FormControl>
                                                                <SelectTrigger className="w-full">
                                                                    {selectedColor ? (
                                                                        <ColorOption
                                                                            name={selectedColor.name}
                                                                            code={selectedColor.code}
                                                                        />
                                                                    ) : (
                                                                        <SelectValue placeholder="Chọn màu" />
                                                                    )}
                                                                </SelectTrigger>
                                                            </FormControl>

                                                            <SelectContent>
                                                                {color?.map((c) => (
                                                                    <SelectItem key={c.id} value={String(c.id)}>
                                                                        <ColorOption name={c.name} code={c.code} />
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>

                                                        <FormMessage />
                                                    </FormItem>
                                                );
                                            }}
                                        />


                                        {/* Size */}
                                        <FormField
                                            control={form.control}
                                            name={`variants.${idx}.sizeId`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Size</FormLabel>
                                                    <FormControl>
                                                        <Select
                                                            onValueChange={(v) => field.onChange(v === "" ? undefined : Number(v))}
                                                            value={field.value ? String(field.value) : ""}
                                                        >
                                                            <SelectTrigger className="w-full">
                                                                <SelectValue placeholder="Chọn size" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {size?.map((s) => (
                                                                    <SelectItem key={s.id} value={String(s.id)}>
                                                                        {s.name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <div className="md:col-span-6">
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                onClick={() => removeVariant(idx)}
                                                disabled={variantFields.length === 1}
                                            >
                                                Xoá biến thể #{idx + 1}
                                            </Button>
                                        </div>
                                    </div>
                                ))}

                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() =>
                                        appendVariant({ price: 0, compare_at_price: 0, quantity: 0, colorId: 0, sizeId: 0 })
                                    }
                                >
                                    + Thêm biến thể
                                </Button>

                            </div>
                        </div>



                        <div className="flex gap-3 p-4">
                            <Button type="submit" disabled={submitting}>
                                {submitting ? "Đang lưu..." : "Lưu sản phẩm"}
                            </Button>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => form.reset()}
                                disabled={submitting}
                            >
                                Reset
                            </Button>
                            <AddSizeDialog onSuccess={fetchData}></AddSizeDialog>
                            <AddColorDialog onSuccess={fetchData}></AddColorDialog>
                        </div>
                    </div>

                </form>

            </Form>

        </div>
    );
}
