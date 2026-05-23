import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import Splash from './pages/Splash';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Landing from './pages/Landing';
import AssetLibrary from './pages/AssetLibrary';
import ARView from './pages/ARView';
import ImageTo3D from './pages/ImageTo3D';
import TextTo3D from './pages/TextTo3D';
import ARImageView from './pages/ARImageView';
import Dashboard from './pages/Dashboard';
import HistoryPage from './pages/History';
import AuthLayout from './layouts/AuthLayout';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';

const Home = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : <Landing />;
};

function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Session check to avoid showing splash multiple times in one session
    const hasSeenSplash = sessionStorage.getItem('artisan_splash_seen');
    if (hasSeenSplash) {
      setShowSplash(false);
    }
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
    sessionStorage.setItem('artisan_splash_seen', 'true');
  };

  return (
    <AuthProvider>
      <Router>
        <AnimatePresence>
          {showSplash && <Splash key="splash" onComplete={handleSplashComplete} />}
        </AnimatePresence>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/landing" element={<Navigate to="/" replace />} />
          <Route path="/ar/:modelId" element={<ARView />} />
          <Route path="/ar-image" element={<ARImageView />} />

          {/* Auth Routes (Restricted if already logged in) */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
          </Route>

          {/* Protected App Routes (Restricted if NOT logged in) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/assets" element={<AssetLibrary />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/image-to-3d" element={<ImageTo3D />} />
            <Route path="/text-to-3d" element={<TextTo3D />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
