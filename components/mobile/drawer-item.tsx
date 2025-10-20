import { ChevronRight } from "lucide-react"

// Item chung cho menu trong drawer
export const DrawerItem = ({
    icon: Icon,
    label,
    onClick,
    trailing,
}: {
    icon: React.ElementType
    label: string
    onClick?: () => void
    trailing?: React.ReactNode
}) => (
    <button
        onClick={onClick}
        className="w-full flex items-center justify-between rounded-xl px-3 py-3 hover:bg-muted transition"
        aria-label={label}
    >
        <span className="flex items-center gap-3">
            <Icon className="size-5" aria-hidden="true" />
            <span className="text-sm font-medium">{label}</span>
        </span>
        {trailing ?? <ChevronRight className="size-4 opacity-60" aria-hidden="true" />}
    </button>
)