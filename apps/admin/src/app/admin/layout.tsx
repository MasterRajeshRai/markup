'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import { SearchModalProvider } from '@/components/search-modal';
import { SidebarProvider } from '@/components/sidebar-context';
import { ModulesProvider } from '@/components/modules-context';
import { AuthProvider, useAuth, ROUTE_PERMISSION_MAP } from '@/components/auth-context';
import { AccessRestricted } from '@/components/access-restricted';

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isLoading, canAccessRoute } = useAuth();

  const isPermitted = canAccessRoute(pathname);

  // Find required permission if not permitted
  const cleanPath = pathname.split('?')[0];
  const matchingKey = Object.keys(ROUTE_PERMISSION_MAP)
    .filter((k) => cleanPath === k || cleanPath.startsWith(`${k}/`))
    .sort((a, b) => b.length - a.length)[0];
  const requiredPermission = matchingKey ? ROUTE_PERMISSION_MAP[matchingKey] : undefined;

  return (
    <div className="admin-root flex min-h-screen bg-background text-[15px] text-foreground w-full max-w-full overflow-x-clip" suppressHydrationWarning>
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 w-full max-w-full overflow-x-clip">
        <Header />
        <main className="admin-main flex-1 p-3 sm:p-5 md:p-6 w-full max-w-[1750px] mx-auto text-[15px]">
          {!isLoading && !isPermitted && cleanPath !== '/admin' ? (
            <AccessRestricted pathname={pathname} requiredPermission={requiredPermission} />
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <SidebarProvider>
        <ModulesProvider>
          <SearchModalProvider>
            <AdminLayoutContent>{children}</AdminLayoutContent>
          </SearchModalProvider>
        </ModulesProvider>
      </SidebarProvider>
    </AuthProvider>
  );
}
