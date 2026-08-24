import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { PublicLayout } from '@/layouts/PublicLayout';
import { AppLayout } from '@/layouts/AppLayout';
import { LandingPage } from '@/pages/landing/LandingPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { MotherDashboardPreview } from '@/pages/dashboard/MotherDashboardPreview';
import { PregnancyPage } from '@/pages/pregnancy/PregnancyPage';
import { ReportsPage } from '@/pages/reports/ReportsPage';
import { MotherAppointmentsPage } from '@/pages/appointments/MotherAppointmentsPage';
import { MotherMedicationsPage } from '@/pages/medications/MotherMedicationsPage';
import { MotherVaccinationsPage } from '@/pages/vaccinations/MotherVaccinationsPage';
import { MotherGrowthMilestonesPage } from '@/pages/growth/MotherGrowthMilestonesPage';
import { ChildProfilePage } from '@/pages/child/ChildProfilePage';
import { MyCarePage } from '@/pages/care/MyCarePage';
import { MotherHospitalPage } from '@/pages/myHospital/MotherHospitalPage';
import { MotherDoctorPage } from '@/pages/myDoctor/MotherDoctorPage';
import { MotherNotificationsPage } from '@/pages/notifications/MotherNotificationsPage';
import { MotherQrPage } from '@/pages/qr/MotherQrPage';
import { MotherSettingsPage } from '@/pages/settings/MotherSettingsPage';
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
import { DoctorSettingsPage } from '@/pages/doctor/DoctorSettingsPage';
import { DoctorMessagesPage } from '@/pages/doctor/DoctorMessagesPage';
import { DoctorNotificationsPage } from '@/pages/doctor/DoctorNotificationsPage';
import { HospitalPlaceholderPage } from '@/pages/hospital/HospitalPlaceholderPage';
import { AdminPlaceholderPage } from '@/pages/admin/AdminPlaceholderPage';

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
        <Route path="/mother/child" element={<ChildProfilePage />} />
        <Route path="/mother/timeline" element={<MyCarePage />} />
        <Route path="/mother/vaccinations" element={<MotherVaccinationsPage />} />
        <Route path="/mother/schedule" element={<PlaceholderPage />} />
        <Route path="/mother/appointments" element={<MotherAppointmentsPage />} />
        <Route path="/mother/messages" element={<PlaceholderPage />} />
        <Route path="/mother/nutrition" element={<PlaceholderPage />} />
        <Route path="/mother/schemes" element={<PlaceholderPage />} />
        <Route path="/mother/doctor" element={<MotherDoctorPage />} />
        <Route path="/mother/settings" element={<MotherSettingsPage />} />
        <Route path="/mother/medications" element={<MotherMedicationsPage />} />
        <Route path="/mother/growth" element={<PlaceholderPage />} />
        <Route path="/mother/growth-milestones" element={<MotherGrowthMilestonesPage />} />
        <Route path="/mother/hospital" element={<MotherHospitalPage />} />
        <Route path="/mother/notifications" element={<MotherNotificationsPage />} />
        <Route path="/mother/qr" element={<MotherQrPage />} />

        {/* Doctor Space Routes */}
        <Route path="/doctor/dashboard" element={<DoctorDashboardPage />} />
        <Route path="/doctor/patients" element={<MyPatientsPage />} />
        <Route path="/doctor/patients/:patientId" element={<PatientCareWorkspacePage />} />
        <Route path="/doctor/appointments" element={<DoctorAppointmentsPage />} />
        <Route path="/doctor/reports" element={<DoctorReportsPage />} />
        <Route path="/doctor/care-plans" element={<DoctorCarePlansPage />} />
        <Route path="/doctor/messages" element={<DoctorMessagesPage />} />
        <Route path="/doctor/notifications" element={<DoctorNotificationsPage />} />
        <Route path="/doctor/hospital" element={<DoctorHospitalPage />} />
        <Route path="/doctor/profile" element={<DoctorProfilePage />} />
        <Route path="/doctor/settings" element={<DoctorSettingsPage />} />
        <Route path="/doctor/upload-report" element={<DoctorHospitalUploadFoundation />} />

        {/* Hospital Space Routes (placeholder/shell only — full Module 6 not yet implemented) */}
        <Route path="/hospital/dashboard" element={<HospitalDashboardPlaceholder />} />
        <Route path="/hospital/patients" element={<HospitalPlaceholderPage />} />
        <Route path="/hospital/deliveries" element={<HospitalPlaceholderPage />} />
        <Route path="/hospital/neonatal-care" element={<HospitalPlaceholderPage />} />
        <Route path="/hospital/beds" element={<HospitalPlaceholderPage />} />
        <Route path="/hospital/vaccines" element={<HospitalPlaceholderPage />} />
        <Route path="/hospital/referrals" element={<HospitalPlaceholderPage />} />
        <Route path="/hospital/reports" element={<HospitalPlaceholderPage />} />
        <Route path="/hospital/profile" element={<HospitalPlaceholderPage />} />
        <Route path="/hospital/settings" element={<HospitalPlaceholderPage />} />
        <Route path="/hospital/upload-report" element={<DoctorHospitalUploadFoundation />} />

        {/* Admin Space Routes (placeholder/shell only — full Module 7 not yet implemented) */}
        <Route path="/admin/dashboard" element={<AdminDashboardPlaceholder />} />
        <Route path="/admin/program-overview" element={<AdminPlaceholderPage />} />
        <Route path="/admin/facilities" element={<AdminPlaceholderPage />} />
        <Route path="/admin/maternal-analytics" element={<AdminPlaceholderPage />} />
        <Route path="/admin/immunization" element={<AdminPlaceholderPage />} />
        <Route path="/admin/high-risk-monitoring" element={<AdminPlaceholderPage />} />
        <Route path="/admin/reports" element={<AdminPlaceholderPage />} />
        <Route path="/admin/alerts" element={<AdminPlaceholderPage />} />
        <Route path="/admin/settings" element={<AdminPlaceholderPage />} />
        <Route path="/admin/profile" element={<AdminPlaceholderPage />} />
      </Route>

      {/* Catch-all Not Found Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
