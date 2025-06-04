'use client';

import { SidebarProvider } from "@/components/sidebar-provider"
import { MainSidebar } from "@/components/main-sidebar"
import { Toaster } from '@/components/ui/toaster';
import type { ReactNode } from 'react';

export default function AuthenticatedLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <MainSidebar />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
      <Toaster />
    </SidebarProvider>
  );
}