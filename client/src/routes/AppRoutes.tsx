import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import Loader from "../components/common/Loader";
import useAuth from "../hooks/useAuth";

import type { ReactNode } from "react";

// Routes are split so the first paint does not carry Recharts, react-pdf and
// every page the visitor has not navigated to. Landing stays eager: it is the
// entry point and lazy-loading it would only add a flash of the fallback.
import Landing from "../pages/Landing";
import Login from "../pages/Login";
import Signup from "../pages/Signup";

const Dashboard = lazy(() => import("../pages/Dashboard"));
const UploadPDF = lazy(() => import("../pages/UploadPDF"));
const Chat = lazy(() => import("../pages/Chat"));
const Summary = lazy(() => import("../pages/Summary"));
const MCQ = lazy(() => import("../pages/MCQ"));
const MockTest = lazy(() => import("../pages/MockTest"));
const Result = lazy(() => import("../pages/Result"));
const Analytics = lazy(() => import("../pages/Analytics"));
const Recommendations = lazy(() => import("../pages/Recommendations"));
const Profile = lazy(() => import("../pages/Profile"));
const Settings = lazy(() => import("../pages/Settings"));
const NotFound = lazy(() => import("../pages/NotFound"));

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({
  children,
}: ProtectedRouteProps) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loader fullScreen />;
  }

  return isAuthenticated ? (
    children
  ) : (
    <Navigate to="/login" replace />
  );
};

const AppRoutes = () => {
  return (
    <Suspense fallback={<Loader fullScreen />}>
    <Routes>

      {/* Public Routes */}

      <Route path="/" element={<Landing />} />

      <Route path="/login" element={<Login />} />

      <Route path="/signup" element={<Signup />} />

      {/* Protected Routes */}

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/upload"
        element={
          <ProtectedRoute>
            <UploadPDF />
          </ProtectedRoute>
        }
      />

      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        }
      />

      <Route
        path="/summary"
        element={
          <ProtectedRoute>
            <Summary />
          </ProtectedRoute>
        }
      />

      <Route
        path="/mcq"
        element={
          <ProtectedRoute>
            <MCQ />
          </ProtectedRoute>
        }
      />

      <Route
        path="/mocktest"
        element={
          <ProtectedRoute>
            <MockTest />
          </ProtectedRoute>
        }
      />

      <Route
        path="/result"
        element={
          <ProtectedRoute>
            <Result />
          </ProtectedRoute>
        }
      />

      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <Analytics />
          </ProtectedRoute>
        }
      />

      <Route
        path="/recommendations"
        element={
          <ProtectedRoute>
            <Recommendations />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />

      {/* 404 */}

      <Route path="*" element={<NotFound />} />

    </Routes>
    </Suspense>
  );
};

export default AppRoutes;