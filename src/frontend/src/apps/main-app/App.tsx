import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { VacanciesPage } from '../pages/VacanciesPage';
import { ResumesPage } from '../pages/ResumesPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { ProtectedRoute } from '../routes/ProtectedRoute';
import { MainLayout } from '../../shared/components/Layout/MainLayout';

export function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
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
    </Router>
  );
}