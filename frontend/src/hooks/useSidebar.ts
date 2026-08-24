import { useState, useEffect } from 'react';

export function useSidebar() {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('maasuraksha_sidebar_collapsed');
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem('maasuraksha_sidebar_collapsed', JSON.stringify(isCollapsed));
    } catch {
      // Ignore storage errors
    }
  }, [isCollapsed]);

  const toggleCollapse = () => setIsCollapsed(prev => !prev);
  const openMobile = () => setIsMobileOpen(true);
  const closeMobile = () => setIsMobileOpen(false);
  const toggleMobile = () => setIsMobileOpen(prev => !prev);

  return {
    isCollapsed,
    setIsCollapsed,
    toggleCollapse,
    isMobileOpen,
    openMobile,
    closeMobile,
    toggleMobile,
  };
}
