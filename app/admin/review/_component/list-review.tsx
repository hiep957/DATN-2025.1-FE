"use client"
import { Review } from "@/app/(client)/[slug]/components/type"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { List, Star } from "lucide-react";
import { useState } from "react";
import { ReviewStatus } from "./review-status";
import { useUrlState } from "./toolbar";
import { Button } from "@/components/ui/button";



type Props = {
    reviews: Review[],
    page: number,
    totalPages: number,
    
}

export default function ListReview({ reviews, page, totalPages }: Props) {
    const [expandedReviews, setExpandedReviews] = useState<{ [key: number]: boolean }>({});
    const {set} = useUrlState();
    console.log("Reviews in ListReview:", reviews);
    const toggleExpand = (id: number) => {
        setExpandedReviews((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };
    function formatDateVN(iso: string) {
        const date = new Date(iso);
        return date
            .toLocaleString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                timeZone: "Asia/Ho_Chi_Minh",
            })
            .replace(", ", " - ");
    }


    return (
        <div className="space-y-2 mt-4 border-t py-4">
            {reviews.map((review) => {
                const isExpanded = expandedReviews[review.id] ?? false;
                const longComment = review.comment && review.comment.length > 150;

                return (
                    <div key={review.id} className="flex flex-col space-y-2 border-b pb-4">
                        {/* User */}
                        <div className="flex flex-row justify-between">
                            <div className="flex flex-row space-x-4">
                                <div className="h-12 w-12 flex items-center justify-center">
                                    <Avatar className="h-12 w-12">
                                        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                                        <AvatarFallback>CN</AvatarFallback>
                                    </Avatar>
                                </div>

                                <div className="flex flex-col justify-between">
                                    <p className="font-medium">{review.user.username}</p>
                                    <p className="text-muted-foreground text-sm">Đã mua sản phẩm </p>
                                </div>
                            </div>
                            <div className="ml-auto flex  ">
                                <ReviewStatus reviewId={review.id} initialStatus={review.status} />
                            </div>

                            <div>

                            </div>
                        </div>

                        {/* Rating */}
                        <div className="flex items-center">
                            {Array.from({ length: review.rating }).map((_, index) => (
                                <Star
                                    key={index}
                                    className="h-5 w-5 text-yellow-500 fill-yellow-500"
                                />
                            ))}
                        </div>

                        {/* Comment + xem thêm */}
                        <div className="text-sm md:text-base text-muted-foreground">
                            <p className={`${!isExpanded ? "line-clamp-2" : ""}`}>
                                {review.comment}
                            </p>

                            {/* Nút xem thêm */}
                            {longComment && (
                                <button
                                    onClick={() => toggleExpand(review.id)}
                                    className="text-blue-500 hover:underline mt-1 text-sm"
                                >
                                    {isExpanded ? "Thu gọn" : "Xem thêm"}
                                </button>
                            )}
                        </div>

                        {/* Image area */}
                        <div>
                            {review.image_urls && review.image_urls.length > 0 && (
                                <div className="mt-2 flex space-x-2 overflow-x-auto">
                                    {review.image_urls.map((url, idx) => (
                                        <img key={idx} src={url} alt={`Review image ${idx + 1}`} className="h-20 w-20 object-cover rounded" />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Date */}
                        <div className="text-sm text-muted-foreground">
                            {formatDateVN(review.createdAt)}
                        </div>
                    </div>
                );
            })}
            <div className="flex items-center justify-between mt-4 p-2">
                <div className="text-sm text-muted-foreground">Trang {page} / {totalPages}</div>
                <div className="flex gap-2">
                    <Button variant="outline" disabled={page <= 1} onClick={() => set({ page: Math.max(page - 1, 1) })}>Trước</Button>
                    <Button variant="default" disabled={page >= totalPages} onClick={() => set({ page: page + 1 })}>Sau</Button>
                </div>
            </div>
        </div>
    )
}