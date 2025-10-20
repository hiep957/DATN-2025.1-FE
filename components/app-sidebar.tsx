import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Calendar, Home, Inbox, Search, Settings } from "lucide-react"
import { NavUser } from "./nav-use"
import {
    IconCamera,
    IconChartBar,
    IconDashboard,
    IconDatabase,
    IconFileAi,
    IconFileDescription,
    IconFileWord,
    IconFolder,
    IconHelp,
    IconInnerShadowTop,
    IconListDetails,
    IconReport,
    IconSearch,
    IconSettings,
    IconUsers,
} from "@tabler/icons-react"
import { NavMain } from "./nav-main"
import { NavSecondary } from "./nav-secondary"
import { useRouter } from "next/navigation"
const navSecondary = [
    {
        title: "Settings",
        url: "#",
        icon: IconSettings,
    },
    {
        title: "Get Help",
        url: "#",
        icon: IconHelp,
    },
    
]
const navmain = [
    {
        title: "Home",
        url: "/admin",
        icon: IconDashboard,
    },
    {
        title: "Product",
        url: "/admin/product",
        icon: IconListDetails,
    },
    {
        title: "Order",
        url: "/admin/order",
        icon: IconChartBar,
    },
    {
        title: "User",
        url: "/admin/user",
        icon: IconFolder,
    },
    {
        title: "Team",
        url: "/admin/team",
        icon: IconUsers,
    },
]
// Menu items.
const items = [
    {
        title: "Home",
        url: "#",
        icon: Home,
    },
    {
        title: "Inbox",
        url: "#",
        icon: Inbox,
    },
    {
        title: "Calendar",
        url: "#",
        icon: Calendar,
    },
    {
        title: "Search",
        url: "#",
        icon: Search,
    },
    {
        title: "Settings",
        url: "#",
        icon: Settings,
    },
]
export function AppSidebar() {
    const router = useRouter()
    return (
        <Sidebar >
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            onClick={()=> router.push("/admin")}
                            asChild
                            className="data-[slot=sidebar-menu-button]:!p-1.5"
                        >
                            <span>
                                <IconInnerShadowTop className="!size-5" />
                                <span className="text-base font-semibold">Shop quần áo</span>
                            </span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={navmain} />
                <NavSecondary items={navSecondary} className="mt-auto" />
            </SidebarContent>
            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    )
}