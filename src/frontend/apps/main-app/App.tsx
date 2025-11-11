import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuthStore } from '../store/authStore';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { Layout } from '../layouts/Layout';
import { HomePage } from '../pages/HomePage';
import { VacanciesPage } from '../pages/VacanciesPage';
import { VacancyDetailPage } from '../pages/VacancyDetailPage';
import { ResumePage } from '../pages/ResumePage';
import { CompliancePage } from '../pages/CompliancePage';
import { CarbonDashboardPage } from '../pages/CarbonDashboardPage';
import { CommunityPage } from '../pages/CommunityPage';
import { ProfilePage } from '../pages/ProfilePage';
import { SettingsPage } from '../pages/SettingsPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { LoadingSpinner } from '@core/design-system/components/LoadingSpinner';
import { useRegionalSettings } from '@core/infrastructure/localisation/useRegionalSettings';
import { initTranslations } from '@core/infrastructure/localisation/i18n';
import { AccessibilityProvider } from '@core/design-system/hooks/useAccessibility';

export const App: React.FC = () => {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const { region, language } = useRegionalSettings();

  useEffect(() => {
    checkAuth();
    initTranslations(language, region);
  }, [checkAuth, language, region]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <AccessibilityProvider>
      <Layout>
        <Routes>
          <Route path="/" element={isAuthenticated ? <HomePage /> : <Navigate to="/login" replace />} />
          
          <Route 
            path="/vacancies" 
            element={
              <ProtectedRoute>
                <VacanciesPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/vacancies/:id" 
            element={
              <ProtectedRoute>
                <VacancyDetailPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/resume" 
            element={
              <ProtectedRoute>
                <ResumePage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/compliance" 
            element={
              <ProtectedRoute>
                <CompliancePage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/carbon" 
            element={
              <ProtectedRoute>
                <CarbonDashboardPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/community" 
            element={
              <ProtectedRoute>
                <CommunityPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            } 
          />
          
          <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" replace />} />
          <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/" replace />} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <ToastContainer 
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </Layout>
    </AccessibilityProvider>
  );
};
