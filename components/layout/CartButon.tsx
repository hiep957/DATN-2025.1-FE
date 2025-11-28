import { ShoppingCart } from "lucide-react";

type CartButtonProps = {
  count?: number;                 // số lượng items (có thể undefined = 0)
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
};

export default function CartButton({ count = 0, onClick, size = "md" }: CartButtonProps) {
  const clSize =
    size === "sm" ? "h-9 w-9" :
    size === "lg" ? "h-12 w-12" : "h-10 w-10";

  const iconSize =
    size === "sm" ? 18 :
    size === "lg" ? 26 : 22;

  const display = count > 99 ? "99+" : String(count);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Mở giỏ hàng${count ? `, ${display} sản phẩm` : ""}`}
      className={[
        "relative inline-flex items-center justify-center",
        clSize,
        "rounded-full ",
        " hover:bg-neutral-50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
        "transition-colors"
      ].join(" ")}
    >
      <ShoppingCart aria-hidden size={iconSize} className="text-neutral-700" />

      {/* Badge số lượng */}
      {count > 0 && (
        <span
          className={[
            "absolute -top-1 -right-1",
            "min-w-5 h-5 px-1",
            "rounded-full bg-rose-600 text-white",
            "text-[10px] leading-5 font-semibold",
            "flex items-center justify-center",
            "ring-2 ring-white",                 // viền trắng chống dính nền
            "animate-in fade-in zoom-in-50"      // (tuỳ Tailwind config hỗ trợ)
          ].join(" ")}
        >
          {display}
        </span>
      )}
    </button>
  );
}
