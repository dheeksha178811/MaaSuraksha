import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { PublicLayout } from '@/layouts/PublicLayout';
import { AppLayout } from '@/layouts/AppLayout';
import { LandingPage } from '@/pages/landing/LandingPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { MotherDashboardPreview } from '@/pages/dashboard/MotherDashboardPreview';
import { PregnancyPage } from '@/pages/pregnancy/PregnancyPage';
import { ReportsPage } from '@/pages/reports/ReportsPage';
import { DoctorHospitalUploadFoundation } from '@/pages/reports/DoctorHospitalUploadFoundation';
import { HospitalDashboardPlaceholder } from '@/pages/dashboard/HospitalDashboardPlaceholder';
import { AdminDashboardPlaceholder } from '@/pages/dashboard/AdminDashboardPlaceholder';
import { PlaceholderPage } from '@/pages/common/PlaceholderPage';
import { NotFoundPage } from '@/pages/common/NotFoundPage';
import { DoctorDashboardPage } from '@/pages/doctor/DoctorDashboardPage';
import { MyPatientsPage } from '@/pages/doctor/MyPatientsPage';
import { PatientCareWorkspacePage } from '@/pages/doctor/PatientCareWorkspacePage';
import { DoctorAppointmentsPage } from '@/pages/doctor/DoctorAppointmentsPage';
import { DoctorReportsPage } from '@/pages/doctor/DoctorReportsPage';
import { DoctorCarePlansPage } from '@/pages/doctor/DoctorCarePlansPage';
import { DoctorHospitalPage } from '@/pages/doctor/DoctorHospitalPage';
import { DoctorProfilePage } from '@/pages/doctor/DoctorProfilePage';
import { DoctorPlaceholderPage } from '@/pages/doctor/DoctorPlaceholderPage';

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
        <Route path="/mother/reports" element={<ReportsPage />} />
        <Route path="/mother/documents" element={<ReportsPage />} />
        <Route path="/mother/profile" element={<PlaceholderPage />} />
        <Route path="/mother/child" element={<PlaceholderPage />} />
        <Route path="/mother/timeline" element={<PlaceholderPage />} />
        <Route path="/mother/vaccinations" element={<PlaceholderPage />} />
        <Route path="/mother/schedule" element={<PlaceholderPage />} />
        <Route path="/mother/appointments" element={<PlaceholderPage />} />
        <Route path="/mother/messages" element={<PlaceholderPage />} />
        <Route path="/mother/nutrition" element={<PlaceholderPage />} />
        <Route path="/mother/schemes" element={<PlaceholderPage />} />
        <Route path="/mother/doctor" element={<PlaceholderPage />} />
        <Route path="/mother/settings" element={<PlaceholderPage />} />
        <Route path="/mother/medications" element={<PlaceholderPage />} />
        <Route path="/mother/growth" element={<PlaceholderPage />} />
        <Route path="/mother/hospital" element={<PlaceholderPage />} />
        <Route path="/mother/notifications" element={<PlaceholderPage />} />
        <Route path="/mother/qr" element={<PlaceholderPage />} />

        {/* Doctor Space Routes */}
        <Route path="/doctor/dashboard" element={<DoctorDashboardPage />} />
        <Route path="/doctor/patients" element={<MyPatientsPage />} />
        <Route path="/doctor/patients/:patientId" element={<PatientCareWorkspacePage />} />
        <Route path="/doctor/appointments" element={<DoctorAppointmentsPage />} />
        <Route path="/doctor/reports" element={<DoctorReportsPage />} />
        <Route path="/doctor/care-plans" element={<DoctorCarePlansPage />} />
        <Route path="/doctor/messages" element={<DoctorPlaceholderPage />} />
        <Route path="/doctor/notifications" element={<DoctorPlaceholderPage />} />
        <Route path="/doctor/hospital" element={<DoctorHospitalPage />} />
        <Route path="/doctor/profile" element={<DoctorProfilePage />} />
        <Route path="/doctor/upload-report" element={<DoctorHospitalUploadFoundation />} />

        {/* Hospital Space Routes */}
        <Route path="/hospital/dashboard" element={<HospitalDashboardPlaceholder />} />
        <Route path="/hospital/upload-report" element={<DoctorHospitalUploadFoundation />} />

        {/* Admin Space Routes */}
        <Route path="/admin/dashboard" element={<AdminDashboardPlaceholder />} />
      </Route>

      {/* Catch-all Not Found Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
