import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/auth';
import { LoadingScreen } from './components/auth/LoadingScreen';
import { AuthPortal } from './components/auth/AuthPortal';
import { SignupPage } from './pages/SignupPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { VerifyEmailPage } from './pages/VerifyEmailPage';
import { MFASetupPage } from './pages/MFASetupPage';
import { MFAVerifyPage } from './pages/MFAVerifyPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProtectedRoute } from './components/routes/ProtectedRoute';
import styles from './App.module.scss';

function App() {
  const { isInitializing, initialize } = useAuthStore();
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (isInitializing || showLoading) {
    return <LoadingScreen onComplete={() => setShowLoading(false)} />;
  }

  return (
    <BrowserRouter>
      <div className={styles.app} data-theme="light">
        <Routes>
          <Route path="/" element={<AuthPortal />} />
          <Route path="/login" element={<AuthPortal />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
          <Route path="/mfa/setup" element={<MFASetupPage />} />
          <Route path="/mfa/verify" element={<MFAVerifyPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
