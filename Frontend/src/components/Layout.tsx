import { ReactNode } from 'react';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from './app-sidebar';
import { ModeToggle } from '@/components/ui/mode-toggle';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-sidebar-border px-6 bg-sidebar/50 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            {/* Optional: Add breadcrumbs or page title here */}
          </div>
          <ModeToggle />
        </header>
        <main className="flex-1 p-8 lg:p-12">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Layout;