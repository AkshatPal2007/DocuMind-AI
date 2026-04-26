import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import GetStarted from './pages/GetStarted';
import CommandCenter from './pages/CommandCenter';
import Activity from './pages/Activity';
import Settings from './pages/Settings';
import Auth from './pages/Auth';
import Landing from './pages/Landing';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function ProtectedRoute({ children }) {
  const { session } = useAuth();
  if (!session) {
    return <Navigate to="/" replace />;
  }
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />

          <Route element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route path="/dashboard" element={<GetStarted />} />
            <Route path="/dashboard/chat" element={<CommandCenter />} />
            <Route path="/dashboard/activity" element={<Activity />} />
            <Route path="/dashboard/settings" element={<Settings />} />
            <Route path="/chat" element={<Navigate to="/dashboard/chat" replace />} />
            <Route path="/activity" element={<Navigate to="/dashboard/activity" replace />} />
            <Route path="/settings" element={<Navigate to="/dashboard/settings" replace />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
