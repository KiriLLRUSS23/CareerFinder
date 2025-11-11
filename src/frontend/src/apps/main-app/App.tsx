import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import '@core/i18n/i18n';
import { MainLayout } from '@shared/components/Layout/MainLayout';
import { ErrorBoundary } from '@shared/components/Common/ErrorBoundary';
import { ProtectedRoute } from '@apps/main-app/routes/ProtectedRoute';

// Pages
import { LoginPage } from '@apps/main-app/pages/LoginPage';
import { DashboardPage } from '@apps/main-app/pages/DashboardPage';
import { VacanciesPage } from '@apps/main-app/pages/VacanciesPage';
import { ResumesPage } from '@apps/main-app/pages/ResumesPage';
import { NotFoundPage } from '@apps/main-app/pages/NotFoundPage';

export const App: React.FC = () => {
  useEffect(() => {
    document.documentElement.lang = 'ru';
  }, []);

  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Navigate to="/dashboard" replace />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <MainLayout>
                <DashboardPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/vacancies"
          element={
            <ProtectedRoute>
              <MainLayout>
                <VacanciesPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/resumes"
          element={
            <ProtectedRoute>
              <MainLayout>
                <ResumesPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </ErrorBoundary>
  );
};