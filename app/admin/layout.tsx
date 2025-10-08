'use client'
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { useAuthStore } from '@/store/useAuthStore'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { AppSidebar } from "@/components/app-sidebar"
import RoleGuard from "@/components/auth/RoleGuard"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
 
  return (
    <RoleGuard allowedRoles={['ADMIN']}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="sticky top-0 flex h-14 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger />
            <h1 className="font-semibold">Dashboard</h1>
          </header>
          <main className="flex flex-1 flex-col gap-4 p-4">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </RoleGuard>
  )
}
