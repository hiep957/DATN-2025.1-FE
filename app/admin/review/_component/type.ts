export const reviewStatuses = [
  {
    value: "pending",
    label_vi: "Chờ duyệt",
    label_en: "Pending",
    color: "#f59e0b", // vàng
  },
  {
    value: "approved", // hoặc "confirmed"
    label_vi: "Đã duyệt",
    label_en: "Approved",
    color: "#10b981", // xanh lá
  },
  {
    value: "hidden",
    label_vi: "Ẩn",
    label_en: "Hidden",
    color: "#6b7280", // xám
  },
  {
    value: "rejected",
    label_vi: "Từ chối",
    label_en: "Rejected",
    color: "#ef4444", // đỏ
  },
];




export const ratingFilters = [
  {
    value: "5",
    label_vi: "5 sao",
    label_en: "5 stars",
    color: "#10b981", // xanh lá
  },
  {
    value: "4",
    label_vi: "4 sao",
    label_en: "4 stars",
    color: "#22c55e",
  },
  {
    value: "3",
    label_vi: "3 sao",
    label_en: "3 stars",
    color: "#eab308", // vàng
  },
  {
    value: "2",
    label_vi: "2 sao",
    label_en: "2 stars",
    color: "#f97316", // cam
  },
  {
    value: "1",
    label_vi: "1 sao",
    label_en: "1 star",
    color: "#ef4444", // đỏ
  },
];


export const sortOptions = [
    { value: "rating", label: "Đánh giá" },
    { value: "createdAt", label: "Thời gian tạo" },
    { value: "updatedAt", label: "Thời gian chỉnh sửa" },
]
