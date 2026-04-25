import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import GetStarted from './pages/GetStarted';
import CommandCenter from './pages/CommandCenter';
import Auth from './pages/Auth';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function ProtectedRoute({ children }) {
  const { session } = useAuth();
  if (!session) {
    return <Navigate to="/auth" />;
  }
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route path="/" element={<GetStarted />} />
            <Route path="/chat" element={<CommandCenter />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
