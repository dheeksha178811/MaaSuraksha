import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { MobileDrawer } from '@/components/layout/MobileDrawer';
import { MaaSurakshaAssistant } from '@/components/assistant';
import { useSidebar } from '@/hooks/useSidebar';
import { useMockAuth } from '@/hooks/useMockAuth';
import { useSidebarBadges } from '@/hooks/useSidebarBadges';

export const AppLayout: React.FC = () => {
  const { isCollapsed, toggleCollapse, isMobileOpen, openMobile, closeMobile } = useSidebar();
  const { role, loginAsRole } = useMockAuth();
  // Computed once here and passed to both nav renderers below, so Sidebar
  // and MobileDrawer (both always mounted, just CSS-hidden at different
  // breakpoints) never each fetch independently.
  const badges = useSidebarBadges(role);

  return (
    <div className="min-h-screen bg-warm-ivory flex">
      {/* Desktop Collapsible Sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleCollapse}
        badges={badges}
      />

      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={isMobileOpen}
        onClose={closeMobile}
        badges={badges}
      />

      {/* Main App Container */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        {/* Top Header */}
        <Header
          onOpenMobileMenu={openMobile}
          currentRole={role}
          onSwitchRole={loginAsRole}
        />

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Global MaaSuraksha Assistant */}
      <MaaSurakshaAssistant />
    </div>
  );
};
