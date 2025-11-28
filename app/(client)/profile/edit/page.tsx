"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { updateUserProfile } from "@/lib/api/auth";
import { uploadMultipleFilesApi, uploadSingleFileApi } from "@/lib/upload-image/upload";
import { cn } from "@/lib/utils";
import { useAuthStore, User } from "@/store/useAuthStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

// 1. Import Zod và resolver
import { set, z } from "zod";

// 2. Định nghĩa Zod Schema
const profileSchema = z.object({
    id: z.number(),// Giữ lại ID nhưng không bắt buộc
    username: z.string().min(2, { message: "Họ tên phải có ít nhất 2 ký tự." }),
    email: z.string().email({ message: "Email không hợp lệ." }),

    // .optional().or(z.literal('')) cho phép giá trị là undefined, null, hoặc chuỗi rỗng
    phoneNumber: z.string()
        .regex(/^(0\d{9})$/, { message: "SĐT phải là 10 số, bắt đầu bằng 0." })
        .optional()
        .or(z.literal('')),

    address: z.string().optional().or(z.literal('')),

    // Input 'date' trả về string 'YYYY-MM-DD' hoặc ''
    birthday: z.string().optional().or(z.literal('')),

    gender: z.string()
        .optional()
        .or(z.literal('')),

    occupation: z.string().optional().or(z.literal('')),

    // Các trường khác từ 'User' interface để giữ cấu trúc
    avatar: z.string().optional().or(z.literal('')),
    roles: z.array(z.string()).optional()
});

// 3. Tạo Type từ Schema
type ProfileFormData = z.infer<typeof profileSchema>;


// Hàm helper để định dạng ngày cho input type="date"
const formatDateForInput = (dateString?: string) => {
    if (!dateString) return "";
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "";
        return date.toISOString().split("T")[0]; // Lấy phần YYYY-MM-DD
    } catch (error) {
        return "";
    }
};

export default function EditProfile() {
    const user = useAuthStore((state) => state.user);
    const updateUser = useAuthStore((state) => state.updateUser);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    // 4. Cập nhật useForm
    const form = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            ...user,
            // Đảm bảo các giá trị control là chuỗi rỗng thay vì undefined
            username: user?.username ?? '',
            email: user?.email ?? '',
            phoneNumber: user?.phoneNumber ?? '',
            address: user?.address ?? '',
            birthday: formatDateForInput(user?.birthday),
            gender: user?.gender ?? '',
            occupation: user?.occupation ?? '',
            avatar: user?.avatar ?? '',
        },
        mode: "onChange", // Validate ngay khi người dùng thay đổi
    });

    // 5. Cập nhật useEffect
    useEffect(() => {
        if (user) {
            form.reset({
                ...user,
                username: user.username ?? '',
                email: user.email ?? '',
                phoneNumber: user.phoneNumber ?? '',
                address: user.address ?? '',
                birthday: formatDateForInput(user.birthday),
                gender: user.gender ?? '',
                occupation: user.occupation ?? '',
                avatar: user.avatar ?? '',
            });
            setPreviewImage(user.avatar || null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const handleImageAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setLoading(true);
            // Giả sử bạn có một hàm uploadImage để tải ảnh lên server và trả về URL
            const imageUrl = await uploadSingleFileApi(file);
            setLoading(false);
            setPreviewImage(imageUrl);
        }
    }

    // Hàm onSubmit giờ sẽ nhận data đã được Zod validate
    const onSubmit = async (data: ProfileFormData) => {
        console.log("Cập nhật thông tin người dùng (đã validate):", data);
        // Gọi API cập nhật thông tin người dùng ở đây
        data.avatar = previewImage || "";
        const response = await updateUserProfile(data);
        console.log("Phản hồi từ API cập nhật:", response);
        if (response.statusCode === 200) {
            toast.success(response.message || "Cập nhật thông tin thành công");
            updateUser(data);
        } else {
            toast.error(response.message || "Cập nhật thông tin thất bại");
            // Cập nhật thông tin người dùng trong store nếu cần
        }
    };

    return (
        <Card className="shadow-lg ">
            <CardHeader className="pb-0">
                <CardTitle className="text-xl md:text-2xl">Thông tin cá nhân</CardTitle>
            </CardHeader>

            <CardContent className="pt-4">


                <Form {...form}>
                    <div className="w-full flex items-center justify-center mb-6">
                        {loading
                            ?

                            (
                                <div className=" w-28 h-28  md:h-32 md:w-32 rounded-full border-2 border-border flex items-center justify-center">
                                    <Loader2 className="animate-spin " />
                                </div>
                            )
                            :
                            (
                                <img
                                    src={previewImage || "/placeholder-avatar.png"}
                                    alt="Avatar"
                                    className="h-28 w-28 md:h-32 md:w-32 rounded-full object-cover ring-2 ring-border relative"
                                />
                            )}
                      

                        <Input
                            type="file"
                            accept="image/*"
                            onChange={handleImageAvatar}
                            className="absolute w-28 h-28  md:h-32 md:w-32 rounded-full opacity-0 cursor-pointer"
                        />
                       
                    </div>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="flex flex-col gap-6"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 md:gap-6 gap-4">
                            <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Họ và tên</FormLabel>
                                        <FormControl>
                                            <Input {...field} value={field.value ?? ""} />
                                        </FormControl>
                                        <FormMessage /> {/* Zod message sẽ hiện ở đây */}
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                disabled
                                                type="email"
                                                {...field}
                                                value={field.value ?? ""}
                                                placeholder="Chưa có email"
                                            />
                                        </FormControl>
                                        <FormMessage /> {/* Zod message sẽ hiện ở đây */}
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="phoneNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Số điện thoại</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                value={field.value ?? ""}
                                                placeholder="Chưa có số điện thoại"
                                            />
                                        </FormControl>
                                        <FormMessage /> {/* Zod message sẽ hiện ở đây */}
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="birthday"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Ngày sinh</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="date"
                                                {...field}
                                                value={field.value ?? ""}
                                            />
                                        </FormControl>
                                        <FormMessage /> {/* Zod message sẽ hiện ở đây */}
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="address"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Địa chỉ</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                {...field}
                                                value={field.value ?? ""}
                                                placeholder="Chưa có địa chỉ"
                                            />
                                        </FormControl>
                                        <FormMessage /> {/* Zod message sẽ hiện ở đây */}
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="gender"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Giới tính</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value ?? ""}

                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Chọn giới tính" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Nam">Nam</SelectItem>
                                                <SelectItem value="Nữ">Nữ</SelectItem>
                                                <SelectItem value="Khác">Khác</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage /> {/* Zod message sẽ hiện ở đây */}
                                    </FormItem>
                                )}
                            ></FormField>


                            <FormField
                                control={form.control}
                                name="occupation"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nghề nghiệp</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                {...field}
                                                value={field.value ?? ""}
                                                placeholder="Chưa có nghề nghiệp"
                                            />
                                        </FormControl>
                                        <FormMessage /> {/* Zod message sẽ hiện ở đây */}
                                    </FormItem>
                                )}
                            />
                        </div>

                        <Button className="mt-2 w-full md:w-auto md:self-end" type="submit">
                            Lưu thay đổi
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}

// Interface User (giữ nguyên)
// export interface User {
//   id: number
//   username: string
//   email: string
//   address?: string
//   phoneNumber?: string
//   birthday?: string
//   gender?: string
//   occupation?: string
//   avatar?: string
//   roles?: string[]
// }

//<FormField
//     control={form.control}
//     name="gender"
//     render={({ field }) => (
//       <FormItem>
//         <FormLabel>Giới tính</FormLabel>
//         <Select
//           onValueChange={field.onChange}
//           value={field.value ?? ""}
//         >
//           <FormControl>
//             <SelectTrigger>
//               <SelectValue placeholder="Chọn giới tính" />
//             </SelectTrigger>
//           </FormControl>
//           <SelectContent>
//             <SelectItem value="male">Nam</SelectItem>
//             <SelectItem value="female">Nữ</SelectItem>
//             <SelectItem value="other">Khác</SelectItem>
//           </SelectContent>
//         </Select>
//         <FormMessage /> {/* Zod message sẽ hiện ở đây */}
//       </FormItem>
//     )}
//   ></FormField>