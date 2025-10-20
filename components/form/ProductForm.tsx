import { Product } from "@/lib/types/create-product";
import { uploadMultipleFilesApi } from "@/lib/upload-image/upload";
import { useEffect, useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import z from "zod";

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
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { updateProduct } from "@/lib/api/auth";
// --- DỮ LIỆU GIẢ (MOCK DATA) ---
// Trong thực tế, bạn sẽ fetch dữ liệu này từ API
const mockCategories = [{ id: 3, name: "Áo thun nam" }, { id: 8, name: "Quần short" }, { id: 10, name: "Áo Polo" }, { id: 6, name: "Áo Vest và Blazer" }, { id: 9, name: "Váy nữ" }];
const mockBrands = [{ id: 5, name: "Adidas" }, { id: 6, name: "Davies" }];
const mockColors = [{ id: 1, name: "Trắng", value: "#FFFFFF" }, { id: 2, name: "Đen", value: "#000000" }];
const mockSizes = [{ id: 1, name: "S" }, { id: 2, name: "M" }];

// --- SCHEMA VALIDATION (ZOD) ---
const variantSchema = z.object({
    id: z.number().optional(), // ID của biến thể đã tồn tại để update
    sku: z.string().min(3, { message: "SKU phải có ít nhất 3 ký tự." }),
    price: z.coerce.number().min(0, { message: "Giá không hợp lệ." }),
    compare_at_price: z.coerce.number().min(0).optional().nullable(),
    quantity: z.coerce.number().int().min(0, { message: "Số lượng không hợp lệ." }),
    colorId: z.coerce.number({ message: "Vui lòng chọn màu." }),
    sizeId: z.coerce.number({ message: "Vui lòng chọn size." }),
});

const imageSchema = z.object({
    id: z.number().optional(), // ID của ảnh đã tồn tại để update
    url: z.url("URL ảnh không hợp lệ"),
});

const productFormSchema = z.object({
    name: z.string().min(2, { message: "Tên sản phẩm ít nhất 2 ký tự" }).max(100),
    slug: z.string().min(2, { message: "Slug ít nhất 2 ký tự" }).max(100),
    description: z.string().optional(),
    categoryId: z.coerce.number({ message: "Vui lòng chọn danh mục." }),
    brandId: z.coerce.number().optional(),
    specs: z.string().optional().refine((val) => {
        if (!val) return true;
        try { JSON.parse(val); return true; } catch { return false; }
    }, { message: "Specs phải là một chuỗi JSON hợp lệ." }),
    images: z.array(imageSchema).min(1, { message: "Phải có ít nhất 1 ảnh." }),
    image_colors: z.record(z.string(), z.object({ url: z.url() })).optional(),
    variants: z.array(variantSchema).min(1, { message: "Phải có ít nhất 1 biến thể." }),
});

// Types suy luận từ Zod
type ProductFormInput = z.input<typeof productFormSchema>;
type ProductFormValues = z.infer<typeof productFormSchema>;

export default function ProductForm({ initialData, productId }: { initialData?: Product, productId: string }) {

    const [activeColorId, setActiveColorId] = useState<number | null>(null);
    // Xác định chế độ hoạt động
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const [imagesToDelete, setImagesToDelete] = useState<number[]>([]);
    const [variantsToDelete, setVariantsToDelete] = useState<number[]>([]);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const form = useForm<ProductFormInput, any, ProductFormValues>({
        // defaultValues bây giờ chỉ cần cho trường hợp TẠO MỚI
        defaultValues: {
            name: "",
            slug: "",
            description: "",
            categoryId: 0,
            brandId: undefined,
            specs: undefined,
            images: [],
            image_colors: {},          // ⬅️ thêm
            variants: [{ sku: "", price: 0, compare_at_price: 0, quantity: 0, colorId: 0, sizeId: 0 }],
        },
        mode: "onSubmit",
    });
    useEffect(() => {
        if (initialData) {
            // 1. Biến đổi dữ liệu từ Product -> ProductFormInput
            const formValues = mapProductToFormInput(initialData);

            // 2. Dùng form.reset() để điền dữ liệu đã biến đổi vào form
            form.reset(formValues);
            console.log("Form watch:", form.watch());
        }
    }, [initialData, form]); // Thêm dependencies cho useEffect
    const { fields: imageFields, append: appendImage, remove: removeImage } = useFieldArray({
        control: form.control, name: "images"
    });
    const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({
        control: form.control, name: "variants"
    });

    // Xử lý xóa ảnh/biến thể đã có từ DB
    const handleRemoveImage = (index: number) => {
        const images = form.getValues('images');
        const image = images[index];

        if (image?.id) {
            setImagesToDelete(prev => [...prev, image.id!]);
        }
        removeImage(index);
    };

    const handleRemoveVariant = (index: number) => {
        const variants = form.getValues('variants');
        const variant = variants[index];
        console.log("Real variant data:", variant); // ID thực từ database
        console.log("FieldArray variant:", variantFields[index]); // ID nội bộ của useFieldArray
        if (variant?.id) {
            setVariantsToDelete(prev => [...prev, variant.id!]);
        }
        removeVariant(index);
    };


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
    const getColorById = (id: number) => mockColors.find(c => c.id === id);

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
        setIsSubmitting(true);

        // Chuẩn bị payload
        const transformedData = {
            ...data,
            // Transform specs từ string JSON về lại object
            specs: data.specs ? JSON.parse(data.specs) : undefined
        };

        const finalPayload: any = { ...transformedData };

        // Thêm các items cần xóa vào payload
        finalPayload.images = [
            ...(transformedData.images || []),
            ...imagesToDelete.map(id => ({ id, _destroy: true }))
        ];
        finalPayload.variants = [
            ...(transformedData.variants || []),
            ...variantsToDelete.map(id => ({ id, _destroy: true }))
        ];

        console.log("Variants to delete:", variantsToDelete);
        // Chuẩn hoá khóa về number cho image_colors
        const normalizedImageColors =
            data.image_colors
                ? Object.fromEntries(
                    Object.entries(data.image_colors).map(([k, v]) => [Number(k), v])
                )
                : undefined;
        finalPayload.image_colors = normalizedImageColors;
        try {
            // Gọi API update
            console.log("Vào hàm submit:");
            const result = await updateProduct(productId, finalPayload);
            console.log("Payload to be sent:", JSON.stringify(finalPayload));
            toast.success("Cập nhật sản phẩm thành công!");
            // Tùy chọn: có thể redirect hoặc fetch lại dữ liệu mới
            // router.push("/admin/products");

        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Cập nhật sản phẩm thất bại.";
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
        console.log("Form submitted with data:", data);

    }
    return (
        <div className="p-4">
            <h1 className="text-xl font-semibold mb-4">Chỉnh sửa sản phẩm</h1>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-10 ">
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
                                            {/* <div className="flex gap-2 mt-2">
                                                <Button type="button" onClick={handleAutoSlug} variant="secondary">
                                                    Tạo slug từ tên
                                                </Button>
                                            </div> */}
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
                                                    {mockCategories.map((c) => (
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

                            {/* Thương hiệu (optional) */}
                            <FormField
                                control={form.control}
                                name="brandId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Thương hiệu (tuỳ chọn)</FormLabel>
                                        <FormControl>
                                            <Select
                                                onValueChange={(v) =>
                                                    field.onChange(v === "none" ? undefined : Number(v))
                                                }
                                                value={field.value ? String(field.value) : "none"}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Chọn thương hiệu" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">— Không chọn —</SelectItem>
                                                    {mockBrands.map((b) => (
                                                        <SelectItem key={b.id} value={String(b.id)}>
                                                            {b.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {/* Specs (JSON string, sẽ transform -> object) */}
                            <FormField
                                control={form.control}
                                name="specs"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Specs (JSON)</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                rows={5}
                                                placeholder={`Ví dụ: {"material":"cotton","fit":"regular","care":["machine-wash","do-not-bleach"]}`}
                                                {...field}
                                            />
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
                                                    onClick={() => handleRemoveImage(idx)}
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
                                                style={{ background: c?.value ?? "#e5e7eb" }}
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
                                                <Input
                                                    readOnly
                                                    value={getColorImageUrl(activeColorId)}
                                                    placeholder="URL ảnh sẽ hiển thị ở đây"
                                                />
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
                                        {/* SKU */}
                                        <FormField
                                            control={form.control}
                                            name={`variants.${idx}.sku`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>SKU</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="VD: TS-TRANG-S" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

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
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Màu</FormLabel>
                                                    <FormControl>
                                                        <Select
                                                            onValueChange={(v) => field.onChange(v === "" ? undefined : Number(v))}
                                                            value={field.value ? String(field.value) : ""}
                                                        >
                                                            <SelectTrigger className="w-full">
                                                                <SelectValue placeholder="Chọn màu" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {mockColors.map((c) => (
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
                                                                {mockSizes.map((s) => (
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
                                                onClick={() => handleRemoveVariant(idx)}
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
                                        appendVariant({ sku: "", price: 0, compare_at_price: 0, quantity: 0, colorId: 0, sizeId: 0 })
                                    }
                                >
                                    + Thêm biến thể
                                </Button>
                            </div>
                        </div>



                        <div className="flex gap-3 p-4">
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Đang lưu..." : "Lưu sản phẩm"}
                            </Button>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => form.reset()}
                                disabled={isSubmitting}
                            >
                                Reset
                            </Button>
                        </div>
                    </div>
                </form>
            </Form>
        </div>
    )
}


// Bạn có thể đặt hàm này trong cùng file component hoặc một file utils riêng
// Chú ý: kiểu trả về là ProductFormInput, là kiểu dữ liệu đầu vào của form
function mapProductToFormInput(product: Product): ProductFormInput {
    return {
        // --- Các trường giống nhau ---
        name: product.name,
        slug: product.slug,
        description: product.description || "",
        images: product.images, // Mảng images đã có { id, url }, tương thích với schema

        // --- Biến đổi các trường khác nhau ---

        // 1. Chuyển từ object lồng nhau thành ID
        categoryId: product.category.id,
        brandId: product.brand?.id, // Dùng optional chaining vì brand có thể không có

        // 2. Chuyển specs từ object về lại chuỗi JSON cho textarea
        specs: product.specs ? JSON.stringify(product.specs, null, 2) : "",

        // 3. Biến đổi image_colors nếu cần (thường là key đã là string sẵn)
        image_colors: product.image_colors ? Object.fromEntries(
            Object.entries(product.image_colors).map(([key, value]) => [String(key), value])
        ) : {},

        // 4. "Làm phẳng" mảng variants
        variants: product.variants.map(variant => ({
            id: variant.id,
            sku: variant.sku,
            price: variant.price,
            compare_at_price: variant.compare_at_price,
            quantity: variant.quantity,
            // Chuyển từ object lồng nhau thành ID
            colorId: variant.color.id,
            sizeId: variant.size.id,
        })),
    };
}