import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { PublicLayout } from '@/layouts/PublicLayout';
import { AppLayout } from '@/layouts/AppLayout';
import { LandingPage } from '@/pages/landing/LandingPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { MotherDashboardPreview } from '@/pages/dashboard/MotherDashboardPreview';
import { PregnancyPage } from '@/pages/pregnancy/PregnancyPage';
import { DoctorDashboardPlaceholder } from '@/pages/dashboard/DoctorDashboardPlaceholder';
import { HospitalDashboardPlaceholder } from '@/pages/dashboard/HospitalDashboardPlaceholder';
import { AdminDashboardPlaceholder } from '@/pages/dashboard/AdminDashboardPlaceholder';
import { PlaceholderPage } from '@/pages/common/PlaceholderPage';
import { NotFoundPage } from '@/pages/common/NotFoundPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth/login" element={<LoginPage />} />
      </Route>

      {/* Main Care Shell / Protected Style Routes */}
      <Route element={<AppLayout />}>
        {/* Mother Space Routes */}
        <Route path="/mother/dashboard" element={<MotherDashboardPreview />} />
        <Route path="/mother/pregnancy" element={<PregnancyPage />} />
        <Route path="/mother/profile" element={<PlaceholderPage />} />
        <Route path="/mother/child" element={<PlaceholderPage />} />
        <Route path="/mother/timeline" element={<PlaceholderPage />} />
        <Route path="/mother/vaccinations" element={<PlaceholderPage />} />
        <Route path="/mother/schedule" element={<PlaceholderPage />} />
        <Route path="/mother/appointments" element={<PlaceholderPage />} />
        <Route path="/mother/messages" element={<PlaceholderPage />} />
        <Route path="/mother/nutrition" element={<PlaceholderPage />} />
        <Route path="/mother/schemes" element={<PlaceholderPage />} />
        <Route path="/mother/documents" element={<PlaceholderPage />} />
        <Route path="/mother/doctor" element={<PlaceholderPage />} />
        <Route path="/mother/settings" element={<PlaceholderPage />} />
        <Route path="/mother/medications" element={<PlaceholderPage />} />
        <Route path="/mother/growth" element={<PlaceholderPage />} />
        <Route path="/mother/hospital" element={<PlaceholderPage />} />
        <Route path="/mother/notifications" element={<PlaceholderPage />} />
        <Route path="/mother/qr" element={<PlaceholderPage />} />

        {/* Doctor Space Routes */}
        <Route path="/doctor/dashboard" element={<DoctorDashboardPlaceholder />} />

        {/* Hospital Space Routes */}
        <Route path="/hospital/dashboard" element={<HospitalDashboardPlaceholder />} />

        {/* Admin Space Routes */}
        <Route path="/admin/dashboard" element={<AdminDashboardPlaceholder />} />
      </Route>

      {/* Catch-all Not Found Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
