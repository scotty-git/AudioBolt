import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './components/auth/AuthProvider';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/HomePage';
import { OnboardingBuilder } from './pages/OnboardingBuilder/OnboardingBuilder';
import { UserOnboarding } from './pages/UserOnboarding/UserOnboarding';
import { BuilderPage } from './pages/BuilderPage';
import { QuestionnairePage } from './pages/QuestionnairePage';
import { QuestionnaireSelection } from './pages/QuestionnaireSelection/QuestionnaireSelection';
import { SubmissionsPage } from './pages/SubmissionsPage';
import { TemplateManagementPage } from './pages/TemplateManagementPage/TemplateManagementPage';
import { DebugPage } from './pages/DebugPage';
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="onboarding">
                <Route path="builder" element={<OnboardingBuilder />} />
                <Route path="builder/:id" element={<OnboardingBuilder />} />
                <Route path="user" element={<UserOnboarding />} />
              </Route>
              <Route path="questionnaires">
                <Route path="builder" element={<BuilderPage />} />
                <Route path="builder/:id" element={<BuilderPage />} />
                <Route path="user" element={<QuestionnaireSelection />} />
                <Route path="user/:templateId" element={<QuestionnairePage />} />
              </Route>
              <Route path="submissions" element={<SubmissionsPage />} />
              <Route path="templates" element={<TemplateManagementPage />} />
              <Route path="debug" element={<DebugPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;