import { Routes, Route, Navigate } from 'react-router';
import LandingPage from './pages/LandingPage.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import { useDispatch, useSelector } from 'react-redux';
import { checkAuth } from './authSlice.js';
import { lazy, Suspense, useEffect } from 'react';
import { hasSessionHint } from './utils/sessionAuthHint.js';

const Homepage = lazy(() => import('./pages/Homepage.jsx'));
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const FavoriteLists = lazy(() => import('./pages/FavoriteLists.jsx'));
const AdminPanel = lazy(() => import('./components/AdminPanel.jsx'));
const ProblemPage = lazy(() => import('./pages/ProblemPage.jsx'));
const Admin = lazy(() => import('./pages/Admin.jsx'));
const AdminVideo = lazy(() => import('./components/AdminVideo.jsx'));
const AdminDelete = lazy(() => import('./components/AdminDelete.jsx'));
const AdminUpload = lazy(() => import('./components/AdminUpload.jsx'));
const AdminUpdate = lazy(() => import('./components/AdminUpdate.jsx'));
const AdminUpdateForm = lazy(() => import('./components/AdminUpdateForm.jsx'));
const PremiumPlans = lazy(() => import('./pages/PremiumPlans.jsx'));
const Assessments = lazy(() => import('./pages/Assessments.jsx'));
const AssessmentPage = lazy(() => import('./pages/AssessmentPage.jsx'));
const AssessmentReport = lazy(() => import('./pages/AssessmentReport.jsx'));
const PointActivityPage = lazy(() => import('./pages/PointActivityPage.jsx'));
const MissionsPage = lazy(() => import('./pages/MissionsPage.jsx'));
const StorePage = lazy(() => import('./pages/StorePage.jsx'));
const OrderPage = lazy(() => import('./pages/OrderPage.jsx'));
const OrderTrackPage = lazy(() => import('./pages/OrderTrackPage.jsx'));
const OrderHistoryPage = lazy(() => import('./pages/OrderHistoryPage.jsx'));
const AdminCustomerOrdersPage = lazy(
  () => import('./pages/AdminCustomerOrdersPage.jsx')
);
const BadgesPage = lazy(() => import('./pages/BadgesPage.jsx'));
const ContestPage = lazy(() => import('./pages/ContestPage.jsx'));
const ContestRegisterPage = lazy(() => import('./pages/ContestRegisterPage.jsx'));
const ContestLivePage = lazy(() => import('./pages/ContestLivePage.jsx'));
const ContestReportPage = lazy(() => import('./pages/ContestReportPage.jsx'));
const AdminContestPage = lazy(() => import('./pages/AdminContestPage.jsx'));
const SettingsPage = lazy(() => import('./pages/SettingsPage.jsx'));
const ResetPassword = lazy(() => import('./pages/ResetPassword.jsx'));

function RouteFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200/30">
      <span className="loading loading-spinner loading-md opacity-50" />
    </div>
  );
}

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, user, authCheckPending } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  const showHomepage =
    isAuthenticated || (authCheckPending && hasSessionHint());

  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route
          path="/"
          element={showHomepage ? <Homepage /> : <LandingPage />}
        />
        <Route
          path="/home"
          element={
            isAuthenticated ? <Homepage /> : <Navigate to="/" replace />
          }
        />
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/" replace /> : <Login />
          }
        />
        <Route
          path="/signup"
          element={
            isAuthenticated ? <Navigate to="/" replace /> : <Signup />
          }
        />
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/favorites"
          element={
            isAuthenticated ? (
              <FavoriteLists />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/premium"
          element={
            isAuthenticated ? <PremiumPlans /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/admin"
          element={
            isAuthenticated && user?.role === 'admin' ? (
              <Admin />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/admin/create"
          element={
            isAuthenticated && user?.role === 'admin' ? (
              <AdminPanel />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/admin/delete"
          element={
            isAuthenticated && user?.role === 'admin' ? (
              <AdminDelete />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/admin/video"
          element={
            isAuthenticated && user?.role === 'admin' ? (
              <AdminVideo />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/admin/upload/:problemId"
          element={
            isAuthenticated && user?.role === 'admin' ? (
              <AdminUpload />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/admin/update"
          element={
            isAuthenticated && user?.role === 'admin' ? (
              <AdminUpdate />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/admin/update/:problemId"
          element={
            isAuthenticated && user?.role === 'admin' ? (
              <AdminUpdateForm />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route path="/problem/:problemId" element={<ProblemPage />} />
        <Route
          path="/assessments"
          element={
            isAuthenticated ? <Assessments /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/assessment/:assessmentId"
          element={
            isAuthenticated ? (
              <AssessmentPage />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/assessment/:assessmentId/report/:submissionId"
          element={
            isAuthenticated ? (
              <AssessmentReport />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/points"
          element={
            isAuthenticated ? (
              <PointActivityPage />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/missions"
          element={
            isAuthenticated ? <MissionsPage /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/store"
          element={
            isAuthenticated ? <StorePage /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/contest"
          element={
            isAuthenticated ? <ContestPage /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/contest/:contestId/register"
          element={
            isAuthenticated ? (
              <ContestRegisterPage />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/contest/:contestId/live"
          element={
            isAuthenticated ? (
              <ContestLivePage />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/contest/:contestId/report"
          element={
            isAuthenticated ? (
              <ContestReportPage />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/order"
          element={
            isAuthenticated ? <OrderPage /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/order-track"
          element={
            isAuthenticated ? (
              <OrderTrackPage />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/orders"
          element={
            isAuthenticated ? (
              <OrderHistoryPage />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/badges"
          element={
            isAuthenticated ? <BadgesPage /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/admin/orders"
          element={
            isAuthenticated && user?.role === 'admin' ? (
              <AdminCustomerOrdersPage />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/admin/contest"
          element={
            isAuthenticated && user?.role === 'admin' ? (
              <AdminContestPage />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/settings"
          element={
            isAuthenticated ? <SettingsPage /> : <Navigate to="/login" replace />
          }
        />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Routes>
    </Suspense>
  );
}

export default App;
